"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Minus, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, subtotal, itemCount } = useCart()
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const shipping = 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Alert className="max-w-md">
            <AlertDescription>
              Please{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                sign in
              </Link>{" "}
              to view your cart
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-6">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your cart...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Cart Items ({itemCount})</h2>
              </div>
              <Separator />

              {items.map((item) => (
                <div key={item._id} className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/product/${item.product.slug}`}>
                            <h3 className="font-medium hover:text-primary transition-colors">{item.product.name}</h3>
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <p className="font-medium">${item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-md"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loading}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                          </Button>
                          <div className="flex h-8 w-10 items-center justify-center border-y">{item.quantity}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-md"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={loading}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => removeItem(item._id)}
                          disabled={loading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-6" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-lg border">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-medium">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Shipping</p>
                    <p className="font-medium">${shipping.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Tax</p>
                    <p className="font-medium">${tax.toFixed(2)}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <p className="font-semibold">Total</p>
                    <p className="font-semibold">${total.toFixed(2)}</p>
                  </div>
                </div>
                <Button className="mt-6 w-full" size="lg" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>or</p>
                  <Button asChild variant="link" className="p-0">
                    <Link href="/products">
                      Continue Shopping <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border p-6">
              <h3 className="font-semibold">Have a promo code?</h3>
              <div className="mt-2 flex">
                <Input placeholder="Enter code" className="rounded-r-none" />
                <Button className="rounded-l-none">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

