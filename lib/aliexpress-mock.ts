// Mock AliExpress product data
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
}

export const mockAliExpressProducts: AliExpressProduct[] = [
  {
    id: "ae_001",
    title: "Ocean Wave Sterling Silver Bracelet",
    category: "bracelet",
    price: 45.99,
    originalPrice: 89.99,
    images: [
      "/placeholder.svg?height=400&width=400&query=ocean+wave+sterling+silver+bracelet",
      "/placeholder.svg?height=400&width=400&query=ocean+wave+bracelet+detail",
      "/placeholder.svg?height=400&width=400&query=ocean+wave+bracelet+packaging",
    ],
    description:
      "Elegant sterling silver bracelet featuring ocean wave patterns. Handcrafted with attention to detail, this piece captures the fluid motion of ocean waves in a timeless design.",
    supplier: "OceanCraft Jewelry",
    rating: 4.8,
    reviews: 234,
    stock: 150,
    shippingTime: "7-15 days",
    features: ["925 Sterling Silver", "Adjustable 6-8 inches", "Hypoallergenic", "Gift box included"],
  },
  {
    id: "ae_002",
    title: "Pearl Drop Earrings with Ocean Theme",
    category: "earring",
    price: 32.5,
    originalPrice: 65.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=pearl+drop+earrings+ocean+theme",
      "/placeholder.svg?height=400&width=400&query=pearl+earrings+detail+view",
      "/placeholder.svg?height=400&width=400&query=pearl+earrings+worn",
    ],
    description:
      "Beautiful pearl drop earrings with ocean-inspired design. Features genuine freshwater pearls and delicate wave motifs.",
    supplier: "PearlCraft Studio",
    rating: 4.6,
    reviews: 156,
    stock: 89,
    shippingTime: "5-12 days",
    features: ["Freshwater pearls", "Sterling silver posts", "Lightweight design", "Elegant gift packaging"],
  },
  {
    id: "ae_003",
    title: "Seashell Pendant Necklace Gold Plated",
    category: "necklace",
    price: 67.8,
    originalPrice: 120.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=seashell+pendant+necklace+gold",
      "/placeholder.svg?height=400&width=400&query=seashell+necklace+detail",
      "/placeholder.svg?height=400&width=400&query=seashell+necklace+lifestyle",
    ],
    description:
      "Stunning seashell pendant necklace with 18k gold plating. The intricate shell design brings the beauty of the ocean to your everyday style.",
    supplier: "Coastal Designs Co.",
    rating: 4.9,
    reviews: 89,
    stock: 45,
    shippingTime: "10-18 days",
    features: ["18k Gold Plated", "Adjustable chain 16-20 inches", "Detailed shell carving", "Tarnish resistant"],
  },
  {
    id: "ae_004",
    title: "Coral Ring Set - Ocean Collection",
    category: "ring",
    price: 28.99,
    originalPrice: 55.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=coral+ring+set+ocean+collection",
      "/placeholder.svg?height=400&width=400&query=coral+rings+stacked",
      "/placeholder.svg?height=400&width=400&query=coral+rings+detail",
    ],
    description:
      "Set of 3 coral-inspired rings in different sizes. Perfect for stacking or wearing individually. Made with eco-friendly materials.",
    supplier: "Reef Jewelry Co.",
    rating: 4.4,
    reviews: 78,
    stock: 120,
    shippingTime: "6-14 days",
    features: ["Set of 3 rings", "Adjustable sizes", "Eco-friendly materials", "Coral-inspired design"],
  },
  {
    id: "ae_005",
    title: "Anchor Charm Bracelet Nautical Style",
    category: "bracelet",
    price: 54.25,
    originalPrice: 95.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=anchor+charm+bracelet+nautical",
      "/placeholder.svg?height=400&width=400&query=anchor+bracelet+charms",
      "/placeholder.svg?height=400&width=400&query=anchor+bracelet+worn",
    ],
    description:
      "Nautical-themed charm bracelet featuring anchor, rope, and compass charms. Perfect for ocean lovers and maritime enthusiasts.",
    supplier: "Nautical Treasures",
    rating: 4.7,
    reviews: 145,
    stock: 67,
    shippingTime: "8-16 days",
    features: ["Multiple nautical charms", "Stainless steel chain", "Water resistant", "Adjustable length"],
  },
  {
    id: "ae_006",
    title: "Starfish Stud Earrings Rose Gold",
    category: "earring",
    price: 19.99,
    originalPrice: 39.99,
    images: [
      "/placeholder.svg?height=400&width=400&query=starfish+stud+earrings+rose+gold",
      "/placeholder.svg?height=400&width=400&query=starfish+earrings+detail",
      "/placeholder.svg?height=400&width=400&query=starfish+earrings+packaging",
    ],
    description:
      "Delicate starfish stud earrings in rose gold finish. Small and elegant, perfect for everyday wear or special occasions.",
    supplier: "Seaside Accessories",
    rating: 4.5,
    reviews: 203,
    stock: 180,
    shippingTime: "5-10 days",
    features: ["Rose gold plated", "Hypoallergenic posts", "Starfish design", "Gift ready packaging"],
  },
  {
    id: "ae_007",
    title: "Tidal Wave Pendant Necklace Silver",
    category: "necklace",
    price: 78.5,
    originalPrice: 140.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=tidal+wave+pendant+necklace+silver",
      "/placeholder.svg?height=400&width=400&query=wave+necklace+detail",
      "/placeholder.svg?height=400&width=400&query=wave+necklace+lifestyle",
    ],
    description:
      "Artistic tidal wave pendant necklace crafted in sterling silver. The flowing wave design captures the power and beauty of the ocean.",
    supplier: "Wave Artisans",
    rating: 4.8,
    reviews: 112,
    stock: 35,
    shippingTime: "12-20 days",
    features: ["Sterling silver 925", "Artistic wave design", "18-inch chain included", "Handcrafted details"],
  },
  {
    id: "ae_008",
    title: "Ocean Blue Gemstone Ring",
    category: "ring",
    price: 89.99,
    originalPrice: 160.0,
    images: [
      "/placeholder.svg?height=400&width=400&query=ocean+blue+gemstone+ring",
      "/placeholder.svg?height=400&width=400&query=blue+gemstone+ring+detail",
      "/placeholder.svg?height=400&width=400&query=blue+ring+hand+model",
    ],
    description:
      "Stunning ocean blue gemstone ring set in sterling silver. The deep blue stone resembles the depths of the ocean.",
    supplier: "Gemstone Gallery",
    rating: 4.9,
    reviews: 67,
    stock: 25,
    shippingTime: "10-18 days",
    features: [
      "Natural blue gemstone",
      "Sterling silver setting",
      "Available in multiple sizes",
      "Certificate of authenticity",
    ],
  },
]

// Simulate API delay
export const fetchAliExpressProducts = async (): Promise<AliExpressProduct[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockAliExpressProducts
}

// Simulate importing a product
export const simulateImportProduct = async (product: AliExpressProduct): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("🚀 Simulating AliExpress import:", {
    productId: product.id,
    title: product.title,
    price: product.price,
    supplier: product.supplier,
    timestamp: new Date().toISOString(),
  })
  return true
}
