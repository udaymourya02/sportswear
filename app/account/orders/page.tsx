"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
// import { useRouter } from "next/navigation" // Unused variable
import { Package, Truck, CheckCircle, Clock, AlertTriangle, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "components/ui/card"
import { Separator } from "components/ui/separator"
import { Badge } from "components/ui/badge"
import { useAuth } from "contexts/auth-context"
import { ordersAPI } from "lib/api"
import { useToast } from "hooks/use-toast"

interface Order {
  _id: string
  items: { name: string; quantity: number; price: number }[]
  status: string
  total: number
  createdAt: string
  statusHistory: {
    status: string
    date: string
    note: string
  }[]
  trackingNumber?: string
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)
        const { orders } = await ordersAPI.getMyOrders()
        setOrders(orders)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isClient) {
      fetchOrders()
    }
  }, [user, toast, isClient])

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Please sign in to view your orders</p>
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
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order._id.substring(0, 8)}</CardTitle>
                    <CardDescription>Placed on {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center">{getStatusBadge(order.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <div className="ml-3">
                      <p className="font-medium">
                        Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}&apos;
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.status === "shipped" && order.trackingNumber
                          ? `Tracking Number: ${order.trackingNumber}`
                          : order.statusHistory[order.statusHistory.length - 1]?.note || "Processing your order"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">Items</h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                          </div>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${order._id}`}>
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                {order.status === "pending" && (
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                    Cancel Order
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
