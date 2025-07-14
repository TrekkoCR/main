"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient, setAuthErrorHandler } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/supabase/database.types"
import { getFriendlyErrorMessage } from "@/lib/errors"

// Añadir después de las importaciones
interface UserProfile {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

interface AuthError {
  type: "sessionExpired" | "initialLoadFailure" | "unknown"
  message: string
}

type AuthContextType = {
  user: User | null
  session: Session | null
  userRole: UserRole | null
  isLoading: boolean
  authError: AuthError | null // New property
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUserRole: (currentUser?: User | null) => Promise<void>
  clearAuthError: () => void // New method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const supabase = createClient()

  const handleAuthenticationError = async (type: AuthError["type"] = "sessionExpired", message?: string) => {
    console.warn(`Handling authentication error: ${type}`)
    // Attempt to refresh session one last time, just in case.
    // This might be redundant if customFetch already triggered this.
    if (supabase) {
      await supabase.auth.signOut().catch((err) => console.error("Error during sign out on auth error:", err)) // Clear local session
    }

    setUser(null)
    setSession(null)
    setUserRole(null)
    setAuthError({
      type,
      message: message || "Your session has expired or is invalid. Please log in again.",
    })
    setIsLoading(false) // Ensure loading is false so UI can react
  }

  const refreshUserRole = useCallback(
    async (currentUser?: User | null) => {
      const targetUser = currentUser || user // Prioritize passed user, fallback to state
      if (!targetUser) {
        setUserRole(null)
        return
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", targetUser.id) // Use targetUser.id
          .maybeSingle()

        if (error) {
          console.error("Error fetching user role:", error)
          if (error.code === "PGRST116" && error.message.includes("multiple rows")) {
            console.error(`CRITICAL: Multiple roles found for user ${targetUser.id}. Please check data integrity.`)
            setUserRole(null)
          } else if (error.status === 401) {
            handleAuthenticationError("sessionExpired", "Session became invalid while fetching user role.")
          } else {
            setUserRole(null)
          }
          return
        }

        if (data && data.role) {
          setUserRole(data.role as UserRole)
        } else {
          // Default to 'free_user' if no role is found or data.role is null/undefined
          setUserRole("free_user")
        }
      } catch (e) {
        console.error("Unexpected error in refreshUserRole:", e)
        setUserRole(null)
      }
    },
    [user, supabase],
  ) // Keep `user` in deps for calls outside onAuthStateChange

  useEffect(() => {
    setAuthErrorHandler(() =>
      handleAuthenticationError("sessionExpired", "Your session was detected as invalid. Please log in."),
    )

    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await refreshUserRole()
      }

      setIsLoading(false)
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setIsLoading(true)
      const freshUser = newSession?.user ?? null
      setSession(newSession)
      setUser(freshUser) // Update user state

      if (freshUser) {
        await refreshUserRole(freshUser) // Pass the fresh user directly
        setAuthError(null)
      } else {
        setUserRole(null)
        // If there was a user before and now there isn't, and it's not a manual sign out, consider it an issue.
        // However, handleAuthenticationError will be called by customFetch or periodic checks.
        // Only set error if _event suggests an issue not covered by other handlers.
        if (_event === "SIGNED_OUT" && user) {
          // Check if 'user' was previously set
          // This case is usually handled by signOut, but if it's an external sign out:
          // handleAuthenticationError('sessionExpired', 'You have been signed out.');
          // For now, let customFetch and periodic checks handle implicit session loss.
        } else if (_event === "USER_DELETED" || _event === "USER_BANNED") {
          handleAuthenticationError("unknown", "Your account status has changed. Please contact support.")
        }
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, user, refreshUserRole])

  useEffect(() => {
    if (!supabase || isLoading) return // Don't run if supabase not init or already loading

    const checkSession = async () => {
      if (document.hidden) return // Don't check if tab is not visible

      console.log("Periodic session check running...")
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error during periodic session check:", error)
        // Potentially handle this as an auth error if it's a network issue preventing checks
        // For now, we assume onAuthStateChange or customFetch will catch actual auth failures
        return
      }

      if (!currentSession && user) {
        // If user was logged in, but session is now null
        console.warn("Periodic check: Session is null, but user was present. Triggering re-auth.")
        handleAuthenticationError("sessionExpired", "Your session has timed out. Please log in again.")
      } else if (currentSession && !user) {
        // Session exists but user is not set in context, sync it
        setSession(currentSession)
        setUser(currentSession.user)
        await refreshUserRole()
        setAuthError(null)
      }
    }

    const intervalId = setInterval(checkSession, 5 * 60 * 1000) // Check every 5 minutes
    window.addEventListener("visibilitychange", checkSession)
    window.addEventListener("focus", checkSession)

    // Initial check on mount if not loading
    if (!isLoading && user) {
      // Check only if user is supposed to be logged in
      checkSession()
    }

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("visibilitychange", checkSession)
      window.removeEventListener("focus", checkSession)
    }
  }, [supabase, user, isLoading, refreshUserRole])

  const signUp = async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null) // Clear previous errors
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setIsLoading(false)
    if (error) setAuthError({ type: "unknown", message: getFriendlyErrorMessage(error) })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null) // Clear previous errors
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setIsLoading(false)
    if (error) {
      setAuthError({ type: "unknown", message: getFriendlyErrorMessage(error) })
    } else {
      // onAuthStateChange will handle setting user/session and clearing authError
    }
    return { error }
  }

  const signOut = async () => {
    // setIsLoading(true); // Eliminado
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserRole(null)
    setAuthError(null) // Clear any auth errors on explicit sign out
    // setIsLoading(false); // Eliminado
    // onAuthStateChange will also fire with SIGNED_OUT and handle isLoading
  }

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const value = {
    user,
    session,
    userRole,
    isLoading,
    authError, // Add
    signUp,
    signIn,
    signOut,
    refreshUserRole,
    clearAuthError, // Add
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
