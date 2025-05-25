"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

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
      "luxury+ocean+jewelry+pearl+background",
      "elegant+seashell+luxury+jewelry",
      "ocean+waves+luxury+jewelry+background",
      "pearl+luxury+jewelry+soft+lighting",
      "coral+reef+luxury+jewelry+background",
      "ocean+depth+luxury+jewelry+blue",
      "sea+foam+luxury+jewelry+elegant",
      "nautical+luxury+jewelry+gold+accents",
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
          "flex items-center justify-center",
          "bg-gradient-to-br from-blue-50 via-cyan-25 to-blue-25",
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
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-cyan-900/5" />
      </div>
    )
  }

  return (
    <div className={cn("product-image-container relative", className)}>
      {imageLoading && (
        <div className={cn("absolute inset-0 loading-skeleton rounded-2xl", "flex items-center justify-center")}>
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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
