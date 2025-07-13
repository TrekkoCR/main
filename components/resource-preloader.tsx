"use client"

import { useEffect } from "react"
import { imageOptimizationService } from "@/lib/services/image-optimization-service"

interface Resource {
  type: "image" | "font" | "script"
  url: string
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: "webp" | "avif" | "auto"
  }
}

interface ResourcePreloaderProps {
  resources: Resource[]
}

export function ResourcePreloader({ resources }: ResourcePreloaderProps) {
  useEffect(() => {
    // Only preload in browser environment
    if (typeof window === "undefined") return

    resources.forEach((resource) => {
      try {
        if (resource.type === "image") {
          // Use placeholder.svg instead of external URLs to avoid blob errors
          const imageUrl = resource.url.startsWith("/") ? resource.url : "/placeholder.svg?height=48&width=48"

          imageOptimizationService.preloadImage(imageUrl, resource.options)
        }
      } catch (error) {
        // Silently handle preload errors to avoid breaking the app
        console.warn("Failed to preload resource:", resource.url, error)
      }
    })
  }, [resources])

  return null // This component doesn't render anything
}
