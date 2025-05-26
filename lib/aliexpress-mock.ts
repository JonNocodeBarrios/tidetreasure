// Real AliExpress API integration using RapidAPI
export interface AliExpressProduct {
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
  // Additional fields for API response
  productUrl?: string
  salePrice?: string
  discount?: string
}

export interface AliExpressApiResponse {
  success: boolean
  data: {
    content: Array<{
      title: string
      price: {
        current: {
          value: number
          currency: string
        }
        original?: {
          value: number
          currency: string
        }
      }
      image: {
        imgUrl: string
        imgWidth: number
        imgHeight: number
        imgType: string
      }
      itemType: string
      productUrl?: string
      rating?: number
      reviews?: number
      shipping?: {
        time: string
      }
      store?: {
        name: string
      }
      discount?: string
      salePrice?: string
    }>
  }
  message?: string
}

// Mock data for demonstration when API is not available
const mockAliExpressProducts: AliExpressProduct[] = [
  {
    id: "mock_001",
    title: "Ocean Wave Sterling Silver Bracelet",
    category: "bracelets",
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
  },
  {
    id: "mock_002",
    title: "Pearl Drop Earrings - Elegant Design",
    category: "earrings",
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
  },
  {
    id: "mock_003",
    title: "Seashell Pendant Necklace - Gold Plated",
    category: "necklaces",
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
  },
  {
    id: "mock_004",
    title: "Coral Ring Set - 3 Piece Collection",
    category: "rings",
    price: 28.99,
    originalPrice: 39.99,
    images: [
      "/placeholder.svg?height=400&width=400&query=coral+ring+set+collection",
      "/placeholder.svg?height=400&width=400&query=coral+rings+detail+stack",
    ],
    description: "Set of 3 coral-inspired rings in different sizes, perfect for stacking",
    supplier: "Reef Jewelry",
    rating: 4.4,
    reviews: 78,
    stock: 120,
    shippingTime: "5-10 days",
    features: ["3-Piece Set", "Stackable Design", "Multiple Sizes", "Coral Inspired"],
  },
  {
    id: "mock_005",
    title: "Anchor Charm Bracelet - Nautical Style",
    category: "bracelets",
    price: 54.25,
    originalPrice: 69.99,
    images: [
      "/placeholder.svg?height=400&width=400&query=anchor+charm+bracelet+nautical",
      "/placeholder.svg?height=400&width=400&query=anchor+bracelet+detail+charms",
    ],
    description: "Nautical-themed charm bracelet with anchor details and maritime symbols",
    supplier: "Nautical Treasures",
    rating: 4.7,
    reviews: 145,
    stock: 67,
    shippingTime: "7-15 days",
    features: ["Multiple Charms", "Nautical Theme", "Adjustable", "Maritime Symbols"],
  },
  {
    id: "mock_006",
    title: "Starfish Stud Earrings - Rose Gold",
    category: "earrings",
    price: 19.99,
    originalPrice: 29.99,
    images: [
      "/placeholder.svg?height=400&width=400&query=starfish+stud+earrings+rose+gold",
      "/placeholder.svg?height=400&width=400&query=starfish+earrings+detail+studs",
    ],
    description: "Cute starfish stud earrings in rose gold finish, perfect for everyday wear",
    supplier: "Sea Star Jewelry",
    rating: 4.5,
    reviews: 203,
    stock: 95,
    shippingTime: "5-12 days",
    features: ["Rose Gold Finish", "Hypoallergenic", "Lightweight", "Everyday Wear"],
  },
]

// Rate limiting for free tier
let lastRequestTime = 0
const REQUEST_COOLDOWN = 2000 // 2 seconds between requests

// Fetch real AliExpress products using RapidAPI with fallback to mock data
export const fetchAliExpressProducts = async (searchTerm = "women's jewelry"): Promise<AliExpressProduct[]> => {
  // Rate limiting check
  const now = Date.now()
  if (now - lastRequestTime < REQUEST_COOLDOWN) {
    const waitTime = REQUEST_COOLDOWN - (now - lastRequestTime)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
  lastRequestTime = Date.now()

  const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY

  if (!rapidApiKey) {
    console.log("🔄 No API key found, using mock data")
    return getMockProducts(searchTerm)
  }

  try {
    console.log("🔍 Fetching AliExpress products for:", searchTerm)
    console.log("🔑 Using API key:", rapidApiKey.substring(0, 8) + "...")

    const url = `https://ali-express1.p.rapidapi.com/search?query=${encodeURIComponent(searchTerm)}&page=1&limit=20`
    console.log("📡 Request URL:", url)

    const headers = {
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": "ali-express1.p.rapidapi.com",
      "Content-Type": "application/json",
    }

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

    let apiResponse: AliExpressApiResponse
    try {
      apiResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError)
      console.log("🔄 Invalid JSON response, falling back to mock data")
      return getMockProducts(searchTerm)
    }

    console.log("📦 Parsed response structure:", {
      success: apiResponse.success,
      hasData: !!apiResponse.data,
      hasContent: !!apiResponse.data?.content,
      contentLength: apiResponse.data?.content?.length || 0,
      message: apiResponse.message,
    })

    if (!apiResponse.success || !apiResponse.data?.content) {
      console.error("Invalid API response:", apiResponse)
      console.log("🔄 Invalid API response, falling back to mock data")
      return getMockProducts(searchTerm)
    }

    console.log(`✅ Fetched ${apiResponse.data.content.length} products from AliExpress`)

    // Transform API response to our format
    const transformedProducts: AliExpressProduct[] = apiResponse.data.content.map((item, index) => {
      // Extract and fix image URL from the new API structure
      let imageUrl = item.image?.imgUrl || ""

      // Prepend https: if missing
      if (imageUrl.startsWith("//")) {
        imageUrl = `https:${imageUrl}`
      } else if (!imageUrl.startsWith("http") && imageUrl.length > 0) {
        imageUrl = `https://${imageUrl}`
      }

      // Ensure we have at least one image
      const images = imageUrl ? [imageUrl] : ["/placeholder.svg?height=400&width=400&query=jewelry+product"]

      return {
        id: `ae_real_${Date.now()}_${index}`,
        title: item.title || "Untitled Product",
        category: "imported", // Default category as specified
        price: item.price?.current?.value || 0,
        originalPrice: item.price?.original?.value,
        images,
        description: item.title || "Imported from AliExpress", // Use title as fallback
        supplier: item.store?.name || "AliExpress Seller",
        rating: item.rating || 4.5,
        reviews: item.reviews || 0,
        stock: 100, // Default stock since not provided by API
        shippingTime: item.shipping?.time || "7-15 days",
        features: [
          "Imported from AliExpress",
          "International Shipping",
          item.price?.current?.currency || "USD",
          item.discount ? `${item.discount} off` : "Special Price",
        ].filter(Boolean),
        productUrl: item.productUrl,
        salePrice: item.salePrice,
        discount: item.discount,
      }
    })

    return transformedProducts
  } catch (error: any) {
    console.error("❌ Error fetching AliExpress products:", error)
    console.log("🔄 Network error, falling back to mock data")
    return getMockProducts(searchTerm)
  }
}

// Get mock products with search filtering
function getMockProducts(searchTerm: string): AliExpressProduct[] {
  console.log("📦 Using mock data for search term:", searchTerm)

  // Filter mock products based on search term
  const filteredProducts = mockAliExpressProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // If no matches, return all products
  return filteredProducts.length > 0 ? filteredProducts : mockAliExpressProducts
}

// Simulate importing a product (for logging purposes)
export const simulateImportProduct = async (product: AliExpressProduct): Promise<boolean> => {
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

// Check API configuration
export const checkApiConfiguration = (): { isConfigured: boolean; message: string; hasApiKey: boolean } => {
  const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY

  if (!rapidApiKey) {
    return {
      isConfigured: false,
      hasApiKey: false,
      message: "RAPIDAPI_KEY environment variable is not set. Using mock data.",
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
    message: "API key configured. Testing connection...",
  }
}

// Test API connection
export const testApiConnection = async (): Promise<{
  success: boolean
  message: string
  details?: any
  usingMockData?: boolean
}> => {
  try {
    const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY

    if (!rapidApiKey) {
      return {
        success: true,
        usingMockData: true,
        message: "No API key configured. Mock data is available for testing.",
      }
    }

    console.log("🧪 Testing API connection...")

    const response = await fetch("https://ali-express1.p.rapidapi.com/search?query=test&page=1&limit=1", {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "ali-express1.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()

    if (response.status === 403) {
      let errorMessage = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorMessage = errorJson.message || responseText
      } catch {
        // Keep original error text
      }

      if (errorMessage.includes("not subscribed")) {
        return {
          success: false,
          usingMockData: true,
          message: "API subscription required. Mock data is available for testing.",
          details: {
            status: response.status,
            error: errorMessage,
            solution: "Subscribe to the AliExpress API on RapidAPI to use real data",
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
    return {
      success: false,
      usingMockData: true,
      message: `Connection test failed. Mock data is available for testing.`,
      details: error,
    }
  }
}
