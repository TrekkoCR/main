"use client"

import { useEffect, useRef, useState } from "react"

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(options: UseLazyLoadOptions = {}) {
  const { threshold = 0.1, rootMargin = "50px", triggerOnce = true } = options
  const elementRef = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Si ya ha intersectado y triggerOnce es true, no hacer nada
    if (hasIntersected && triggerOnce) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isCurrentlyIntersecting = entry.isIntersecting
          setIsIntersecting(isCurrentlyIntersecting)

          if (isCurrentlyIntersecting) {
            setHasIntersected(true)

            // Si triggerOnce es true, desconectar el observer
            if (triggerOnce) {
              observer.unobserve(element)
            }
          }
        })
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasIntersected])

  return {
    ref: elementRef,
    isIntersecting,
    hasIntersected,
  }
}
