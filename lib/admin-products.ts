import { supabase } from "./supabase"
import type { ProcessedProduct } from "./aliexpress-api"

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

// Import product from AliExpress with better error handling and validation
export async function importProductFromAliExpress(aliExpressProduct: ProcessedProduct): Promise<boolean> {
  try {
    // Validate product data
    if (!aliExpressProduct.title || aliExpressProduct.title.trim() === "") {
      console.error("Product title is required")
      return false
    }

    if (!aliExpressProduct.price || aliExpressProduct.price <= 0) {
      console.error("Valid product price is required")
      return false
    }

    if (!aliExpressProduct.images || aliExpressProduct.images.length === 0) {
      console.error("At least one product image is required")
      return false
    }

    // Check if product already exists (by title to avoid duplicates)
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("title", aliExpressProduct.title)
      .single()

    if (existingProduct) {
      console.log("Product already exists:", aliExpressProduct.title)
      return false // Don't overwrite existing products
    }

    // Get or create "imported" category
    let categoryId: string | null = null

    const { data: existingCategory } = await supabase.from("categories").select("id").eq("slug", "imported").single()

    if (existingCategory) {
      categoryId = existingCategory.id
    } else {
      const { data: newCategory } = await supabase
        .from("categories")
        .insert({
          name: "Imported",
          slug: "imported",
        })
        .select("id")
        .single()

      categoryId = newCategory?.id || null
    }

    // Clean and validate price
    const cleanPrice = Number(aliExpressProduct.price)
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      console.error("Invalid price value:", aliExpressProduct.price)
      return false
    }

    // Insert product with validation
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        title: aliExpressProduct.title.trim(),
        description: aliExpressProduct.description || aliExpressProduct.title,
        price: cleanPrice,
        category_id: categoryId,
        is_published: false, // Always start as unpublished for review
      })
      .select("id")
      .single()

    if (productError || !product) {
      console.error("Error inserting product:", productError)
      return false
    }

    // Insert product images with validation
    const validImages = aliExpressProduct.images
      .filter((url) => url && url.trim() !== "" && !url.includes("placeholder"))
      .slice(0, 5) // Limit to 5 images max

    // If no valid images, use the first image even if it's a placeholder
    if (validImages.length === 0 && aliExpressProduct.images.length > 0) {
      validImages.push(aliExpressProduct.images[0])
    }

    if (validImages.length === 0) {
      console.error("No valid images found for product")
      // Delete the product since we couldn't add images
      await supabase.from("products").delete().eq("id", product.id)
      return false
    }

    const imageInserts = validImages.map((imageUrl) => ({
      product_id: product.id,
      image_url: imageUrl.trim(),
    }))

    const { error: imagesError } = await supabase.from("product_images").insert(imageInserts)

    if (imagesError) {
      console.error("Error inserting product images:", imagesError)
      // Delete the product since we couldn't add images
      await supabase.from("products").delete().eq("id", product.id)
      return false
    }

    console.log(`✅ Successfully imported product: ${aliExpressProduct.title}`)
    return true
  } catch (error) {
    console.error("❌ Error importing product:", error)
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
