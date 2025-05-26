"use client"

import type { ReactNode } from "react"
import { useRoleAccess } from "@/hooks/use-role-access"
import type { UserRole } from "@/lib/supabase/database.types"

interface RoleProtectedProps {
  children: ReactNode
  allowedRoles: UserRole | UserRole[]
  fallback?: ReactNode
}

export function RoleProtected({ children, allowedRoles, fallback = null }: RoleProtectedProps) {
  const { hasRole, isLoading } = useRoleAccess()

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
  }

  if (!hasRole(allowedRoles)) {
    return fallback
  }

  return <>{children}</>
}
