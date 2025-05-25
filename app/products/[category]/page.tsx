import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, Grid, List, Star, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { getPublishedProductsByCategory, getCategories, getPublishedProductsByCategoryDirect } from "@/lib/products"

interface CategoryPageProps {
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Try the direct join approach first, fallback to the two-step approach
  let products: any[] = []
  let categories: any[] = []

  try {
    // Fetch products for this category from Supabase using direct join
    products = await getPublishedProductsByCategoryDirect(params.category)

    // If no products found with direct join, try the two-step approach
    if (products.length === 0) {
      products = await getPublishedProductsByCategory(params.category)
    }

    // Fetch categories for navigation
    categories = await getCategories()
  } catch (error) {
    console.error("Error fetching data:", error)
    products = []
    categories = []
  }

  // Find the current category info
  const currentCategory = categories.find((cat) => cat.slug === params.category)
  const categoryName = currentCategory?.name || params.category.charAt(0).toUpperCase() + params.category.slice(1)

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-light text-gray-900 mb-4">{categoryName}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our exquisite collection of ocean-inspired {params.category} that capture the essence of the sea.
            </p>
            <div className="mt-6">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {products.length} {products.length === 1 ? "Product" : "Products"} Available
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Best Selling</option>
            </select>
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Products Found</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              We don't have any {categoryName.toLowerCase()} available right now. Check back soon for new arrivals!
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-3 rounded-full">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div
                  className="group cursor-pointer animate-fade-in-up hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300">
                    <img
                      src={
                        product.product_images[0]?.image_url ||
                        "/placeholder.svg?height=400&width=400&query=ocean+jewelry" ||
                        "/placeholder.svg"
                      }
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">(4.5)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
                      <Badge variant="outline" className="text-xs">
                        Free Shipping
                      </Badge>
                    </div>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More (if needed) */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8 hover-lift">
              Load More Products
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
