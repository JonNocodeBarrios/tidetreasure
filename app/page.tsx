import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight, Star, Truck, Shield, RotateCcw, Sparkles, Award, Users } from "lucide-react"
import { getPublishedProducts } from "@/lib/products"

export default async function HomePage() {
  // Fetch featured products from Supabase
  const allProducts = await getPublishedProducts()
  const featuredProducts = allProducts.slice(0, 6) // Show first 6 products

  const features = [
    {
      icon: Truck,
      title: "Free Worldwide Shipping",
      description: "Complimentary shipping on all orders over $75",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: RotateCcw,
      title: "30-Day Returns",
      description: "Hassle-free returns within 30 days",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "Lifetime Warranty",
      description: "Comprehensive protection for your jewelry",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Handcrafted with finest materials",
      gradient: "from-amber-500 to-orange-500",
    },
  ]

  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "99.9%", label: "Satisfaction Rate", icon: Star },
    { number: "24/7", label: "Customer Support", icon: Shield },
    { number: "100+", label: "Unique Designs", icon: Sparkles },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background with enhanced gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-800" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-cyan-900/30" />

          {/* Animated background elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-24 fill-white/90">
            <path d="M0,120 C300,80 900,80 1200,120 L1200,120 L0,120 Z" className="animate-pulse" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white mobile-padding luxury-container animate-fade-in-up">
          <div className="max-w-5xl mx-auto">
            <h1 className="heading-luxury text-white mb-8">
              Where{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-medium">
                Ocean Dreams
              </span>{" "}
              Meet Luxury
            </h1>
            <p className="subheading-luxury text-blue-100 mb-12 max-w-3xl mx-auto">
              Discover our exclusive collection of handcrafted ocean-inspired jewelry, where each piece tells a story of
              elegance and the timeless beauty of the sea.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/products">
                <Button className="luxury-button text-lg px-12 py-6 ripple-button group">
                  EXPLORE COLLECTION
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/about">
                <Button className="luxury-button-secondary text-lg px-12 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-spacing bg-white/50">
        <div className="luxury-container mobile-padding">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-light text-blue-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="luxury-container mobile-padding">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-light text-blue-900 mb-6">Why Choose TideTreasures</h2>
            <p className="subheading-luxury max-w-2xl mx-auto">
              Experience luxury jewelry shopping with unmatched quality and service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="luxury-card p-8 text-center group hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">{feature.title}</h3>
                <p className="body-luxury">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="section-spacing bg-white">
        <div className="luxury-container mobile-padding">
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="text-sm font-medium text-cyan-600 tracking-widest uppercase mb-4 flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-2" />
              FEATURED COLLECTION
            </p>
            <h2 className="heading-luxury text-blue-900 mb-6">Ocean's Finest Treasures</h2>
            <p className="subheading-luxury max-w-2xl mx-auto">
              Handpicked pieces that capture the essence of the ocean's timeless beauty and elegance
            </p>
          </div>

          {/* Product Grid */}
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {featuredProducts.map((product, index) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div
                    className="group cursor-pointer animate-fade-in-up hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="luxury-card overflow-hidden mb-6 aspect-square">
                      <ProductImage
                        src={product.product_images[0]?.image_url}
                        alt={product.title}
                        className="w-full h-full"
                        priority={index < 3}
                      />
                    </div>

                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-medium text-blue-900 group-hover:text-cyan-600 transition-colors duration-300">
                        {product.title}
                      </h3>

                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? "text-amber-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">(4.8)</span>
                      </div>

                      <div className="flex items-center justify-center space-x-3">
                        <span className="text-2xl font-light text-blue-900">${Number(product.price).toFixed(2)}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                          Free Shipping
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-blue-400" />
              </div>
              <p className="subheading-luxury">New treasures arriving soon...</p>
            </div>
          )}

          <div className="text-center mt-16">
            <Link href="/products">
              <Button className="luxury-button-secondary text-lg px-12 py-4 group">
                View All Treasures
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-spacing bg-gradient-to-r from-blue-900 via-cyan-800 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-cyan-900/50" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="luxury-container mobile-padding relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-light mb-6">Stay Connected to the Ocean</h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Subscribe to our newsletter and be the first to discover new collections, exclusive offers, and
              ocean-inspired stories.
            </p>

            <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="luxury-input flex-1 bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-white/40"
              />
              <Button className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ripple-button">
                Subscribe
              </Button>
            </div>

            <p className="text-sm text-blue-200 mt-6">Join 50,000+ ocean lovers who trust TideTreasures</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
