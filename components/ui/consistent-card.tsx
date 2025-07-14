import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ConsistentCardProps {
  title?: string
  description?: string
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
  children?: ReactNode
  footer?: ReactNode
  compact?: boolean
  hoverable?: boolean
  shadow?: "none" | "sm" | "md" | "lg"
}

export function ConsistentCard({
  title,
  description,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  children,
  footer,
  compact = false,
  hoverable = false,
  shadow = "md",
}: ConsistentCardProps) {
  const shadowClass =
    shadow === "none" ? "" : shadow === "sm" ? "shadow-soft-sm" : shadow === "md" ? "shadow-soft-md" : "shadow-soft-lg"

  const hoverClass = hoverable ? "hover:shadow-soft-hover transition-consistent" : ""

  const paddingClass = compact ? "p-3 sm:p-4" : "p-4 sm:p-6"

  return (
    <Card className={cn(shadowClass, hoverClass, className)}>
      {(title || description) && (
        <CardHeader className={cn(compact ? "p-3 sm:p-4 pb-0" : "p-4 sm:p-6 pb-0", headerClassName)}>
          {title && <CardTitle className="text-lg sm:text-xl font-semibold">{title}</CardTitle>}
          {description && <CardDescription className="text-sm mt-1">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(paddingClass, contentClassName)}>{children}</CardContent>
      {footer && (
        <CardFooter className={cn(compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
