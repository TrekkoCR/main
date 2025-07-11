import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ConsistentButtonProps extends ButtonProps {
  loading?: boolean
  shadow?: "none" | "sm" | "md" | "lg"
  hoverable?: boolean
  fullWidth?: boolean
}

export const ConsistentButton = forwardRef<HTMLButtonElement, ConsistentButtonProps>(
  ({ className, children, loading, shadow = "sm", hoverable = true, fullWidth = false, ...props }, ref) => {
    const shadowClass =
      shadow === "none"
        ? ""
        : shadow === "sm"
          ? "shadow-soft-sm"
          : shadow === "md"
            ? "shadow-soft-md"
            : "shadow-soft-lg"

    const hoverClass = hoverable ? "hover:shadow-soft-hover transition-consistent" : ""
    const widthClass = fullWidth ? "w-full" : ""

    return (
      <Button
        ref={ref}
        className={cn(shadowClass, hoverClass, widthClass, className)}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    )
  },
)

ConsistentButton.displayName = "ConsistentButton"
