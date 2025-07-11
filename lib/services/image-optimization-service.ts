interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "auto"
}

class ImageOptimizationService {
  // Generar URL optimizada para imágenes
  getOptimizedUrl(originalUrl: string, options: ImageOptimizationOptions = {}): string {
    const { width, height, quality = 75, format = "auto" } = options

    // Si es una URL local o ya optimizada, devolverla tal cual
    if (originalUrl.startsWith("/") || originalUrl.includes("/_next/")) {
      return originalUrl
    }

    // Para URLs externas, usar el servicio de optimización de Next.js
    const params = new URLSearchParams()
    if (width) params.append("w", width.toString())
    if (height) params.append("h", height.toString())
    params.append("q", quality.toString())
    if (format !== "auto") params.append("fm", format)

    // Codificar la URL original
    const encodedUrl = encodeURIComponent(originalUrl)

    return `/_next/image?url=${encodedUrl}&${params.toString()}`
  }

  // Generar srcset para imágenes responsivas
  generateSrcSet(originalUrl: string, widths: number[], options: Omit<ImageOptimizationOptions, "width"> = {}): string {
    return widths
      .map((width) => {
        const url = this.getOptimizedUrl(originalUrl, { ...options, width })
        return `${url} ${width}w`
      })
      .join(", ")
  }

  // Generar sizes para imágenes responsivas
  generateSizes(breakpoints: { maxWidth?: number; size: string }[]): string {
    return breakpoints
      .map(({ maxWidth, size }) => {
        if (maxWidth) {
          return `(max-width: ${maxWidth}px) ${size}`
        }
        return size
      })
      .join(", ")
  }

  // Precargar imagen crítica
  preloadImage(url: string, options: ImageOptimizationOptions = {}): void {
    if (typeof window === "undefined") return

    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = this.getOptimizedUrl(url, options)

    // Añadir tipo de imagen si se especifica
    if (options.format && options.format !== "auto") {
      link.type = `image/${options.format}`
    }

    document.head.appendChild(link)
  }

  // Verificar soporte para formatos modernos
  supportsModernFormats(): { webp: boolean; avif: boolean } {
    if (typeof window === "undefined") {
      return { webp: true, avif: true }
    }

    const webpSupport = document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0

    // AVIF support detection es más complejo, por ahora asumimos que no está soportado en navegadores antiguos
    const avifSupport = false // Simplificado para este ejemplo

    return { webp: webpSupport, avif: avifSupport }
  }

  // Generar placeholder blur data URL
  generateBlurDataURL(width = 10, height = 10, color = "#f3f4f6"): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>
    `
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
  }
}

export const imageOptimizationService = new ImageOptimizationService()
