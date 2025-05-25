"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { getPublishedProductById, type Product } from "@/lib/products"
import Link from "next/link"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      setLoading(true)
      try {
        const productData = await getPublishedProductById(productId)
        setProduct(productData)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.title,
        price: Number(product.price),
        image: product.product_images[0]?.image_url || "/placeholder.svg",
        category: product.category?.name || "jewelry",
      })
    }

    toast({
      variant: "success",
      title: "Added to cart!",
      description: `${quantity} ${product.title}${quantity > 1 ? "s" : ""} added to your cart.`,
    })

    setIsAddingToCart(false)
    setQuantity(1) // Reset quantity after adding
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8 text-lg">
              The product you're looking for doesn't exist or is no longer available.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 rounded-full font-semibold text-lg">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const productImages =
    product.product_images.length > 0
      ? product.product_images.map((img) => img.image_url)
      : ["/placeholder.svg?height=600&width=600&query=ocean+jewelry"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-lg hover-lift">
              <img
                src={productImages[selectedImage] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 hover-lift ${
                      selectedImage === index
                        ? "border-cyan-500 ring-2 ring-cyan-200"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8 animate-slide-in-left">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  In Stock
                </Badge>
                <Badge variant="outline">Free Shipping</Badge>
                {product.category && (
                  <Badge variant="secondary" className="capitalize">
                    {product.category.name}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">{product.title}</h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 transition-colors ${
                        i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2 font-medium">4.5 (124 reviews)</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-8">
                <span className="text-4xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ripple"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding to Cart...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - ${(Number(product.price) * quantity).toFixed(2)}
                  </div>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="py-4 font-medium rounded-xl hover-lift">
                  <Heart className="w-5 h-5 mr-2" />
                  Save for Later
                </Button>
                <Button variant="outline" className="py-4 font-medium rounded-xl hover-lift">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over $75</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">30-Day Returns</p>
                <p className="text-xs text-gray-600">Easy returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">SSL protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
