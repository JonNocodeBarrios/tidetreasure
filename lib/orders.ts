import { supabase } from "./supabase"
import type { CartItem } from "@/contexts/cart-context"

export type Order = {
  id: string
  user_id: string
  total: number
  status: string
  items: any[] // Assuming items is a JSON array
  created_at: string
}

export type CreateOrderData = {
  user_id: string
  items: CartItem[]
  total: number
}

export interface OrderValidationError {
  field: string
  message: string
}

// Validate order data before submission
export function validateOrderData(orderData: CreateOrderData): OrderValidationError[] {
  const errors: OrderValidationError[] = []

  // Check if user ID is provided
  if (!orderData.user_id || orderData.user_id.trim() === "") {
    errors.push({ field: "user_id", message: "User authentication required" })
  }

  // Check if items exist
  if (!orderData.items || orderData.items.length === 0) {
    errors.push({ field: "items", message: "Cart cannot be empty" })
  } else {
    // Validate each item
    orderData.items.forEach((item, index) => {
      if (!item.id || item.id.trim() === "") {
        errors.push({ field: `items[${index}].id`, message: "Product ID is required" })
      }
      if (!item.name || item.name.trim() === "") {
        errors.push({ field: `items[${index}].name`, message: "Product name is required" })
      }
      if (!item.price || item.price <= 0) {
        errors.push({ field: `items[${index}].price`, message: "Valid product price is required" })
      }
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        errors.push({ field: `items[${index}].quantity`, message: "Valid quantity is required" })
      }
      if (!item.category || item.category.trim() === "") {
        errors.push({ field: `items[${index}].category`, message: "Product category is required" })
      }
    })
  }

  // Check if total is valid
  if (!orderData.total || orderData.total <= 0) {
    errors.push({ field: "total", message: "Valid order total is required" })
  }

  // Validate calculated total matches items
  if (orderData.items && orderData.items.length > 0) {
    const calculatedTotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    if (Math.abs(calculatedTotal - orderData.total) > 0.01) {
      // Allow for small floating point differences
      errors.push({ field: "total", message: "Order total does not match item prices" })
    }
  }

  return errors
}

// Check if we can connect to Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("categories").select("id").limit(1)
    return !error
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return false
  }
}

// Create a new order with comprehensive error handling
export async function createOrder(orderData: CreateOrderData): Promise<{
  order?: Order
  error?: string
  validationErrors?: OrderValidationError[]
  isNetworkError?: boolean
}> {
  try {
    // Validate order data first
    const validationErrors = validateOrderData(orderData)
    if (validationErrors.length > 0) {
      console.error("Order validation failed:", validationErrors)
      return {
        validationErrors,
        error: "Order validation failed. Please check your cart items and try again.",
      }
    }

    // Check network connectivity
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      return {
        error: "Unable to connect to our servers. Please check your internet connection and try again.",
        isNetworkError: true,
      }
    }

    // Calculate total from items (double-check)
    const calculatedTotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Prepare items for JSON storage
    const itemsJson = orderData.items.map((item) => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      category: item.category,
    }))

    console.log("Creating order with data:", {
      user_id: orderData.user_id,
      total: calculatedTotal,
      itemCount: orderData.items.length,
    })

    // Create the order with explicit error handling
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id,
        total: calculatedTotal,
        status: "pending",
        items: itemsJson,
      })
      .select("*")
      .single()

    if (orderError) {
      console.error("Supabase order creation error:", orderError)

      // Check for specific error types
      if (orderError.message?.includes("network") || orderError.message?.includes("fetch")) {
        return {
          error: "Network error occurred. Please check your connection and try again.",
          isNetworkError: true,
        }
      }

      if (orderError.message?.includes("permission") || orderError.message?.includes("policy")) {
        return {
          error: "Authentication error. Please log out and log back in, then try again.",
        }
      }

      return {
        error: "Order could not be placed. Please try again or contact support if the problem persists.",
      }
    }

    if (!order) {
      console.error("Order creation returned no data")
      return {
        error: "Order could not be placed. Please try again.",
      }
    }

    console.log("Order created successfully:", order.id)

    // Create order items for relational queries (with error handling)
    try {
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Error creating order items (non-critical):", itemsError)
        // Don't fail the order creation if order_items fails, but log it
        console.log("Order created successfully but order_items creation failed - items stored in JSON format")
      } else {
        console.log("Order and order items created successfully")
      }
    } catch (itemsError) {
      console.error("Error creating order items (non-critical):", itemsError)
      // Continue - order is still valid with JSON storage
    }

    // Simulate AliExpress order submission
    try {
      console.log("🚀 Simulating AliExpress order submission:", {
        orderId: order.id,
        items: orderData.items.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculatedTotal,
        timestamp: new Date().toISOString(),
        status: "submitted_to_aliexpress",
      })
    } catch (simulationError) {
      console.error("AliExpress simulation error (non-critical):", simulationError)
      // Continue - this is just a simulation
    }

    return { order }
  } catch (error: any) {
    console.error("Unexpected error creating order:", error)

    // Check for network-related errors
    if (error.name === "TypeError" && error.message?.includes("fetch")) {
      return {
        error: "Network error occurred. Please check your internet connection and try again.",
        isNetworkError: true,
      }
    }

    if (error.name === "AbortError") {
      return {
        error: "Request timed out. Please try again.",
        isNetworkError: true,
      }
    }

    return {
      error: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    }
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price_at_purchase,
          products (
            title,
            product_images (
              image_url
            )
          )
        )
      `)
      .eq("id", orderId)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching order:", error)
    return null
  }
}

// Get user orders
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price_at_purchase,
          products (
            title,
            product_images (
              image_url
            )
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user orders:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching user orders:", error)
    return []
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error updating order status:", error)
    return false
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  created_at?: string
  products?: {
    title: string
    product_images: { image_url: string }[]
  }
}
