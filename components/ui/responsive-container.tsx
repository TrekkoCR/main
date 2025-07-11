import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: boolean
  centered?: boolean
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "xl",
  padding = true,
  centered = true,
}: ResponsiveContainerProps) {
  const maxWidthClass =
    maxWidth === "sm"
      ? "max-w-screen-sm"
      : maxWidth === "md"
        ? "max-w-screen-md"
        : maxWidth === "lg"
          ? "max-w-screen-lg"
          : maxWidth === "xl"
            ? "max-w-screen-xl"
            : maxWidth === "2xl"
              ? "max-w-screen-2xl"
              : "max-w-full"

  const paddingClass = padding ? "px-4 sm:px-6 lg:px-8" : ""
  const centeredClass = centered ? "mx-auto" : ""

  return <div className={cn("w-full", maxWidthClass, paddingClass, centeredClass, className)}>{children}</div>
}
