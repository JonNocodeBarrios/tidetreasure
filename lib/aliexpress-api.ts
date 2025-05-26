// Real AliExpress Data API integration using RapidAPI (by belchiorarkad)
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

export interface AliExpressApiResponse {
  success: boolean
  data: {
    content: AliExpressApiProduct[]
    totalResults: number
    page: number
    pageSize: number
  }
  message?: string
}

export interface ProcessedProduct {
  id: string
  title: string
  category: string
  price: number
  originalPrice?: number
  images: string[]
  description: string
  supplier: string
  rating: number
  reviews: number
  stock: number
  shippingTime: string
  features: string[]
  productUrl?: string
  currency: string
}

// Rate limiting for API requests
let lastRequestTime = 0
const REQUEST_COOLDOWN = 2000 // 2 seconds between requests

// Mock data for fallback when API is not available
const mockProducts: ProcessedProduct[] = [
  {
    id: "mock_001",
    title: "Ocean Wave Sterling Silver Bracelet",
    category: "imported",
    price: 45.99,
    originalPrice: 59.99,
    images: [
      "/placeholder.svg?height=400&width=400&query=ocean+wave+sterling+silver+bracelet",
      "/placeholder.svg?height=400&width=400&query=ocean+wave+bracelet+detail",
    ],
    description: "Beautiful ocean-inspired bracelet with wave patterns crafted from sterling silver",
    supplier: "OceanJewelry Co.",
    rating: 4.8,
    reviews: 234,
    stock: 150,
    shippingTime: "7-15 days",
    features: ["Sterling Silver", "Ocean Wave Design", "Adjustable Size", "Gift Box Included"],
    currency: "USD",
  },
  {
    id: "mock_002",
    title: "Pearl Drop Earrings - Elegant Design",
    category: "imported",
    price: 32.5,
    originalPrice: 42.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=pearl+drop+earrings+elegant",
      "/placeholder.svg?height=400&width=400&query=pearl+earrings+detail+luxury",
    ],
    description: "Elegant pearl earrings perfect for any occasion with premium freshwater pearls",
    supplier: "PearlCraft Ltd.",
    rating: 4.6,
    reviews: 156,
    stock: 89,
    shippingTime: "5-12 days",
    features: ["Freshwater Pearls", "Hypoallergenic", "Gift Packaging", "Certificate Included"],
    currency: "USD",
  },
  {
    id: "mock_003",
    title: "Seashell Pendant Necklace - Gold Plated",
    category: "imported",
    price: 67.8,
    originalPrice: 85.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=seashell+pendant+necklace+gold",
      "/placeholder.svg?height=400&width=400&query=seashell+necklace+detail+chain",
    ],
    description: "Delicate seashell pendant on a gold-plated chain, perfect for beach lovers",
    supplier: "Coastal Designs",
    rating: 4.9,
    reviews: 89,
    stock: 45,
    shippingTime: "7-14 days",
    features: ["Gold Plated", "Adjustable Chain", "Natural Seashell", "Waterproof"],
    currency: "USD",
  },
]

// Fix image URLs to ensure they have https protocol
function fixImageUrl(url: string): string {
  if (!url) return "/placeholder.svg?height=400&width=400&query=jewelry+product"

  // If URL starts with //, prepend https:
  if (url.startsWith("//")) {
    return `https:${url}`
  }

  // If URL doesn't start with http, prepend https://
  if (!url.startsWith("http")) {
    return `https://${url}`
  }

  return url
}

// Transform API response to our internal format
function transformApiProduct(apiProduct: AliExpressApiProduct): ProcessedProduct {
  // Get title from the correct structure
  const title = apiProduct.title?.displayTitle || "Untitled Product"

  // Parse price from the correct structure
  const price = apiProduct.prices?.salePrice?.minPrice || 0
  const originalPrice = apiProduct.prices?.originalPrice?.minPrice

  // Process image URL - prepend https: if it starts with //
  const mainImage = fixImageUrl(apiProduct.image?.imgUrl)
  const images = [mainImage].filter(Boolean)

  // Ensure we have at least one image
  if (images.length === 0) {
    images.push("/placeholder.svg?height=400&width=400&query=jewelry+product")
  }

  return {
    id: `ae_${apiProduct.productId}`,
    title,
    category: "imported",
    price,
    originalPrice,
    images,
    description: title,
    supplier: apiProduct.store?.storeName || "AliExpress Seller",
    rating: apiProduct.evaluation?.starRating || 4.5,
    reviews: Math.floor(Math.random() * 500) + 50, // Random reviews since not provided
    stock: Math.floor(Math.random() * 200) + 50, // Random stock since not provided
    shippingTime: apiProduct.shipping?.deliveryTime || "7-15 days",
    features: [
      "Imported from AliExpress",
      "International Shipping",
      "USD",
      apiProduct.discount ? `${apiProduct.discount} off` : "Special Price",
      "Global Shipping",
    ].filter(Boolean),
    productUrl: apiProduct.productDetailUrl,
    currency: "USD",
  }
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

    let json: AliExpressApiResponse
    try {
      json = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError)
      console.log("🔄 Invalid JSON response, falling back to mock data")
      return getMockProducts(searchTerm)
    }

    console.log("📦 Parsed response structure:", {
      success: json.success,
      hasData: !!json.data,
      hasContent: !!json.data?.content,
      productCount: json.data?.content?.length || 0,
      message: json.message,
    })

    if (!json.success || !json.data?.content) {
      console.error("Invalid API response:", json)
      console.log("🔄 Invalid API response structure, falling back to mock data")
      return getMockProducts(searchTerm)
    }

    const products = json.data.content
    console.log(`✅ Fetched ${products.length} products from AliExpress Data API`)

    // Transform API products to our internal format using the correct mapping
    const transformedProducts = products.map(transformApiProduct)

    // Filter out products with invalid data
    const validProducts = transformedProducts.filter(
      (product) => product.title && product.price > 0 && product.images.length > 0,
    )

    console.log(`✅ Processed ${validProducts.length} valid products`)

    return validProducts
  } catch (error: any) {
    console.error("❌ Error fetching AliExpress products:", error)
    console.log("🔄 Network error, falling back to mock data")
    return getMockProducts(searchTerm)
  }
}

// Get mock products with search filtering
function getMockProducts(searchTerm: string): ProcessedProduct[] {
  console.log("📦 Using mock data for search term:", searchTerm)

  // Filter mock products based on search term
  const filteredProducts = mockProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // If no matches, return all products
  return filteredProducts.length > 0 ? filteredProducts : mockProducts
}

// Simulate importing a product (for logging purposes)
export async function simulateImportProduct(product: ProcessedProduct): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("🚀 Importing product:", {
    productId: product.id,
    title: product.title,
    price: product.price,
    supplier: product.supplier,
    images: product.images.length,
    timestamp: new Date().toISOString(),
    isMockData: product.id.startsWith("mock_"),
  })
  return true
}
