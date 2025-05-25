"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { createOrder } from "@/lib/orders"
import { Loader2, CreditCard, ShoppingCart, AlertCircle, CheckCircle } from "lucide-react"

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [orderCompleted, setOrderCompleted] = useState(false)
  const isProcessingOrder = useRef(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout")
    }
  }, [user, authLoading, router])

  // Redirect if cart is empty (but not if we just completed an order)
  useEffect(() => {
    if (!authLoading && items.length === 0 && !orderCompleted && !isProcessingOrder.current) {
      console.log("Redirecting to cart - no items and no order completed")
      router.push("/cart")
    }
  }, [items, authLoading, router, orderCompleted])

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) {
      setError("Unable to place order. Please ensure you're logged in and have items in your cart.")
      return
    }

    setIsProcessing(true)
    setError("")
    isProcessingOrder.current = true

    try {
      console.log("Starting order creation process...")

      const { order, error: orderError } = await createOrder({
        user_id: user.id,
        items,
        total: getTotalPrice(),
      })

      if (orderError) {
        console.error("Order creation failed:", orderError)
        setError("Failed to place order. Please try again.")
        isProcessingOrder.current = false
        return
      }

      if (order) {
        console.log("Order created successfully:", order.id)

        // Mark order as completed BEFORE clearing cart
        setOrderCompleted(true)

        // Store the order ID in sessionStorage for confirmation page
        sessionStorage.setItem("recent-order-id", order.id)

        // Clear the cart
        clearCart()

        console.log("Redirecting to order confirmation page...")

        // Small delay to ensure state updates are processed
        setTimeout(() => {
          router.push(`/order-confirmed?orderId=${order.id}`)
        }, 100)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("An unexpected error occurred. Please try again.")
      isProcessingOrder.current = false
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user or (empty cart and no order completed)
  if (!user || (items.length === 0 && !orderCompleted)) {
    return null
  }

  const subtotal = getTotalPrice()
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Show processing state when order is being completed */}
          {orderCompleted && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Order completed successfully! Redirecting to confirmation page...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
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

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      This is a simulated checkout. No payment will be processed. Your order will be stored for future
                      payment integration.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Customer: {user.email}</p>
                        <p>Items: {items.length} products</p>
                        <p>Total: ${total.toFixed(2)}</p>
                        <p>Status: Will be marked as "Pending"</p>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Your order will be saved to your account</p>
                        <p>• Order details will be simulated to AliExpress</p>
                        <p>• You'll receive an order confirmation</p>
                        <p>• Payment integration coming soon!</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || items.length === 0 || orderCompleted}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Order...
                      </>
                    ) : orderCompleted ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Order Completed - Redirecting...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Place Order - ${total.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
