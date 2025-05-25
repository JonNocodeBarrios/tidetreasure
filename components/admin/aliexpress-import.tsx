"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { fetchAliExpressProducts, simulateImportProduct, type AliExpressProduct } from "@/lib/aliexpress-mock"
import {
  importProductFromAliExpress,
  getAdminProducts,
  toggleProductVisibility,
  deleteProduct,
  type AdminProduct,
} from "@/lib/admin-products"
import { Download, Eye, EyeOff, Star, Truck, Package, Trash2, RefreshCw } from "lucide-react"

export function AliExpressImport() {
  const [aliExpressProducts, setAliExpressProducts] = useState<AliExpressProduct[]>([])
  const [importedProducts, setImportedProducts] = useState<AdminProduct[]>([])
  const [loadingAliExpress, setLoadingAliExpress] = useState(false)
  const [loadingImported, setLoadingImported] = useState(false)
  const [importingProducts, setImportingProducts] = useState<string[]>([])
  const [togglingProducts, setTogglingProducts] = useState<string[]>([])
  const [deletingProducts, setDeletingProducts] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadAliExpressProducts()
    loadImportedProducts()
  }, [])

  const loadAliExpressProducts = async () => {
    setLoadingAliExpress(true)
    try {
      const products = await fetchAliExpressProducts()
      setAliExpressProducts(products)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load AliExpress products",
      })
    } finally {
      setLoadingAliExpress(false)
    }
  }

  const loadImportedProducts = async () => {
    setLoadingImported(true)
    try {
      const products = await getAdminProducts()
      setImportedProducts(products)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load imported products",
      })
    } finally {
      setLoadingImported(false)
    }
  }

  const handleImportProduct = async (aliExpressProduct: AliExpressProduct) => {
    setImportingProducts((prev) => [...prev, aliExpressProduct.id])

    try {
      // Simulate AliExpress import
      await simulateImportProduct(aliExpressProduct)

      // Import to Supabase
      const success = await importProductFromAliExpress(aliExpressProduct)

      if (success) {
        toast({
          variant: "success",
          title: "Product imported!",
          description: `${aliExpressProduct.title} has been imported successfully.`,
        })
        await loadImportedProducts() // Refresh imported products
      } else {
        throw new Error("Import failed")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "Failed to import product. Please try again.",
      })
    } finally {
      setImportingProducts((prev) => prev.filter((id) => id !== aliExpressProduct.id))
    }
  }

  const handleToggleVisibility = async (productId: string, currentStatus: boolean) => {
    setTogglingProducts((prev) => [...prev, productId])

    try {
      const success = await toggleProductVisibility(productId, !currentStatus)

      if (success) {
        toast({
          variant: "success",
          title: currentStatus ? "Product unpublished" : "Product published",
          description: `Product is now ${!currentStatus ? "visible" : "hidden"} on the website.`,
        })
        await loadImportedProducts() // Refresh products
      } else {
        throw new Error("Toggle failed")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product visibility.",
      })
    } finally {
      setTogglingProducts((prev) => prev.filter((id) => id !== productId))
    }
  }

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeletingProducts((prev) => [...prev, productId])

    try {
      const success = await deleteProduct(productId)

      if (success) {
        toast({
          variant: "success",
          title: "Product deleted",
          description: `${productTitle} has been deleted successfully.`,
        })
        await loadImportedProducts() // Refresh products
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product.",
      })
    } finally {
      setDeletingProducts((prev) => prev.filter((id) => id !== productId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
        <Button
          onClick={() => {
            loadAliExpressProducts()
            loadImportedProducts()
          }}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="imported" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="imported">Imported Products ({importedProducts.length})</TabsTrigger>
          <TabsTrigger value="aliexpress">AliExpress Feed ({aliExpressProducts.length})</TabsTrigger>
        </TabsList>

        {/* Imported Products Tab */}
        <TabsContent value="imported">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Imported Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingImported ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading imported products...</p>
                </div>
              ) : importedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products imported yet. Import some from the AliExpress feed to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {importedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.product_images[0]?.image_url || "/placeholder.svg"}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.title}</h3>
                          <p className="text-sm text-gray-600">
                            {product.category?.name || "No category"} • ${Number(product.price).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(product.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={product.is_published ? "default" : "secondary"}>
                          {product.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVisibility(product.id, product.is_published)}
                          disabled={togglingProducts.includes(product.id)}
                        >
                          {togglingProducts.includes(product.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : product.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id, product.title)}
                          disabled={deletingProducts.includes(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deletingProducts.includes(product.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AliExpress Feed Tab */}
        <TabsContent value="aliexpress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                AliExpress Product Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAliExpress ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading AliExpress products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aliExpressProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-cyan-600">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            {product.rating} ({product.reviews})
                          </div>
                          <div className="flex items-center">
                            <Package className="w-3 h-3 mr-1" />
                            {product.stock} in stock
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                          <span>Supplier: {product.supplier}</span>
                          <div className="flex items-center">
                            <Truck className="w-3 h-3 mr-1" />
                            {product.shippingTime}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => handleImportProduct(product)}
                          disabled={importingProducts.includes(product.id)}
                        >
                          {importingProducts.includes(product.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Importing...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Import Product
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
