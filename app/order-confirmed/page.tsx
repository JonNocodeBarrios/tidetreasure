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
import { CheckCircle, Package, Truck, Clock, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react"

export default function OrderConfirmedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    const fetchOrderData = async () => {
      let targetOrderId = orderId

      // If no orderId in URL, try to get from localStorage
      if (!targetOrderId) {
        try {
          const lastOrderData = localStorage.getItem("tidetreasures-last-order")
          if (lastOrderData) {
            const parsed = JSON.parse(lastOrderData)
            // Only use if it's recent (within last 30 minutes)
            if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
              targetOrderId = parsed.orderId
            }
          }
        } catch (error) {
          console.error("Error reading from localStorage:", error)
        }
      }

      if (!targetOrderId) {
        setShowFallback(true)
        setLoading(false)
        return
      }

      try {
        const orderData = await getOrderById(targetOrderId)
        if (orderData) {
          setOrder(orderData)
          // Clear localStorage after successful fetch
          localStorage.removeItem("tidetreasures-last-order")
        } else {
          setShowFallback(true)
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        setShowFallback(true)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrderData()
    }
  }, [user, authLoading, orderId, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show fallback when no order is found
  if (showFallback || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Recent Order Found</h1>
            <p className="text-gray-600 mb-8 text-lg">
              We couldn't find a recent order to display. This might happen if you accessed this page directly or if too
              much time has passed since your order.
            </p>
            <div className="space-y-4">
              <Link href="/account">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-3 rounded-full">
                  View Order History
                </Button>
              </Link>
              <div>
                <Link href="/products">
                  <Button variant="outline" className="px-8 py-3 rounded-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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
          {/* Thank You Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your order has been successfully placed and is being processed. We'll send you updates as your ocean
              treasures make their way to you.
            </p>
          </div>

          {/* Order Summary Card */}
          <Card className="mb-8 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center">
                <Package className="w-6 h-6 mr-3" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Date</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-cyan-600">${orderTotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
                  Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              {/* Order Items Summary */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered ({orderItems.length})</h3>
                <div className="space-y-3">
                  {orderItems.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {orderItems.length > 3 && (
                    <p className="text-sm text-gray-500 text-center py-2">+{orderItems.length - 3} more items</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Timeline */}
          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Order Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmed</p>
                    <p className="text-sm text-gray-600">Your order has been received and confirmed</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Processing</p>
                    <p className="text-sm text-gray-600">We're preparing your items for shipment</p>
                  </div>
                </div>

                <div className="flex items-center opacity-50">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Shipped</p>
                    <p className="text-sm text-gray-600">Your order is on its way</p>
                  </div>
                </div>

                <div className="flex items-center opacity-50">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivered</p>
                    <p className="text-sm text-gray-600">Package delivered to your address</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next Section */}
          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">What happens next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <p>• You'll receive an email confirmation shortly</p>
                  <p>• Your order has been simulated to our suppliers</p>
                  <p>• We'll notify you when your items ship</p>
                </div>
                <div className="space-y-2">
                  <p>• Track your order status in your account</p>
                  <p>• Payment integration coming in future updates</p>
                  <p>• Contact support if you have any questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/account">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 rounded-full"
              >
                View Order History
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="px-8 py-4 rounded-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
