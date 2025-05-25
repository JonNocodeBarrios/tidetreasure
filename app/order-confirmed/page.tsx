"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getOrderById, type Order } from "@/lib/orders"
import { CheckCircle, Package, Truck, Clock, ArrowRight, ShoppingBag } from "lucide-react"

export default function OrderConfirmedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleOrderConfirmation = async () => {
      if (!authLoading && !user) {
        router.push("/login")
        return
      }

      // Get order ID from URL params or localStorage
      const orderIdToFetch = orderId || localStorage.getItem("lastOrderId")

      if (!orderIdToFetch) {
        // No order ID available, redirect to products
        router.push("/products")
        return
      }

      try {
        const orderData = await getOrderById(orderIdToFetch)

        if (!orderData) {
          // Order not found or not accessible, redirect to products
          router.push("/products")
          return
        }

        // Verify this order belongs to the current user
        if (orderData.user_id !== user?.id) {
          router.push("/products")
          return
        }

        setOrder(orderData)

        // Clear the stored order ID since we've successfully displayed it
        if (localStorage.getItem("lastOrderId") === orderIdToFetch) {
          localStorage.removeItem("lastOrderId")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        router.push("/products")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      handleOrderConfirmation()
    }
  }, [user, authLoading, orderId, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!user || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Recent Order Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn't find a recent order to display. This page is only accessible after placing an order.
              </p>
              <div className="space-y-3">
                <Link href="/products">
                  <Button className="w-full">Browse Products</Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline" className="w-full">
                    View Order History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const orderTotal = Number(order.total)
  const orderItems = order.items || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your order has been successfully placed and is being processed. We'll send you updates as your order
              progresses.
            </p>
            <div className="mt-6 p-4 bg-green-50 rounded-lg inline-block">
              <p className="text-green-800 font-medium">
                Order Total: <span className="text-2xl font-bold">${orderTotal.toFixed(2)}</span>
              </p>
              <p className="text-green-700 text-sm mt-1">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Number</span>
                  <span className="font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Date</span>
                  <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg">${orderTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="text-sm">{orderItems.length} products</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-600">Your order has been received</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Processing</p>
                      <p className="text-sm text-gray-600">Preparing for shipment</p>
                    </div>
                  </div>

                  <div className="flex items-center opacity-50">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Shipped</p>
                      <p className="text-sm text-gray-600">Your order is on its way</p>
                    </div>
                  </div>

                  <div className="flex items-center opacity-50">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">Package delivered</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• You'll receive an email confirmation shortly</p>
                <p>• Your order has been simulated to our suppliers</p>
                <p>• Payment integration will be added in future updates</p>
                <p>• You can track your order status in your account</p>
                <p>• Questions? Contact our support team anytime</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/account">
              <Button size="lg" className="flex items-center">
                View Order History
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
