"use client"

import { useEffect } from "react"
import { imageOptimizationService } from "@/lib/services/image-optimization-service"

interface PreloadResource {
  type: "image" | "script" | "style" | "font"
  url: string
  options?: any
}

interface ResourcePreloaderProps {
  resources: PreloadResource[]
}

export function ResourcePreloader({ resources }: ResourcePreloaderProps) {
  useEffect(() => {
    resources.forEach((resource) => {
      switch (resource.type) {
        case "image":
          imageOptimizationService.preloadImage(resource.url, resource.options)
          break
        case "script":
          const script = document.createElement("link")
          script.rel = "preload"
          script.as = "script"
          script.href = resource.url
          document.head.appendChild(script)
          break
        case "style":
          const style = document.createElement("link")
          style.rel = "preload"
          style.as = "style"
          style.href = resource.url
          document.head.appendChild(style)
          break
        case "font":
          const font = document.createElement("link")
          font.rel = "preload"
          font.as = "font"
          font.href = resource.url
          font.crossOrigin = "anonymous"
          document.head.appendChild(font)
          break
      }
    })
  }, [resources])

  return null
}
