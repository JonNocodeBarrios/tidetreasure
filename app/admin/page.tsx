"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { checkAdminAccess } from "@/lib/admin"
import { AliExpressImport } from "@/components/admin/aliexpress-import"
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from "lucide-react"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for auth to finish loading
      if (loading) return

      // If no user is logged in, redirect to login with return URL
      if (!user) {
        router.push("/login?redirect=/admin")
        return
      }

      // Check if the logged-in user is the admin
      const hasAdminAccess = await checkAdminAccess(user.email)

      if (hasAdminAccess) {
        setIsAdmin(true)
        setCheckingAdmin(false)
      } else {
        // User is logged in but not admin - show access denied briefly then redirect
        setAccessDenied(true)
        setCheckingAdmin(false)

        // Redirect to home after a brief delay to show the access denied message
        setTimeout(() => {
          router.push("/")
        }, 2000)
      }
    }

    checkAccess()
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show access denied message for non-admin users
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
            <p className="text-sm text-gray-500 mb-6">Redirecting to home page...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user is not admin or not logged in, don't render anything (redirect will happen)
  if (!user || !isAdmin) {
    return null
  }

  const stats = [
    {
      title: "Total Products",
      value: "24",
      icon: Package,
      color: "text-blue-600",
      change: "+12%",
    },
    {
      title: "Published Products",
      value: "18",
      icon: TrendingUp,
      color: "text-green-600",
      change: "+8%",
    },
    {
      title: "Total Orders",
      value: "156",
      icon: ShoppingCart,
      color: "text-purple-600",
      change: "+23%",
    },
    {
      title: "Revenue",
      value: "$12,450",
      icon: DollarSign,
      color: "text-yellow-600",
      change: "+15%",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-medium">{user.email}</span> | Manage your TideTreasures store
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Product Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AliExpressImport />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
                  <p>Detailed analytics and reporting features will be available in the next update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
