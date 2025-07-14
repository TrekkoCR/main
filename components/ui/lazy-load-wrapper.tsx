"use client"

import type { ReactNode } from "react"
import { useLazyLoad } from "@/hooks/use-lazy-load"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LazyLoadWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  skeletonClassName?: string
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function LazyLoadWrapper({
  children,
  fallback,
  className,
  skeletonClassName,
  threshold = 0.1,
  rootMargin = "50px",
  triggerOnce = true,
}: LazyLoadWrapperProps) {
  const { ref, hasIntersected } = useLazyLoad<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
  })

  return (
    <div ref={ref} className={className}>
      {hasIntersected ? children : fallback || <Skeleton className={cn("h-32 w-full", skeletonClassName)} />}
    </div>
  )
}
