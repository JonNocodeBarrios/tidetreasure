import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                <span className="text-cyan-500">TIDE</span>
                <span className="text-white">TREASURES</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Handcrafted ocean-inspired jewelry that captures the beauty and spirit of the sea.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <div className="space-y-3">
              <Link
                href="/products/bracelets"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Bracelets
              </Link>
              <Link
                href="/products/necklaces"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Necklaces
              </Link>
              <Link
                href="/products/earrings"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Earrings
              </Link>
              <Link href="/products/rings" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Rings
              </Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-semibold text-white mb-4">Customer Care</h3>
            <div className="space-y-3">
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact Us
              </Link>
              <Link href="/account" className="block text-gray-400 hover:text-white transition-colors text-sm">
                My Account
              </Link>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Shipping & Returns
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Size Guide
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-white mb-4">About</h3>
            <div className="space-y-3">
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Our Story
              </Link>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Sustainability
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Press
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Careers
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; 2024 TideTreasures. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
