"use client"

import { useState, useEffect } from "react"

interface ScreenSizeOptions {
  mobileBreakpoint?: number
  tabletBreakpoint?: number
}

/**
 * Hook para detectar el tamaño de pantalla y proporcionar información sobre el dispositivo
 * @param options - Opciones de configuración
 * @returns - Información sobre el tamaño de pantalla y tipo de dispositivo
 */
export function useScreenSize(options: ScreenSizeOptions = {}) {
  const { mobileBreakpoint = 768, tabletBreakpoint = 1024 } = options

  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : mobileBreakpoint,
  )

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    // Establecer el ancho inicial
    handleResize()

    // Añadir listener para cambios de tamaño
    window.addEventListener("resize", handleResize)

    // Limpiar listener
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = screenWidth < mobileBreakpoint
  const isTablet = screenWidth >= mobileBreakpoint && screenWidth < tabletBreakpoint
  const isDesktop = screenWidth >= tabletBreakpoint

  return {
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
  }
}
