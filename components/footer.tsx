import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Waves } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto mobile-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <Waves className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-light tracking-wide">
                <span className="text-white font-medium">TIDE</span>
                <span className="text-yellow-500 ml-1">TREASURES</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Handcrafted ocean-inspired jewelry that captures the beauty and spirit of the sea.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-stone-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors duration-200">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-6">Shop</h3>
            <div className="space-y-4">
              <Link
                href="/products"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                All Products
              </Link>
              <Link
                href="/products/bracelet"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Bracelets
              </Link>
              <Link
                href="/products/necklace"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Necklaces
              </Link>
              <Link
                href="/products/earring"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Earrings
              </Link>
              <Link
                href="/products/ring"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Rings
              </Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-semibold text-white mb-6">Customer Care</h3>
            <div className="space-y-4">
              <Link
                href="/contact"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Contact Us
              </Link>
              <Link
                href="/account"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                My Account
              </Link>
              <a href="#" className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm">
                Shipping & Returns
              </a>
              <a href="#" className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm">
                Size Guide
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-white mb-6">About</h3>
            <div className="space-y-4">
              <Link
                href="/about"
                className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Our Story
              </Link>
              <a href="#" className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm">
                Sustainability
              </a>
              <a href="#" className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm">
                Press
              </a>
              <a href="#" className="block text-stone-400 hover:text-white transition-colors duration-200 text-sm">
                Careers
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-stone-400 text-sm">&copy; 2024 TideTreasures. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-stone-400 hover:text-white transition-colors duration-200 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-stone-400 hover:text-white transition-colors duration-200 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-stone-400 hover:text-white transition-colors duration-200 text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
