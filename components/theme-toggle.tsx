"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/lib/stores/ui-store"
import { useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore()

  // Aplicar el tema al elemento HTML
  useEffect(() => {
    const root = window.document.documentElement

    // Eliminar clases anteriores
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Escuchar cambios en el tema del sistema
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : }
    </Button>
  )
}
