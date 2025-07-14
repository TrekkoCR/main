import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  verticalPadding?: "none" | "sm" | "md" | "lg" | "xl"
  background?: "default" | "muted" | "accent" | "primary" | "white"
}

export function Section({ children, className, id, verticalPadding = "md", background = "default" }: SectionProps) {
  const paddingClass =
    verticalPadding === "none"
      ? ""
      : verticalPadding === "sm"
        ? "py-4 md:py-6"
        : verticalPadding === "md"
          ? "py-6 md:py-8"
          : verticalPadding === "lg"
            ? "py-8 md:py-12"
            : "py-12 md:py-16"

  const backgroundClass =
    background === "muted"
      ? "bg-muted"
      : background === "accent"
        ? "bg-accent"
        : background === "primary"
          ? "bg-primary text-primary-foreground"
          : background === "white"
            ? "bg-white"
            : "bg-background"

  return (
    <section id={id} className={cn(paddingClass, backgroundClass, className)}>
      {children}
    </section>
  )
}
