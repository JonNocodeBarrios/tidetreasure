"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Heart, ShoppingBag, User, Menu, X, Shield, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { checkAdminAccess } from "@/lib/admin"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()
  const { getTotalItems } = useCart()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/products", label: "CATALOG", hasDropdown: true },
    { href: "/about", label: "ABOUT" },
    { href: "/contact", label: "CONTACT" },
  ]

  const categoryItems = [
    { href: "/products", label: "All Products" },
    { href: "/products/bracelet", label: "Bracelets" },
    { href: "/products/necklace", label: "Necklaces" },
    { href: "/products/earring", label: "Earrings" },
    { href: "/products/ring", label: "Rings" },
  ]

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg shadow-stone-900/5" : "bg-white/80 backdrop-blur-sm",
      )}
    >
      <div className="max-w-7xl mx-auto mobile-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Waves className="w-8 h-8 text-stone-900 group-hover:text-yellow-600 transition-colors duration-300" />
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-light tracking-wide">
              <span className="text-stone-900 font-medium">TIDE</span>
              <span className="text-yellow-600 ml-1">TREASURES</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={cn("nav-link text-sm tracking-wide py-2 px-1", isActiveLink(item.href) && "active")}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <svg
                      className="w-4 h-4 ml-1 inline transition-transform duration-300 group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {item.hasDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="luxury-card p-2 shadow-2xl">
                      {categoryItems.map((category) => (
                        <Link
                          key={category.href}
                          href={category.href}
                          className="block px-4 py-3 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all duration-200 font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl p-3 focus-luxury"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl p-3 focus-luxury"
            >
              <Heart className="w-5 h-5" />
            </Button>

            <Link href="/cart" className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl p-3 focus-luxury"
              >
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-scale-in">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl p-3 focus-luxury"
                    >
                      <Shield className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl p-3 focus-luxury"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button className="luxury-button-secondary text-sm px-6 py-2">Sign In</Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-2xl p-3 focus-luxury"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-stone-200 animate-fade-in-up">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block py-3 px-4 rounded-2xl font-medium transition-all duration-200",
                      isActiveLink(item.href)
                        ? "text-stone-900 bg-stone-100"
                        : "text-stone-700 hover:text-stone-900 hover:bg-stone-50",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>

                  {item.hasDropdown && (
                    <div className="ml-4 mt-2 space-y-2">
                      {categoryItems.map((category) => (
                        <Link
                          key={category.href}
                          href={category.href}
                          className="block py-2 px-4 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center py-3 px-4 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-2xl font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 mr-3" />
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
