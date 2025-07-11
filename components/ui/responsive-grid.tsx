import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 },
  gap = "md",
}: ResponsiveGridProps) {
  const colsClasses = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(" ")

  const gapClass =
    gap === "none"
      ? "gap-0"
      : gap === "xs"
        ? "gap-2"
        : gap === "sm"
          ? "gap-4"
          : gap === "md"
            ? "gap-6"
            : gap === "lg"
              ? "gap-8"
              : "gap-10"

  return <div className={cn("grid", colsClasses, gapClass, className)}>{children}</div>
}
