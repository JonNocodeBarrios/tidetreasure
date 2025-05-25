import { supabase } from "./supabase"

export interface Product {
  id: string
  title: string
  description: string
  price: number
  category_id: string
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

// Get published products only (for public pages)
export async function getPublishedProducts(): Promise<Product[]> {
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
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching published products:", error)
    return []
  }

  return data || []
}

// Get published products by category slug (for public pages)
export async function getPublishedProductsByCategory(categorySlug: string): Promise<Product[]> {
  // First get the category ID from the slug
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

  if (categoryError) {
    console.error("Error fetching category:", categoryError)
    return []
  }

  if (!categoryData) {
    console.log(`No category found for slug: ${categorySlug}`)
    return []
  }

  // Then get products for that category
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
    .eq("is_published", true)
    .eq("category_id", categoryData.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching published products by category:", error)
    return []
  }

  return data || []
}

// Alternative method: Get products by category name (for backward compatibility)
export async function getPublishedProductsByCategoryName(categoryName: string): Promise<Product[]> {
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
    .eq("is_published", true)
    .eq("categories.name", categoryName)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching published products by category name:", error)
    return []
  }

  return data || []
}

// Get published product by ID (for public pages)
export async function getPublishedProductById(id: string): Promise<Product | null> {
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
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (error) {
    console.error("Error fetching published product:", error)
    return null
  }

  return data
}

// Get all categories (for navigation)
export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

// Legacy functions for backward compatibility
export const getProducts = getPublishedProducts
export const getProductsByCategory = getPublishedProductsByCategory
export const getProductById = getPublishedProductById

// Get all products (admin only)
export async function getAllProducts(): Promise<Product[]> {
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
    console.error("Error fetching all products:", error)
    return []
  }

  return data || []
}

// Alternative: Get products by category using direct join (more efficient)
export async function getPublishedProductsByCategoryDirect(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories!inner (
        name,
        slug
      ),
      product_images (
        image_url
      )
    `)
    .eq("is_published", true)
    .eq("categories.slug", categorySlug)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching published products by category (direct):", error)
    return []
  }

  return data || []
}
