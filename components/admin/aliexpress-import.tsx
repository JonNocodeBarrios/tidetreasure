"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  importProductFromAliExpress,
  getAdminProducts,
  toggleProductVisibility,
  deleteProduct,
  type AdminProduct,
} from "@/lib/admin-products"
import {
  Download,
  Eye,
  EyeOff,
  Star,
  Truck,
  Package,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  fetchAliExpressProducts,
  checkApiConfiguration,
  testApiConnection,
  type ProcessedProduct,
} from "@/lib/aliexpress-api"

export function AliExpressImport() {
  const [aliExpressProducts, setAliExpressProducts] = useState<ProcessedProduct[]>([])
  const [importedProducts, setImportedProducts] = useState<AdminProduct[]>([])
  const [loadingAliExpress, setLoadingAliExpress] = useState(false)
  const [loadingImported, setLoadingImported] = useState(false)
  const [importingProducts, setImportingProducts] = useState<string[]>([])
  const [togglingProducts, setTogglingProducts] = useState<string[]>([])
  const [deletingProducts, setDeletingProducts] = useState<string[]>([])
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("jewelry")
  const [apiConfigured, setApiConfigured] = useState(true)
  const [apiMessage, setApiMessage] = useState("")
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null)

  useEffect(() => {
    const { isConfigured, message } = checkApiConfiguration()
    setApiConfigured(isConfigured)
    setApiMessage(message)
    loadImportedProducts()
  }, [])

  const handleTestConnection = async () => {
    setTestingConnection(true)
    try {
      const result = await testApiConnection()
      setConnectionTestResult(result)

      if (result.success) {
        toast({
          variant: "success",
          title: "Connection Test Successful",
          description: "AliExpress Data API is working correctly!",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Connection Test Failed",
          description: result.message,
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Test Error",
        description: error.message,
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const loadAliExpressProducts = async (customSearchTerm?: string) => {
    setLoadingAliExpress(true)
    try {
      const products = await fetchAliExpressProducts(customSearchTerm || searchTerm)
      setAliExpressProducts(products)

      if (products.length === 0) {
        toast({
          title: "No products found",
          description: "Try a different search term or check back later.",
        })
      } else {
        const isMockData = products.some((p) => p.id.startsWith("mock_"))
        toast({
          variant: "success",
          title: "Products loaded",
          description: `Found ${products.length} products ${isMockData ? "(demo data)" : "from AliExpress"}`,
        })
      }
    } catch (error: any) {
      console.error("Error loading AliExpress products:", error)
      toast({
        variant: "destructive",
        title: "Failed to load products",
        description: error.message || "Could not fetch products from AliExpress",
      })
      setAliExpressProducts([])
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

  const handleImportProduct = async (aliExpressProduct: ProcessedProduct) => {
    setImportingProducts((prev) => [...prev, aliExpressProduct.id])

    try {
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

      {/* API Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            AliExpress Data API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {apiConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">RapidAPI Connection</span>
            </div>
            <div className="flex items-center space-x-2">
              {apiConfigured ? (
                <Badge className="bg-green-100 text-green-800">Configured</Badge>
              ) : (
                <Badge variant="destructive">Not Configured</Badge>
              )}
              <Button onClick={handleTestConnection} disabled={testingConnection} size="sm" variant="outline">
                {testingConnection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>
          </div>

          {!apiConfigured && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="space-y-2">
                  <p className="font-medium">Environment Variables Required:</p>
                  <div className="text-sm space-y-1">
                    <p>
                      <code className="bg-yellow-200 px-1 rounded">NEXT_PUBLIC_RAPIDAPI_KEY</code> =
                      fbf5e4b213msh52135fde27158b8p16a425jsn5b3222baca18
                    </p>
                    <p>
                      <code className="bg-yellow-200 px-1 rounded">NEXT_PUBLIC_RAPIDAPI_HOST</code> =
                      aliexpress-data.p.rapidapi.com
                    </p>
                    <p>
                      <code className="bg-yellow-200 px-1 rounded">NEXT_PUBLIC_API_BASE_URL</code> =
                      https://aliexpress-data.p.rapidapi.com
                    </p>
                  </div>
                  <p className="text-sm">
                    Add these to your <code className="bg-yellow-200 px-1 rounded">.env.local</code> file and restart
                    the application.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {connectionTestResult && (
            <Alert
              className={connectionTestResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              {connectionTestResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={connectionTestResult.success ? "text-green-800" : "text-red-800"}>
                <p className="font-medium">{connectionTestResult.message}</p>
                {connectionTestResult.usingMockData && (
                  <p className="text-sm mt-1">Currently using demo data for testing purposes.</p>
                )}
                {connectionTestResult.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">View Details</summary>
                    <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(connectionTestResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>API Endpoint: https://aliexpress-data.p.rapidapi.com/product/search</p>
            <p>Rate limit: 1 request per 2 seconds</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="imported" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="imported">Imported Products ({importedProducts.length})</TabsTrigger>
          <TabsTrigger value="aliexpress">AliExpress Live Feed ({aliExpressProducts.length})</TabsTrigger>
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
              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search AliExpress products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          loadAliExpressProducts()
                        }
                      }}
                    />
                  </div>
                </div>
                <Button onClick={() => loadAliExpressProducts()} disabled={loadingAliExpress} className="px-6">
                  {loadingAliExpress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

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
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{product.title}</h3>
                          {product.id.startsWith("mock_") ? (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                              Demo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                              Live
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-cyan-600">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{product.currency}</span>
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

                        <div className="space-y-2">
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
                                Import to Store
                              </>
                            )}
                          </Button>

                          {product.productUrl && !product.id.startsWith("mock_") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => window.open(product.productUrl, "_blank")}
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
                              View on AliExpress
                            </Button>
                          )}
                        </div>
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
