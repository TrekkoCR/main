"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  className?: string
  containerClassName?: string
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  aspectRatio?: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  containerClassName,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  sizes,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Generar un placeholder blur si no se proporciona
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`,
  ).toString("base64")}`

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    // Usar imagen de placeholder en caso de error
    setImageSrc("/placeholder.svg")
    onError?.()
  }

  // Calcular sizes automáticamente si no se proporciona
  const calculateSizes = () => {
    if (sizes) return sizes
    if (fill) return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    if (width) {
      if (width < 640) return `${width}px`
      return "(max-width: 640px) 100vw, " + `${width}px`
    }
    return "100vw"
  }

  const containerStyle = aspectRatio
    ? { aspectRatio: aspectRatio.toString() }
    : height && width
      ? { aspectRatio: `${width}/${height}` }
      : undefined

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)} style={containerStyle}>
        {isLoading && <Skeleton className="absolute inset-0 z-10" />}
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className,
          )}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          sizes={calculateSizes()}
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">Error al cargar imagen</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative inline-block", containerClassName)} style={containerStyle}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" style={{ width: width || "100%", height: height || "100%" }} />
      )}
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        width={width || 100}
        height={height || 100}
        priority={priority}
        quality={quality}
        className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", className)}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        sizes={calculateSizes()}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">Error</span>
        </div>
      )}
    </div>
  )
}
