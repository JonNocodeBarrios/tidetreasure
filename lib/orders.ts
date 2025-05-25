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

// Create a new order with order items
export async function createOrder(orderData: CreateOrderData): Promise<{ order?: Order; error?: any }> {
  try {
    // Calculate total from items
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

    // Create the order
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

    if (orderError || !order) {
      console.error("Error creating order:", orderError)
      return { error: orderError }
    }

    // Create order items for relational queries (now with proper RLS policies)
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // Don't fail the order creation if order_items fails, but log it
      console.log("Order created successfully but order_items creation failed - items stored in JSON format")
    } else {
      console.log("Order and order items created successfully")
    }

    // Simulate AliExpress order submission
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

    return { order }
  } catch (error) {
    console.error("Unexpected error creating order:", error)
    return { error }
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
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
}

// Get user orders
export async function getUserOrders(userId: string): Promise<Order[]> {
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
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

  if (error) {
    console.error("Error updating order status:", error)
    return false
  }

  return true
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
