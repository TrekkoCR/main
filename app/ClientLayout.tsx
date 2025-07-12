"use client"

import type React from "react"
import "./globals.css"
import { QueryStatus } from "@/components/ui/query-status"
import { NotificationsContainer } from "@/components/ui/notifications"

import { useEffect, useState } from "react"
import { ChevronLeft, LogOut, MessageCircle, Settings, User, Menu } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Removed: import { ThemeToggle } from "@/components/theme-toggle"
import { QueryProvider } from "@/lib/providers/query-provider"
import { getFriendlyErrorMessage } from "@/lib/errors"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen w-full overflow-hidden bg-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              <ClientLayoutContent>{children}</ClientLayoutContent>
              <NotificationsContainer />
              <QueryStatus />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [authDialogMessage, setAuthDialogMessage] = useState<string | undefined>(undefined)
  const pathname = usePathname()

  const { user, userRole, isLoading, signIn, signUp, signOut, authError, clearAuthError } = useAuth()
  const isAuthenticated = !!user

  // Close sidebar when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
        // Dispatch sidebar closed event
        document.dispatchEvent(new CustomEvent("sidebar-closed"))
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Listen for custom sidebar toggle event
  useEffect(() => {
    const handleToggleSidebar = () => {
      const newState = !sidebarOpen
      setSidebarOpen(newState)

      // Dispatch sidebar state events
      if (newState) {
        document.dispatchEvent(new CustomEvent("sidebar-opened"))
      } else {
        document.dispatchEvent(new CustomEvent("sidebar-closed"))
      }
    }

    document.addEventListener("toggle-sidebar", handleToggleSidebar)

    return () => {
      document.removeEventListener("toggle-sidebar", handleToggleSidebar)
    }
  }, [sidebarOpen])

  useEffect(() => {
    if (authError && !authDialogOpen) {
      // Open dialog only if not already open due to authError
      setAuthDialogMessage(authError.message)
      setAuthMode("login")
      setAuthDialogOpen(true)
    }
  }, [authError, authDialogOpen])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)

    // Dispatch sidebar state events
    if (newState) {
      document.dispatchEvent(new CustomEvent("sidebar-opened"))
    } else {
      document.dispatchEvent(new CustomEvent("sidebar-closed"))
    }
  }

  const startNewChat = () => {
    // Navigate to home to start a new chat
    window.location.href = "/"
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    document.dispatchEvent(new CustomEvent("sidebar-closed"))
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={closeSidebar} />}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 md:hidden transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <MobileSidebar
          onClose={closeSidebar}
          onNewChat={startNewChat}
          isAuthenticated={isAuthenticated}
          user={user}
          userRole={userRole}
          isLoading={isLoading}
          onLogin={() => {
            setAuthMode("login")
            setAuthDialogOpen(true)
          }}
          onLogout={signOut}
          pathname={pathname}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 border-r border-neutral-200 bg-neutral-50">
        <DesktopSidebar
          onNewChat={startNewChat}
          isAuthenticated={isAuthenticated}
          user={user}
          userRole={userRole}
          isLoading={isLoading}
          onLogin={() => {
            setAuthMode("login")
            setAuthDialogOpen(true)
          }}
          onLogout={signOut}
          pathname={pathname}
        />
      </div>

      {/* Hamburger menu button - visible only when sidebar is closed */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col px-4 pt-16 pb-4">{children}</div>
      </main>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={(isOpen) => {
          setAuthDialogOpen(isOpen)
          if (!isOpen) {
            // If dialog is closed
            if (authError) clearAuthError() // Clear the error if it was an auth error dialog
            setAuthDialogMessage(undefined) // Reset message
          }
        }}
        mode={authMode}
        onModeChange={setAuthMode}
        onSignIn={async (email, password) => {
          const result = await signIn(email, password)
          if (!result.error) {
            setAuthDialogOpen(false) // Close on success
            clearAuthError()
            setAuthDialogMessage(undefined)
          }
          return result
        }}
        onSignUp={async (email, password) => {
          const result = await signUp(email, password)
          if (!result.error) {
            setAuthDialogOpen(false) // Close on success
            clearAuthError()
            setAuthDialogMessage(undefined)
          }
          return result
        }}
        dialogMessageOverride={authDialogMessage}
      />
    </>
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

function MobileSidebar({
  onClose,
  onNewChat,
  isAuthenticated,
  user,
  userRole,
  isLoading,
  onLogin,
  onLogout,
  pathname,
}: {
  onClose: () => void
  onNewChat: () => void
  isAuthenticated: boolean
  user: any
  userRole: string | null
  isLoading: boolean
  onLogin: () => void
  onLogout: () => void
  pathname: string
}) {
  return (
    <div className="h-full w-full bg-neutral-50 flex flex-col">
      <div className="flex justify-between items-center p-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-neutral-200 rounded-md flex items-center justify-center">
            <span className="text-xs text-neutral-500">Logo</span>
          </div>
          <span className="text-lg font-medium text-neutral-900">Trekko CR</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-2 space-y-2">
        <SidebarItem
          icon={<ChatIcon />}
          title="Chat"
          subtitle="Tu asesor personal"
          active={pathname === "/"}
          href="/"
        />
        <SidebarItem
          icon={<CalculatorIcon />}
          title="Comparador"
          subtitle="Opciones de Financiamiento"
          href="/comparador"
          active={pathname.includes("/comparador")}
        />
        <SidebarItem
          icon={<VehicleIcon />}
          title="Car Ranking"
          subtitle="El auto perfecto"
          href="/car-ranking"
          active={pathname.includes("/car-ranking")}
        />
      </div>
      <Separator className="my-2" />
      <Button
        onClick={() => {
          onNewChat()
          onClose()
        }}
        variant="ghost"
        className="w-full justify-start gap-3 h-10 p-2 text-neutral-800 hover:bg-white/80 hover:shadow-soft-sm mb-3"
      >
        <div className="flex h-8 w-8 items-center justify-center">
          <MessageCircle className="h-4 w-4" style={{ color: "#1da1f2" }} />
        </div>
        <span className="text-sm font-medium">Nuevo Chat</span>
      </Button>
      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-neutral-900 mb-3">Conversaciones</h2>
        <p className="text-xs text-neutral-500">
          Las conversaciones con Trekko se mostrarán acá.
          {!isAuthenticated && " Registrate para mantener tus conversaciones."}
        </p>
      </div>
      <div className="mt-auto p-4">
        {isLoading ? (
          <div className="w-full text-center py-2 text-sm text-muted-foreground">Cargando...</div>
        ) : isAuthenticated && user ? (
          <UserProfileButton user={user} userRole={userRole} onLogout={onLogout} />
        ) : (
          <Button
            onClick={() => {
              onLogin()
              onClose()
            }}
            className="w-full bg-neutral-800 hover:bg-neutral-700 shadow-soft-sm shadow-soft-hover"
          >
            Iniciar sesión
          </Button>
        )}
      </div>
    </div>
  )
}

function DesktopSidebar({
  onNewChat,
  isAuthenticated,
  user,
  userRole,
  isLoading,
  onLogin,
  onLogout,
  pathname,
}: {
  onNewChat: () => void
  isAuthenticated: boolean
  user: any
  userRole: string | null
  isLoading: boolean
  onLogin: () => void
  onLogout: () => void
  pathname: string
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 p-4 mb-2">
        <div className="w-9 h-9 bg-neutral-200 rounded-md flex items-center justify-center">
          <span className="text-xs text-neutral-500">Logo</span>
        </div>
        <span className="text-lg font-medium text-neutral-900">Trekko CR</span>
      </div>
      <div className="p-2 space-y-2">
        <SidebarItem
          icon={<ChatIcon />}
          title="Chat"
          subtitle="Tu asesor personal"
          active={pathname === "/"}
          href="/"
        />
        <SidebarItem
          icon={<CalculatorIcon />}
          title="Comparador"
          subtitle="Opciones de Financiamiento"
          href="/comparador"
          active={pathname.includes("/comparador")}
        />
        <SidebarItem
          icon={<VehicleIcon />}
          title="Car Ranking"
          subtitle="El auto perfecto"
          href="/car-ranking"
          active={pathname.includes("/car-ranking")}
        />
      </div>
      <Separator className="my-2" />
      <Button
        onClick={onNewChat}
        variant="ghost"
        className="w-full justify-start gap-3 h-10 p-2 text-neutral-800 hover:bg-white/80 hover:shadow-soft-sm mb-3"
      >
        <div className="flex h-8 w-8 items-center justify-center">
          <MessageCircle className="h-4 w-4" style={{ color: "#1da1f2" }} />
        </div>
        <span className="text-sm font-medium">Nuevo Chat</span>
      </Button>
      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-neutral-900 mb-3">Conversaciones</h2>
        <p className="text-xs text-neutral-500">
          Las conversaciones con Trekko se mostrarán acá.
          {!isAuthenticated && " Registrate para mantener tus conversaciones."}
        </p>
      </div>
      <div className="mt-auto p-4">
        {isLoading ? (
          <div className="w-full text-center py-2 text-sm text-muted-foreground">Cargando...</div>
        ) : isAuthenticated && user ? (
          <UserProfileButton user={user} userRole={userRole} onLogout={onLogout} />
        ) : (
          <Button
            onClick={onLogin}
            className="w-full bg-neutral-800 hover:bg-neutral-700 shadow-soft-sm shadow-soft-hover"
          >
            Iniciar sesión
          </Button>
        )}
      </div>
    </div>
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
