"use client"

import { usePathname } from "next/navigation"

import type React from "react"
import "./globals.css"
import { QueryStatus } from "@/components/ui/query-status"
import { NotificationsContainer } from "@/components/ui/notifications"
import { Sidebar } from "@/components/sidebar"
import { useScreenSize } from "@/hooks/use-screen-size"

import { useEffect, useState } from "react"
import { LogOut, Settings, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AuthProvider } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QueryProvider } from "@/lib/providers/query-provider"
import { getFriendlyErrorMessage } from "@/lib/errors"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const { isMobile } = useScreenSize()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById("sidebar")
        const sidebarToggle = document.getElementById("sidebar-toggle")

        if (
          sidebar &&
          !sidebar.contains(event.target as Node) &&
          sidebarToggle &&
          !sidebarToggle.contains(event.target as Node)
        ) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile, sidebarOpen])

  return (
    <html lang="en">
      <body className="flex h-screen w-full overflow-hidden bg-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              <div className="flex h-screen bg-background">
                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />

                {/* Mobile overlay */}
                {isMobile && sidebarOpen && (
                  <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Main content */}
                <main className="flex flex-1 flex-col">
                  {/* Main content area with restored scroll */}
                  <div className="flex flex-1 flex-col px-4 pt-16 pb-4 overflow-y-auto">{children}</div>
                </main>
              </div>
              <NotificationsContainer />
              <QueryStatus />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

function AuthDialog({
  open,
  onOpenChange,
  mode,
  onModeChange,
  onSignIn,
  onSignUp,
  dialogMessageOverride, // New prop
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
  onSignIn: (email: string, password: string) => Promise<{ error: any }>
  onSignUp: (email: string, password: string) => Promise<{ error: any }>
  dialogMessageOverride?: string // New prop
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === "login") {
        const { error } = await onSignIn(email, password)
        if (error) throw error
      } else {
        const { error } = await onSignUp(email, password)
        if (error) throw error
      }

      // Success
      onOpenChange(false)
      setEmail("")
      setPassword("")
      setName("")
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err)) // MODIFICADO
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Iniciar sesión" : "Registrarse"}</DialogTitle>
          <DialogDescription>
            {dialogMessageOverride ||
              (mode === "login"
                ? "Ingresa tus credenciales para acceder a tu cuenta."
                : "Crea una nueva cuenta para guardar tus conversaciones.")}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              disabled={isLoading}
            >
              {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "login"
                  ? "Iniciando sesión..."
                  : "Registrando..."
                : mode === "login"
                  ? "Iniciar sesión"
                  : "Registrarse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserProfileButton({
  user,
  userRole,
  onLogout,
}: {
  user: any
  userRole: string | null
  onLogout: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start gap-2 hover:bg-neutral-100 shadow-soft-sm"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={user.user_metadata?.avatar_url || "/placeholder.svg?height=40&width=40"}
              alt={user.user_metadata?.name || user.email}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{user.user_metadata?.name || user.email}</span>
            <span className="text-xs text-neutral-500">
              {userRole === "admin"
                ? "Administrador"
                : userRole === "paid_user"
                  ? "Usuario Premium"
                  : "Usuario Gratuito"}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Mi perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarItem({
  icon,
  title,
  subtitle,
  active = false,
  href,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  active?: boolean
  href?: string
  onClick?: () => void
}) {
  const content = (
    <div
      className={`flex items-center gap-3 rounded-md p-2 ${
        active ? "bg-white shadow-soft-sm" : "hover:bg-white/80 hover:shadow-soft-sm shadow-soft-hover"
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md">{icon}</div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-neutral-500">{subtitle}</span>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return (
    <div onClick={onClick} className="cursor-pointer">
      {content}
    </div>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V10.5C14 11.3284 13.3284 12 12.5 12H9L6 14.5V12H3.5C2.67157 12 2 11.3284 2 10.5V3.5Z"
        stroke="#1da1f2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalculatorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 2H3.5C2.67157 2 2 2.67157 2 3.5V12.5C2 13.3284 2.67157 14 3.5 14H12.5C13.3284 14 14 13.3284 14 12.5V3.5C14 2.67157 13.3284 2 12.5 2Z"
        stroke="#1da1f2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 5H11" stroke="#1da1f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8H5.01" stroke="#1da1f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8H8.01" stroke="#1da1f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 8H11.01" stroke="#1da1f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 11H5.01" stroke="#1da1f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11H8.01" stroke="#1da1f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 11H11.01" stroke="#1da1f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VehicleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 10.5H13.5M3.5 13.5H4.5M11.5 13.5H12.5M4 7.5L5.5 3.5H10.5L12 7.5M3.5 10.5C3.5 11.6046 2.60457 12.5 1.5 12.5V10.5C1.5 9.39543 2.39543 8.5 3.5 8.5H12.5C13.6046 8.5 14.5 9.39543 14.5 10.5V12.5C13.3954 12.5 12.5 11.6046 12.5 10.5"
        stroke="#1da1f2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
