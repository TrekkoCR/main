"use client"

import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/lib/supabase/database.types"

export function useRoleAccess() {
  const { userRole, isLoading } = useAuth()

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (isLoading) return false
    if (!userRole) return false

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole as UserRole)
    }

    return userRole === requiredRole
  }

  const isAdmin = () => hasRole("admin")
  const isPaidUser = () => hasRole(["admin", "paid_user"])

  return {
    hasRole,
    isAdmin,
    isPaidUser,
    userRole,
    isLoading,
  }
}
