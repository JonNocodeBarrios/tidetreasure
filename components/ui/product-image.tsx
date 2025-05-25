"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"

interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  priority = false,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Check if we have a valid image source
  const hasValidSrc = src && src.trim() !== "" && !imageError

  // Generate luxury ocean-themed placeholder based on product name
  const getPlaceholderImage = (productName: string) => {
    const themes = [
      "luxury+ocean+jewelry+pearl+elegant",
      "seashell+luxury+jewelry+gold+accents",
      "ocean+waves+luxury+jewelry+blue",
      "coral+reef+luxury+jewelry+warm",
      "nautical+luxury+jewelry+sophisticated",
      "sea+foam+luxury+jewelry+minimal",
      "ocean+depth+luxury+jewelry+dark",
      "pearl+luxury+jewelry+soft+lighting",
    ]

    // Use product name to consistently select the same theme
    const themeIndex = productName.length % themes.length
    const selectedTheme = themes[themeIndex]

    return `/placeholder.svg?height=600&width=600&query=${selectedTheme}`
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  if (!hasValidSrc) {
    return (
      <div
        className={cn(
          "product-image-placeholder",
          "flex flex-col items-center justify-center",
          "bg-gradient-to-br from-stone-100 to-stone-200",
          "relative overflow-hidden",
          fallbackClassName,
          className,
        )}
      >
        <img
          src={getPlaceholderImage(alt) || "/placeholder.svg"}
          alt={`${alt} - Ocean Jewelry`}
          className="w-full h-full object-cover opacity-90"
          loading={priority ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 via-transparent to-transparent" />
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <Package className="w-4 h-4 text-stone-600" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("product-image-container relative", className)}>
      {imageLoading && (
        <div className={cn("absolute inset-0 loading-skeleton rounded-2xl", "flex items-center justify-center")}>
          <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
        </div>
      )}

      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn("product-image", imageLoading ? "opacity-0" : "opacity-100", "transition-opacity duration-500")}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? "eager" : "lazy"}
      />

      <div className="product-image-overlay" />
    </div>
  )
}
