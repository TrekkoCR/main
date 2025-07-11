import { createClientComponentClient, type SupabaseClientOptions } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Define a type for the auth error handler callback
export type AuthErrorHandler = () => Promise<void> | void

// Singleton instance of the auth error handler
// This is a bit of a workaround to avoid circular dependencies or overly complex prop drilling
// In a larger app, an event emitter or a more sophisticated DI system might be used.
let authErrorHandlerInstance: AuthErrorHandler | null = null

export const setAuthErrorHandler = (handler: AuthErrorHandler) => {
  authErrorHandlerInstance = handler
}

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const response = await fetch(input, init)
  if (response.status === 401) {
    // Check if the request was to the token refresh endpoint to avoid infinite loops
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url
    if (!url.includes("/token?grant_type=refresh_token")) {
      if (authErrorHandlerInstance) {
        // Non-blocking call to the error handler
        Promise.resolve(authErrorHandlerInstance()).catch((err) => console.error("Error in auth error handler:", err))
      } else {
        console.warn("Supabase client: AuthErrorHandler not set. A 401 error was detected but not handled globally.")
      }
    }
  }
  return response
}

// Create a single supabase client for the entire client-side application
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
  }

  const clientOptions: SupabaseClientOptions<Database> = {
    global: {
      fetch: customFetch,
    },
    auth: {
      // Auto refresh token is true by default with auth-helpers
      // persistSession is true by default
    },
  }

  return createClientComponentClient<Database>(
    {
      supabaseUrl,
      supabaseKey,
    },
    clientOptions,
  )
}
