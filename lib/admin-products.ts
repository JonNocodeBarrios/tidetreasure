import { supabase } from "./supabase"
import type { AliExpressProduct } from "./aliexpress-mock"

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

// Get all products for admin with category info
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

  if (!error) {
    console.log(`Product ${productId} ${isPublished ? "published" : "unpublished"}`)
  }

  return !error
}

// Import product from AliExpress
export async function importProductFromAliExpress(aliExpressProduct: AliExpressProduct): Promise<boolean> {
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

    console.log(`Successfully imported product: ${aliExpressProduct.title}`)
    return true
  } catch (error) {
    console.error("Error importing product:", error)
    return false
  }
}

// Delete product (admin only)
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    // Delete product images first
    const { error: imagesError } = await supabase.from("product_images").delete().eq("product_id", productId)

    if (imagesError) {
      console.error("Error deleting product images:", imagesError)
      return false
    }

    // Delete product
    const { error: productError } = await supabase.from("products").delete().eq("id", productId)

    if (productError) {
      console.error("Error deleting product:", productError)
      return false
    }

    console.log(`Successfully deleted product: ${productId}`)
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    return false
  }
}
