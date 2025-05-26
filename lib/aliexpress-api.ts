// lib/aliexpress-api.ts

// Define the structure for AliExpress API product
export interface AliExpressApiProduct {
  productId: string
  title: {
    displayTitle: string
  }
  prices?: {
    salePrice?: {
      minPrice: number
      maxPrice?: number
    }
    originalPrice?: {
      minPrice: number
      maxPrice?: number
    }
  }
  image: {
    imgUrl: string
  }
  productDetailUrl?: string
  store?: {
    storeName: string
    storeId: string
  }
  evaluation?: {
    starRating: number
  }
  shipping?: {
    shippingFee: string
    deliveryTime: string
  }
  discount?: string
}

// Define the structure for Processed Product
export interface ProcessedProduct {
  productId: string
  title: string
  price: number
  imageUrl: string
  productUrl: string
  storeName: string
  storeId: string
  rating: number
  shippingCost: string
  deliveryTime: string
  discount?: string
}

// Rate limiting variables
const REQUEST_COOLDOWN = 3000 // milliseconds
let lastRequestTime = 0

// Function to fix image URLs
function fixImageUrl(url: string): string {
  if (!url) return "/placeholder.svg?height=400&width=400&query=no+image"
  if (url.startsWith("//")) return "https:" + url
  return url
}

// Function to transform AliExpressApiProduct to ProcessedProduct
function transformApiProduct(product: AliExpressApiProduct): ProcessedProduct {
  return {
    productId: product.productId,
    title: product.title.displayTitle,
    price: product.prices?.salePrice?.minPrice || 0,
    imageUrl: product.image.imgUrl,
    productUrl: product.productDetailUrl || "#",
    storeName: product.store?.storeName || "AliExpress Seller",
    storeId: product.store?.storeId || "unknown",
    rating: product.evaluation?.starRating || 4.5,
    shippingCost: product.shipping?.shippingFee || "Free",
    deliveryTime: product.shipping?.deliveryTime || "7-15 days",
    discount: product.discount,
  }
}

// Fetch products from AliExpress Data API
export async function fetchAliExpressProducts(
  searchTerm = "jewelry",
  page = 1,
  country = "US",
  language = "en",
): Promise<ProcessedProduct[]> {
  // Rate limiting check
  const now = Date.now()
  if (now - lastRequestTime < REQUEST_COOLDOWN) {
    const waitTime = REQUEST_COOLDOWN - (now - lastRequestTime)
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
  lastRequestTime = Date.now()

  const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
  const rapidApiHost = process.env.NEXT_PUBLIC_RAPIDAPI_HOST

  // Fallback to mock data if API not configured
  if (!rapidApiKey || !rapidApiHost) {
    console.log("🔄 No API configuration found, using mock data")
    return getMockProducts(searchTerm)
  }

  try {
    console.log("🔍 Fetching AliExpress products:", { searchTerm, page, country, language })

    const url = `https://${rapidApiHost}/product/search?query=${encodeURIComponent(searchTerm)}&page=${page}&country=${country}&language=${language}`
    console.log("📡 Request URL:", url)

    const headers = {
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": rapidApiHost,
      "Content-Type": "application/json",
    }

    console.log("📋 Request headers:", {
      "X-RapidAPI-Key": rapidApiKey.substring(0, 8) + "...",
      "X-RapidAPI-Host": rapidApiHost,
    })

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    console.log("📊 Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API Error Response:", errorText)

      // Parse error message if possible
      let errorMessage = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorText
      } catch {
        // Keep original error text if not JSON
      }

      // Handle specific error cases with fallback to mock data
      if (response.status === 429) {
        console.log("🔄 Rate limit exceeded, falling back to mock data")
        return getMockProducts(searchTerm)
      }
      if (response.status === 403 || errorMessage.includes("not subscribed")) {
        console.log("🔄 API subscription required, falling back to mock data")
        return getMockProducts(searchTerm)
      }
      if (response.status === 401) {
        console.log("🔄 Invalid API key, falling back to mock data")
        return getMockProducts(searchTerm)
      }

      // For other errors, also fall back to mock data
      console.log("🔄 API error, falling back to mock data")
      return getMockProducts(searchTerm)
    }

    const responseText = await response.text()
    console.log("📄 Raw response:", responseText.substring(0, 500) + "...")

    let json: any
    try {
      json = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError)
      console.log("🔄 Invalid JSON response, falling back to mock data")
      return getMockProducts(searchTerm)
    }

    console.log("📦 Parsed response structure:", {
      hasData: !!json.data,
      hasContent: !!json.data?.content,
      productCount: json.data?.content?.length || 0,
    })

    // Extract products from data.content - this is the key fix for the API response structure
    if (!json.data || !Array.isArray(json.data.content)) {
      console.error("Invalid API response structure - missing data.content array:", json)
      console.log("🔄 Invalid API response structure, falling back to mock data")
      return getMockProducts(searchTerm)
    }

    const rawProducts = json.data.content
    console.log(`✅ Fetched ${rawProducts.length} products from AliExpress Data API`)

    // Normalize and validate each product to ensure all expected fields exist with safe fallbacks
    const normalizedProducts = rawProducts.map((product: any, index: number) => {
      try {
        // Create a normalized AliExpressApiProduct with safe fallbacks
        const normalizedApiProduct: AliExpressApiProduct = {
          productId: product.productId || product.id || `unknown_${index}_${Date.now()}`,
          title: {
            displayTitle: product.title?.displayTitle || product.title || product.name || "Untitled Product",
          },
          prices: {
            salePrice: {
              minPrice: product.prices?.salePrice?.minPrice || product.price || product.salePrice || 0,
              maxPrice:
                product.prices?.salePrice?.maxPrice ||
                product.prices?.salePrice?.minPrice ||
                product.price ||
                product.salePrice ||
                0,
            },
            originalPrice: {
              minPrice:
                product.prices?.originalPrice?.minPrice ||
                product.originalPrice ||
                product.prices?.salePrice?.minPrice ||
                product.price ||
                0,
              maxPrice:
                product.prices?.originalPrice?.maxPrice ||
                product.prices?.originalPrice?.minPrice ||
                product.originalPrice ||
                0,
            },
          },
          image: {
            imgUrl: fixImageUrl(product.image?.imgUrl || product.imageUrl || product.image || ""),
          },
          productDetailUrl: product.productDetailUrl || product.url || product.link,
          store: {
            storeName: product.store?.storeName || product.storeName || product.seller || "AliExpress Seller",
            storeId: product.store?.storeId || product.storeId || `store_${product.productId || index}`,
          },
          evaluation: {
            starRating: product.evaluation?.starRating || product.rating || product.stars || 4.5,
          },
          shipping: {
            shippingFee: product.shipping?.shippingFee || product.shippingFee || "Free",
            deliveryTime: product.shipping?.deliveryTime || product.deliveryTime || "7-15 days",
          },
          discount: product.discount || product.discountRate,
        }

        // Transform to ProcessedProduct format
        return transformApiProduct(normalizedApiProduct)
      } catch (error) {
        console.warn(`⚠️ Error normalizing product at index ${index}:`, error)
        // Return a safe fallback product
        const fallbackApiProduct: AliExpressApiProduct = {
          productId: `fallback_${index}_${Date.now()}`,
          title: { displayTitle: "Product Unavailable" },
          prices: {
            salePrice: { minPrice: 0, maxPrice: 0 },
            originalPrice: { minPrice: 0, maxPrice: 0 },
          },
          image: { imgUrl: "/placeholder.svg?height=400&width=400&query=jewelry+product" },
          store: { storeName: "AliExpress Seller", storeId: "unknown" },
          evaluation: { starRating: 4.5 },
          shipping: { shippingFee: "Free", deliveryTime: "7-15 days" },
        }
        return transformApiProduct(fallbackApiProduct)
      }
    })

    // Filter out products with invalid data (price = 0 or empty title)
    const validProducts = normalizedProducts.filter(
      (product) => product.title && product.title !== "Product Unavailable" && product.price > 0,
    )

    console.log(`✅ Processed ${validProducts.length} valid products out of ${normalizedProducts.length} total`)

    return validProducts
  } catch (error: any) {
    console.error("❌ Error fetching AliExpress products:", error)
    console.log("🔄 Network error, falling back to mock data")
    return getMockProducts(searchTerm)
  }
}

// Get mock products in API format with search filtering
function getMockProducts(searchTerm: string): ProcessedProduct[] {
  console.log("📦 Using mock API data for search term:", searchTerm)

  const mockApiProducts: AliExpressApiProduct[] = [
    {
      productId: "mock_001",
      title: { displayTitle: "Ocean Wave Sterling Silver Bracelet" },
      prices: {
        salePrice: { minPrice: 45.99, maxPrice: 45.99 },
        originalPrice: { minPrice: 59.99, maxPrice: 59.99 },
      },
      image: { imgUrl: "/placeholder.svg?height=400&width=400&query=ocean+wave+sterling+silver+bracelet" },
      productDetailUrl: "#",
      store: { storeName: "OceanJewelry Co.", storeId: "ocean_jewelry" },
      evaluation: { starRating: 4.8 },
      shipping: { shippingFee: "Free", deliveryTime: "7-15 days" },
      discount: "23% off",
    },
    {
      productId: "mock_002",
      title: { displayTitle: "Pearl Drop Earrings - Elegant Design" },
      prices: {
        salePrice: { minPrice: 32.5, maxPrice: 32.5 },
        originalPrice: { minPrice: 42.0, maxPrice: 42.0 },
      },
      image: { imgUrl: "/placeholder.svg?height=400&width=400&query=pearl+drop+earrings+elegant" },
      productDetailUrl: "#",
      store: { storeName: "PearlCraft Ltd.", storeId: "pearl_craft" },
      evaluation: { starRating: 4.6 },
      shipping: { shippingFee: "Free", deliveryTime: "5-12 days" },
      discount: "23% off",
    },
    {
      productId: "mock_003",
      title: { displayTitle: "Seashell Pendant Necklace - Gold Plated" },
      prices: {
        salePrice: { minPrice: 67.8, maxPrice: 67.8 },
        originalPrice: { minPrice: 85.0, maxPrice: 85.0 },
      },
      image: { imgUrl: "/placeholder.svg?height=400&width=400&query=seashell+pendant+necklace+gold" },
      productDetailUrl: "#",
      store: { storeName: "Coastal Designs", storeId: "coastal_designs" },
      evaluation: { starRating: 4.9 },
      shipping: { shippingFee: "Free", deliveryTime: "7-14 days" },
      discount: "20% off",
    },
  ]

  const processedMockProducts: ProcessedProduct[] = mockApiProducts.map(transformApiProduct)

  // Filter mock products based on search term
  const filteredProducts = processedMockProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.storeName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // If no matches, return all products
  return filteredProducts.length > 0 ? filteredProducts : processedMockProducts
}

// Check API configuration
export function checkApiConfiguration(): {
  isConfigured: boolean
  hasApiKey: boolean
  message: string
} {
  const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
  const rapidApiHost = process.env.NEXT_PUBLIC_RAPIDAPI_HOST

  if (!rapidApiKey) {
    return {
      isConfigured: false,
      hasApiKey: false,
      message: "RAPIDAPI_KEY environment variable is not set. Using mock data.",
    }
  }

  if (!rapidApiHost) {
    return {
      isConfigured: false,
      hasApiKey: true,
      message: "RAPIDAPI_HOST environment variable is not set. Using mock data.",
    }
  }

  if (rapidApiKey.length < 10) {
    return {
      isConfigured: false,
      hasApiKey: true,
      message: "RAPIDAPI_KEY appears to be invalid (too short). Using mock data.",
    }
  }

  return {
    isConfigured: true,
    hasApiKey: true,
    message: "API configuration looks good",
  }
}

// Test API connection
export async function testApiConnection(): Promise<{
  success: boolean
  message: string
  details?: any
  usingMockData?: boolean
}> {
  try {
    const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
    const rapidApiHost = process.env.NEXT_PUBLIC_RAPIDAPI_HOST

    if (!rapidApiKey || !rapidApiHost) {
      return {
        success: true,
        usingMockData: true,
        message: "API not configured. Mock data is available for testing.",
      }
    }

    console.log("🧪 Testing AliExpress Data API connection...")

    const testUrl = `https://${rapidApiHost}/product/search?query=test&page=1&country=US&language=en`

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": rapidApiHost,
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log("📊 API Test Response:", response.status, responseText.substring(0, 200))

    if (response.status === 403) {
      let errorMessage = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorMessage = errorJson.message || responseText
      } catch {
        // Keep original error text
      }

      if (errorMessage.includes("not subscribed") || errorMessage.includes("subscription")) {
        return {
          success: false,
          usingMockData: true,
          message: "API subscription required. Mock data is available for testing.",
          details: {
            status: response.status,
            error: errorMessage,
            solution: "Subscribe to the AliExpress Data API on RapidAPI to use real data",
          },
        }
      }
    }

    return {
      success: response.ok,
      usingMockData: !response.ok,
      message: response.ok
        ? "API connection successful"
        : `API connection failed (${response.status}). Mock data is available.`,
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 200) + "...",
      },
    }
  } catch (error: any) {
    console.error("❌ API connection test failed:", error)
    return {
      success: false,
      usingMockData: true,
      message: `Connection test failed: ${error.message}. Mock data is available.`,
      details: error,
    }
  }
}

// Simulate importing a product (for logging purposes)
export async function simulateImportProduct(product: ProcessedProduct): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("🚀 Importing product:", {
    productId: product.productId,
    title: product.title,
    price: product.price,
    storeName: product.storeName,
    timestamp: new Date().toISOString(),
    isMockData: product.productId.startsWith("mock_"),
  })
  return true
}
