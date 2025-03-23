"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, CreditCard, Loader2, MapPin, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { paymentsAPI, ordersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const steps = [
  { id: "shipping", label: "Shipping", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirmation", label: "Confirmation", icon: CheckCircle2 },
]

interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState("shipping")
  const [isLoading, setIsLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [isClient, setIsClient] = useState(false)

  // Shipping information
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })

  // Billing information
  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })

  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")

  // Calculate order totals
  const shipping = shippingMethod === "express" ? 12.99 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)

    // Redirect if cart is empty
    if (items.length === 0 && isClient) {
      router.push("/cart")
    }

    // Pre-fill address if user has one
    if (user?.addresses?.length) {
      const defaultShipping = user.addresses.find((addr) => addr.type === "shipping" && addr.isDefault)
      if (defaultShipping) {
        setShippingAddress({
          street: defaultShipping.street,
          city: defaultShipping.city,
          state: defaultShipping.state,
          zipCode: defaultShipping.zipCode,
          country: defaultShipping.country,
        })
      }

      const defaultBilling = user.addresses.find((addr) => addr.type === "billing" && addr.isDefault)
      if (defaultBilling) {
        setBillingAddress({
          street: defaultBilling.street,
          city: defaultBilling.city,
          state: defaultBilling.state,
          zipCode: defaultBilling.zipCode,
          country: defaultBilling.country,
        })
        setSameAsShipping(false)
      }
    }
  }, [user, items.length, isClient, router])

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingAddress((prev) => ({ ...prev, [name]: value }))

    // Update billing address if same as shipping
    if (sameAsShipping) {
      setBillingAddress((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBillingAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    if (currentStep === "shipping") {
      // Validate shipping information
      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
        toast({
          title: "Missing information",
          description: "Please fill in all shipping information",
          variant: "destructive",
        })
        return
      }
      setCurrentStep("payment")
    } else if (currentStep === "payment") {
      setCurrentStep("confirmation")
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("shipping")
    } else if (currentStep === "confirmation") {
      setCurrentStep("payment")
    }
  }

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true)

      // Create order in database
      const orderData = {
        items: items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.product.images[0],
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        clearCart: true,
      }

      const { order } = await ordersAPI.createOrder(orderData)

      // Create Razorpay order
      const { order: razorpayOrder } = await paymentsAPI.createRazorpayOrder(total, `order_${order._id}`)

      // Load Razorpay script
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "SportsFit",
          description: "Purchase from SportsFit",
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            try {
              // Verify payment
              await paymentsAPI.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              })

              // Clear cart and show success
              await clearCart()
              setOrderNumber(order._id)
              setOrderComplete(true)
            } catch (error) {
              console.error("Payment verification failed:", error)
              toast({
                title: "Payment failed",
                description: "There was an issue with your payment. Please try again.",
                variant: "destructive",
              })
            }
          },
          prefill: {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
          },
          theme: {
            color: "#0062FF",
          },
        }

        // @ts-ignore
        const razorpayInstance = new window.Razorpay(options)
        razorpayInstance.open()
      }

      script.onerror = () => {
        toast({
          title: "Payment error",
          description: "Failed to load payment gateway. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order failed",
        description: "There was an issue placing your order. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 animate-fade-in">
          {/* Stepper */}
          <div className="hidden md:block">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {steps.map((step, stepIdx) => (
                  <li key={step.id} className={`relative ${stepIdx === steps.length - 1 ? "flex-1" : "flex-1"}`}>
                    {currentStep === step.id ? (
                      <div className="flex items-center" aria-current="step">
                        <span className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                          <step.icon className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                        </span>
                        <span className="ml-2 text-sm font-medium">{step.label}</span>
                      </div>
                    ) : currentStep === steps[stepIdx + 1]?.id ||
                      currentStep === steps[stepIdx + 2]?.id ||
                      (currentStep === "confirmation" && orderComplete) ? (
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full">
                          <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" />
                        </span>
                        <span className="ml-2 text-sm font-medium text-muted-foreground">{step.label}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 border border-muted rounded-full">
                          <step.icon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                        </span>
                        <span className="ml-2 text-sm font-medium text-muted-foreground">{step.label}</span>
                      </div>
                    )}

                    {stepIdx !== steps.length - 1 && (
                      <div className="hidden md:block absolute top-4 left-0 w-full">
                        <div className="h-0.5 w-full bg-muted" />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Checkout Steps */}
          {!orderComplete ? (
            <div className="space-y-6">
              {currentStep === "shipping" && (
                <Card className="animate-slide-in-bottom">
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Enter your shipping details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" defaultValue={user?.firstName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" defaultValue={user?.lastName} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">Address</Label>
                      <Input
                        id="street"
                        name="street"
                        placeholder="123 Main St"
                        value={shippingAddress.street}
                        onChange={handleShippingChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="New York"
                          value={shippingAddress.city}
                          onChange={handleShippingChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select
                          value={shippingAddress.state}
                          onValueChange={(value) => setShippingAddress((prev) => ({ ...prev, state: value }))}
                        >
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          placeholder="10001"
                          value={shippingAddress.zipCode}
                          onChange={handleShippingChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={shippingAddress.country}
                          onValueChange={(value) => setShippingAddress((prev) => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" placeholder="(123) 456-7890" />
                    </div>
                    <div className="space-y-2">
                      <Label>Shipping Method</Label>
                      <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-2">
                        <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="font-normal">
                              Standard Shipping (3-5 business days)
                            </Label>
                          </div>
                          <div className="text-sm font-medium">$5.99</div>
                        </div>
                        <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="express" id="express" />
                            <Label htmlFor="express" className="font-normal">
                              Express Shipping (1-2 business days)
                            </Label>
                          </div>
                          <div className="text-sm font-medium">$12.99</div>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push("/cart")}>
                      Back to Cart
                    </Button>
                    <Button onClick={handleNextStep} className="btn-hover-slide">
                      Continue to Payment
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {currentStep === "payment" && (
                <Card className="animate-slide-in-bottom">
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Enter your payment details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="card" className="w-full" value={paymentMethod} onValueChange={setPaymentMethod}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="card">Credit Card</TabsTrigger>
                        <TabsTrigger value="paypal">PayPal</TabsTrigger>
                        <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
                      </TabsList>
                      <TabsContent value="card" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on card</Label>
                          <Input id="cardName" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiration">Expiration date</Label>
                            <Input id="expiration" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="paypal" className="pt-4">
                        <div className="flex flex-col items-center justify-center space-y-4 py-8">
                          <div className="text-center">
                            <p>You will be redirected to PayPal to complete your payment.</p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="razorpay" className="pt-4">
                        <div className="flex flex-col items-center justify-center space-y-4 py-8">
                          <div className="text-center">
                            <p>You will be redirected to Razorpay to complete your payment.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Razorpay supports credit/debit cards, UPI, and bank transfers.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="space-y-2">
                      <Label htmlFor="billingAddress">Billing Address</Label>
                      <RadioGroup
                        value={sameAsShipping ? "same" : "different"}
                        onValueChange={(value) => setSameAsShipping(value === "same")}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2 rounded-md border p-4">
                          <RadioGroupItem value="same" id="same" />
                          <Label htmlFor="same" className="font-normal">
                            Same as shipping address
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-md border p-4">
                          <RadioGroupItem value="different" id="different" />
                          <Label htmlFor="different" className="font-normal">
                            Use a different billing address
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {!sameAsShipping && (
                      <div className="space-y-4 border rounded-md p-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingStreet">Street</Label>
                          <Input
                            id="billingStreet"
                            name="street"
                            value={billingAddress.street}
                            onChange={handleBillingChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              name="city"
                              value={billingAddress.city}
                              onChange={handleBillingChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingState">State</Label>
                            <Select
                              value={billingAddress.state}
                              onValueChange={(value) => setBillingAddress((prev) => ({ ...prev, state: value }))}
                            >
                              <SelectTrigger id="billingState">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NY">New York</SelectItem>
                                <SelectItem value="CA">California</SelectItem>
                                <SelectItem value="TX">Texas</SelectItem>
                                <SelectItem value="FL">Florida</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingZipCode">ZIP code</Label>
                            <Input
                              id="billingZipCode"
                              name="zipCode"
                              value={billingAddress.zipCode}
                              onChange={handleBillingChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingCountry">Country</Label>
                            <Select
                              value={billingAddress.country}
                              onValueChange={(value) => setBillingAddress((prev) => ({ ...prev, country: value }))}
                            >
                              <SelectTrigger id="billingCountry">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      Back to Shipping
                    </Button>
                    <Button onClick={handleNextStep} className="btn-hover-slide">
                      Review Order
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {currentStep === "confirmation" && (
                <Card className="animate-slide-in-bottom">
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                    <CardDescription>Please review your order before placing it</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Shipping Information</h3>
                      <div className="rounded-md border p-4 text-sm">
                        <p>
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p>{shippingAddress.street}</p>
                        <p>
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                        </p>
                        <p>{shippingAddress.country}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <div className="rounded-md border p-4 text-sm">
                        <p>
                          {paymentMethod === "card"
                            ? "Credit Card"
                            : paymentMethod === "paypal"
                              ? "PayPal"
                              : "Razorpay"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Items</h3>
                      <div className="rounded-md border divide-y">
                        {items.map((item) => (
                          <div key={item._id} className="p-4 flex justify-between">
                            <div className="flex items-center">
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground ml-2">x{item.quantity}</div>
                            </div>
                            <div className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      Back to Payment
                    </Button>
                    <Button onClick={handlePlaceOrder} disabled={isLoading} className="btn-hover-slide">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          ) : (
            <Card className="animate-fade-in">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
                <CardDescription>
                  Thank you for your order. Your order number is <span className="font-medium">{orderNumber}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  We've sent a confirmation email to your email address. You can track your order status in your
                  account.
                </p>
                <div className="rounded-md border p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => router.push("/")} className="btn-hover-slide">
                  Continue Shopping
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <span>{item.product.name}</span>
                    <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                  </div>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

