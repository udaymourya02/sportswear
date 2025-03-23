import Link from "next/link"
import { CheckCircle2, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface OrderConfirmationPageProps {
  params: {
    orderId: string
  }
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = params

  // In a real app, you would fetch the order details from your API
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription>
            Thank you for your order. Your order number is <span className="font-medium">{orderId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Order Date</h3>
                <p className="text-sm text-muted-foreground">{orderDate}</p>
              </div>
              <div className="text-right">
                <h3 className="font-medium">Order Total</h3>
                <p className="text-sm text-muted-foreground">$174.97</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium">Shipping Address</h3>
              <p className="text-sm text-muted-foreground">
                John Doe
                <br />
                123 Main St
                <br />
                New York, NY 10001
                <br />
                United States
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium">Payment Method</h3>
              <p className="text-sm text-muted-foreground">Credit Card ending in 3456</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Order Placed</h4>
                  <p className="text-sm text-muted-foreground">{orderDate}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Processing</h4>
                  <p className="text-sm text-muted-foreground">Your order is being processed</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Estimated Delivery</h4>
                  <p className="text-sm text-muted-foreground">{estimatedDelivery}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4 border-b">
              <h3 className="font-medium">Order Items</h3>
            </div>
            <div className="divide-y">
              <div className="p-4 flex justify-between">
                <div>
                  <p className="font-medium">Performance Running Jacket</p>
                  <p className="text-sm text-muted-foreground">Size: M | Color: Black</p>
                  <p className="text-sm text-muted-foreground">Quantity: 1</p>
                </div>
                <p className="font-medium">$89.99</p>
              </div>
              <div className="p-4 flex justify-between">
                <div>
                  <p className="font-medium">Pro Training Shorts</p>
                  <p className="text-sm text-muted-foreground">Size: L | Color: Gray</p>
                  <p className="text-sm text-muted-foreground">Quantity: 2</p>
                </div>
                <p className="font-medium">$69.98</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/account/orders">View All Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

