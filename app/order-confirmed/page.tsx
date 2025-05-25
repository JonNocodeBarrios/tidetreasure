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
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    let orderIdToFetch = orderId

    // If no orderId in URL, try to get from localStorage
    if (!orderIdToFetch) {
      const lastOrderId = localStorage.getItem("lastOrderId")
      const lastOrderTimestamp = localStorage.getItem("lastOrderTimestamp")

      // Only use localStorage order if it's recent (within last 10 minutes)
      if (lastOrderId && lastOrderTimestamp) {
        const timeDiff = Date.now() - Number.parseInt(lastOrderTimestamp)
        const tenMinutes = 10 * 60 * 1000

        if (timeDiff < tenMinutes) {
          orderIdToFetch = lastOrderId
          // Update URL to include order ID
          router.replace(`/order-confirmed?orderId=${lastOrderId}`)
        }
      }
    }

    if (!orderIdToFetch) {
      // No recent order found, redirect to products
      router.push("/products")
      return
    }

    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(orderIdToFetch!)
        setOrder(orderData)

        // Clear localStorage after successful fetch
        localStorage.removeItem("lastOrderId")
        localStorage.removeItem("lastOrderTimestamp")
      } catch (error) {
        console.error("Error fetching order:", error)
        // If order fetch fails, redirect to products
        router.push("/products")
      } finally {
        setLoading(false)
      }
    }

    if (orderIdToFetch) {
      fetchOrder()
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

  if (!user || (!order && !loading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Recent Order Found</h2>
            <p className="text-gray-600 mb-8">
              We couldn't find a recent order to display. This might happen if you accessed this page directly or after
              a long period of time.
            </p>
            <div className="space-y-4">
              <Link href="/products">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/account">
                <Button variant="outline" className="w-full">
                  View Order History
                </Button>
              </Link>
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
          {/* Success Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
            <p className="text-xl text-gray-600 mb-2">
              Your order has been successfully placed and is being processed.
            </p>
            <p className="text-lg text-gray-500">
              Order #{order.id.slice(0, 8).toUpperCase()} • ${Number(order.total).toFixed(2)} •{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
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
