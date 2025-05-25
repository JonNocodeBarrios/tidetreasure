"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!authLoading && !user) {
        router.push("/login")
        return
      }

      // Try to get order ID from URL params or sessionStorage
      let targetOrderId = orderId

      if (!targetOrderId) {
        // Check sessionStorage for recent order
        const recentOrderId = sessionStorage.getItem("recent-order-id")
        if (recentOrderId) {
          targetOrderId = recentOrderId
          // Update URL to include the order ID
          router.replace(`/order-confirmed?orderId=${recentOrderId}`)
        }
      }

      if (!targetOrderId) {
        setError("no-order-id")
        setLoading(false)
        return
      }

      try {
        const orderData = await getOrderById(targetOrderId)

        if (!orderData) {
          setError("order-not-found")
          setLoading(false)
          return
        }

        // Verify the order belongs to the current user
        if (orderData.user_id !== user?.id) {
          setError("unauthorized")
          setLoading(false)
          return
        }

        setOrder(orderData)

        // Clear the sessionStorage since we've successfully loaded the order
        sessionStorage.removeItem("recent-order-id")
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("fetch-error")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [user, authLoading, orderId, router])

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error states
  if (error) {
    const getErrorContent = () => {
      switch (error) {
        case "no-order-id":
          return {
            title: "No Recent Order Found",
            message: "We couldn't find a recent order to display. Please check your account for order history.",
            action: { text: "View Account", href: "/account" },
          }
        case "order-not-found":
          return {
            title: "Order Not Found",
            message: "The order you're looking for doesn't exist or may have been removed.",
            action: { text: "View Order History", href: "/account" },
          }
        case "unauthorized":
          return {
            title: "Access Denied",
            message: "You don't have permission to view this order.",
            action: { text: "Go to Home", href: "/" },
          }
        default:
          return {
            title: "Something Went Wrong",
            message: "We encountered an error while loading your order details.",
            action: { text: "Try Again", href: "/account" },
          }
      }
    }

    const errorContent = getErrorContent()

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{errorContent.title}</h2>
                <p className="text-gray-600 mb-6">{errorContent.message}</p>
                <div className="space-y-3">
                  <Link href={errorContent.action.href}>
                    <Button className="w-full">{errorContent.action.text}</Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return null
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
              Your order has been confirmed and is being processed. We'll send you updates as your order progresses.
            </p>
          </div>

          {/* Order Summary Card */}
          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-center text-2xl text-gray-900">Order Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-green-600">${orderTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Date</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Status Timeline */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
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
                      <p className="text-sm text-gray-600">Your order has been received and confirmed</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Processing</p>
                      <p className="text-sm text-gray-600">Preparing your items for shipment</p>
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
                      <p className="text-sm text-gray-600">Package delivered to your address</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-cyan-600">1</span>
                    </div>
                    <p>You'll receive an email confirmation within the next few minutes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-cyan-600">2</span>
                    </div>
                    <p>Your order will be processed and prepared for shipping</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-cyan-600">3</span>
                    </div>
                    <p>You'll receive shipping updates via email with tracking information</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-cyan-600">4</span>
                    </div>
                    <p>Track your order status anytime in your account dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items Summary */}
          <Card className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle>Order Items ({orderItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
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
                      <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 mt-8 justify-center animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Link href="/products">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/account">
              <Button size="lg" className="min-w-[200px] flex items-center">
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
