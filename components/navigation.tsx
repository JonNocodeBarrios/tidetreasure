"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Heart, ShoppingBag, User, Sun, Moon, Menu, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { checkAdminAccess } from "@/lib/admin"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const { user } = useAuth()
  const { getTotalItems } = useCart()

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminAccess = await checkAdminAccess(user.email)
        setIsAdmin(adminAccess)
      } else {
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [user])

  const toggleTheme = () => {
    setIsDark(!isDark)
    // In a real app, you'd implement theme switching here
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">
              <span className="text-cyan-500">TIDE</span>
              <span className="text-gray-900">TREASURES</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-cyan-500 font-medium hover:text-cyan-600 transition-colors">
              HOME
            </Link>
            <div className="relative group">
              <button className="text-gray-700 font-medium hover:text-gray-900 transition-colors flex items-center">
                CATALOG
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  href="/products"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg font-medium"
                >
                  All Products
                </Link>
                <Link
                  href="/products/bracelet"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Bracelets
                </Link>
                <Link
                  href="/products/necklace"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Necklaces
                </Link>
                <Link
                  href="/products/earring"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Earrings
                </Link>
                <Link
                  href="/products/ring"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors last:rounded-b-lg"
                >
                  Rings
                </Link>
              </div>
            </div>
            <Link href="/about" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
              ABOUT US
            </Link>
            <Link href="/contact" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
              CONTACT US
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
              <Search className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
              <Heart className="w-5 h-5" />
            </Button>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                      <Shield className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-gray-700 hover:text-gray-900">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-700 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-cyan-500 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                HOME
              </Link>
              <Link href="/products" className="text-gray-700 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                All Products
              </Link>
              <Link
                href="/products/bracelet"
                className="text-gray-700 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Bracelets
              </Link>
              <Link
                href="/products/necklace"
                className="text-gray-700 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Necklaces
              </Link>
              <Link
                href="/products/earring"
                className="text-gray-700 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Earrings
              </Link>
              <Link
                href="/products/ring"
                className="text-gray-700 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Rings
              </Link>
              <Link href="/about" className="text-gray-700 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                ABOUT US
              </Link>
              <Link href="/contact" className="text-gray-700 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                CONTACT US
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-700 font-medium py-2 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
