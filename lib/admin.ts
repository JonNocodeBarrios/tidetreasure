import { supabase } from "./supabase"

export interface AdminProduct {
  id: string
  title: string
  description: string | null
  price: number
  category_id: string | null
  is_published: boolean
  created_at: string
  category?: {
    name: string
    slug: string
  }
  product_images: {
    image_url: string
  }[]
}

export interface AdminOrder {
  id: string
  user_id: string
  total: number
  status: string
  created_at: string
  order_items: {
    id: string
    quantity: number
    price_at_purchase: number
    product: {
      title: string
    }
  }[]
}

// Check if user is admin by email
export async function checkAdminAccess(userEmail: string | undefined): Promise<boolean> {
  if (!userEmail) return false

  // Only allow access to the specific admin email
  return userEmail === "jonathanjbarrios@gmail.com"
}

// Get all products for admin
export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories:category_id (
        name,
        slug
      ),
      product_images (
        image_url
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin products:", error)
    return []
  }

  return data || []
}

// Toggle product visibility
export async function toggleProductVisibility(productId: string, isPublished: boolean): Promise<boolean> {
  const { error } = await supabase.from("products").update({ is_published: isPublished }).eq("id", productId)

  return !error
}

// Get all orders for admin
export async function getAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        price_at_purchase,
        products:product_id (
          title
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin orders:", error)
    return []
  }

  return data || []
}

// Simulated AliExpress import data
export const mockAliExpressProducts = [
  {
    id: "ae_001",
    title: "Ocean Wave Sterling Silver Bracelet",
    description: "Beautiful ocean-inspired bracelet with wave patterns",
    price: 45.99,
    category: "bracelets",
    images: [
      "/placeholder.svg?height=300&width=300&query=ocean+wave+bracelet",
      "/placeholder.svg?height=300&width=300&query=ocean+wave+bracelet+detail",
    ],
    supplier: "OceanJewelry Co.",
    stock: 150,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: "ae_002",
    title: "Pearl Drop Earrings",
    description: "Elegant pearl earrings perfect for any occasion",
    price: 32.5,
    category: "earrings",
    images: [
      "/placeholder.svg?height=300&width=300&query=pearl+drop+earrings",
      "/placeholder.svg?height=300&width=300&query=pearl+earrings+detail",
    ],
    supplier: "PearlCraft Ltd.",
    stock: 89,
    rating: 4.6,
    reviews: 156,
  },
  {
    id: "ae_003",
    title: "Seashell Pendant Necklace",
    description: "Delicate seashell pendant on a silver chain",
    price: 67.8,
    category: "necklaces",
    images: [
      "/placeholder.svg?height=300&width=300&query=seashell+pendant+necklace",
      "/placeholder.svg?height=300&width=300&query=seashell+necklace+detail",
    ],
    supplier: "Coastal Designs",
    stock: 45,
    rating: 4.9,
    reviews: 89,
  },
  {
    id: "ae_004",
    title: "Coral Ring Set",
    description: "Set of 3 coral-inspired rings in different sizes",
    price: 28.99,
    category: "rings",
    images: [
      "/placeholder.svg?height=300&width=300&query=coral+ring+set",
      "/placeholder.svg?height=300&width=300&query=coral+rings+detail",
    ],
    supplier: "Reef Jewelry",
    stock: 120,
    rating: 4.4,
    reviews: 78,
  },
  {
    id: "ae_005",
    title: "Anchor Charm Bracelet",
    description: "Nautical-themed charm bracelet with anchor details",
    price: 54.25,
    category: "bracelets",
    images: [
      "/placeholder.svg?height=300&width=300&query=anchor+charm+bracelet",
      "/placeholder.svg?height=300&width=300&query=anchor+bracelet+detail",
    ],
    supplier: "Nautical Treasures",
    stock: 67,
    rating: 4.7,
    reviews: 145,
  },
]

// Import product from AliExpress simulation
export async function importProductFromAliExpress(
  aliExpressProduct: (typeof mockAliExpressProducts)[0],
): Promise<boolean> {
  try {
    // First, get or create category
    let categoryId: string | null = null

    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", aliExpressProduct.category)
      .single()

    if (existingCategory) {
      categoryId = existingCategory.id
    } else {
      const { data: newCategory } = await supabase
        .from("categories")
        .insert({
          name: aliExpressProduct.category.charAt(0).toUpperCase() + aliExpressProduct.category.slice(1),
          slug: aliExpressProduct.category,
        })
        .select("id")
        .single()

      categoryId = newCategory?.id || null
    }

    // Insert product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        title: aliExpressProduct.title,
        description: aliExpressProduct.description,
        price: aliExpressProduct.price,
        category_id: categoryId,
        is_published: false, // Default to unpublished for review
      })
      .select("id")
      .single()

    if (productError || !product) {
      console.error("Error inserting product:", productError)
      return false
    }

    // Insert product images
    const imageInserts = aliExpressProduct.images.map((imageUrl) => ({
      product_id: product.id,
      image_url: imageUrl,
    }))

    const { error: imagesError } = await supabase.from("product_images").insert(imageInserts)

    if (imagesError) {
      console.error("Error inserting product images:", imagesError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error importing product:", error)
    return false
  }
}
