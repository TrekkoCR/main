import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime"

interface TypographyProps {
  children: ReactNode
  className?: string
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "small" | "muted" | "lead"
  as?: keyof JSX.IntrinsicElements
}

export function Typography({ children, className, variant = "p", as }: TypographyProps) {
  const Component =
    as ||
    (variant === "h1"
      ? "h1"
      : variant === "h2"
        ? "h2"
        : variant === "h3"
          ? "h3"
          : variant === "h4"
            ? "h4"
            : variant === "h5"
              ? "h5"
              : variant === "h6"
                ? "h6"
                : "p")

  const variantClasses =
    variant === "h1"
      ? "text-3xl font-bold tracking-tight sm:text-4xl"
      : variant === "h2"
        ? "text-2xl font-semibold tracking-tight sm:text-3xl"
        : variant === "h3"
          ? "text-xl font-semibold tracking-tight sm:text-2xl"
          : variant === "h4"
            ? "text-lg font-medium tracking-tight"
            : variant === "h5"
              ? "text-base font-medium tracking-tight"
              : variant === "h6"
                ? "text-sm font-medium tracking-tight"
                : variant === "small"
                  ? "text-sm"
                  : variant === "muted"
                    ? "text-sm text-muted-foreground"
                    : variant === "lead"
                      ? "text-xl text-muted-foreground"
                      : "text-base"

  return <Component className={cn(variantClasses, className)}>{children}</Component>
}
