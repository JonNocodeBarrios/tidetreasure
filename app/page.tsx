import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { getPublishedProducts } from "@/lib/products"

export default async function HomePage() {
  // Fetch featured products from Supabase
  const allProducts = await getPublishedProducts()
  const featuredProducts = allProducts.slice(0, 4) // Show first 4 products

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free shipping on all orders over $75",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day hassle-free return policy",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "Your payment information is safe with us",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/placeholder.svg?height=800&width=1200&query=luxury+ocean+jewelry+hero+background')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/80 via-blue-900/60 to-teal-900/80" />
        </div>

        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-20 fill-white">
            <path d="M0,120 C300,80 900,80 1200,120 L1200,120 L0,120 Z" className="animate-pulse" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
            Let your <span className="gradient-text font-bold">ocean spirit</span> shine
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Discover our collection of handcrafted ocean-inspired jewelry, where elegance meets the beauty of the sea.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/products/bracelet">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover-lift ripple"
              >
                SHOP NOW
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-4 text-xl font-semibold rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300 hover-lift"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover-lift">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-4 group-hover:animate-pulse-glow transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="text-sm font-medium text-cyan-600 tracking-widest uppercase mb-4">MOST POPULAR</p>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">Ocean Treasures</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces that capture the essence of the ocean's beauty
            </p>
          </div>

          {/* Product Grid */}
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div
                    className="group cursor-pointer animate-fade-in-up hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-white mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <img
                        src={
                          product.product_images[0]?.image_url ||
                          "/placeholder.svg?height=400&width=400&query=ocean+jewelry"
                        }
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <span className="text-2xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products/bracelet">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 hover-lift"
              >
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl font-light text-gray-900 mb-6">Stay Connected to the Ocean</h2>
            <p className="text-xl text-gray-600 mb-10">
              Subscribe to our newsletter and be the first to discover new collections and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg"
              />
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 rounded-full font-semibold text-lg ripple">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
