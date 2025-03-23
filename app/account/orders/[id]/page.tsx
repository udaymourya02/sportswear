"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { ordersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface OrderPageProps {
  params: {
    id: string
  }
}

export default function OrderDetailPage({ params }: OrderPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)
        const { order } = await ordersAPI.getOrderById(params.id)
        setOrder(order)
      } catch (error) {
        console.error("Failed to fetch order:", error)
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isClient) {
      fetchOrder()
    }
  }, [user, params.id, toast, isClient])

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Order Details</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Please sign in to view order details</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container py-10">
      <Link href="/account/orders" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Link>

      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      ) : !order ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Order not found</p>
            <Button asChild>
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Order #{order._id.substring(0, 8)}</CardTitle>
                    <CardDescription>Placed on {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="mt-2 sm:mt-0">{getStatusBadge(order.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Status Timeline */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Order Status</h3>
                    <div className="space-y-4">
                      {order.statusHistory.map((status: any, index: number) => (
                        <div key={index} className="flex items-start">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {getStatusIcon(status.status)}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-medium">
                              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                            </h4>
                            <p className="text-sm text-muted-foreground">{new Date(status.date).toLocaleString()}</p>
                            {status.note && <p className="text-sm mt-1">{status.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Information */}
                  <div>
                    <h3 className="font-medium mb-3">Shipping Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-md border p-4">
                        <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                        <p className="text-sm">{order.shippingAddress.street}</p>
                        <p className="text-sm">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p className="text-sm">{order.shippingAddress.country}</p>
                      </div>

                      <div className="rounded-md border p-4">
                        <h4 className="text-sm font-medium mb-2">Billing Address</h4>
                        <p className="text-sm">{order.billingAddress.street}</p>
                        <p className="text-sm">
                          {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                        </p>
                        <p className="text-sm">{order.billingAddress.country}</p>
                      </div>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="rounded-md border p-4 bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Tracking Information</h4>
                      <p className="text-sm">Tracking Number: {order.trackingNumber}</p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                        Track Package
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Payment Information</h4>
                  <p className="text-sm">
                    Method: {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                  </p>
                  {order.paymentResult && <p className="text-sm">Status: {order.paymentResult.status}</p>}
                </div>
              </CardContent>
              <CardFooter>
                {order.status === "pending" && (
                  <Button variant="destructive" className="w-full">
                    Cancel Order
                  </Button>
                )}
                {order.status === "delivered" && <Button className="w-full">Write a Review</Button>}
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full">
                  Return Items
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

