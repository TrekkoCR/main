interface SupabaseError extends Error {
  code?: string
  details?: string
  hint?: string
  status?: number
}

// Lista de mensajes de error comunes de Supabase y sus traducciones/mejoras
const supabaseErrorMap: Record<string, string> = {
  "Invalid login credentials": "Correo electrónico o contraseña incorrectos. Por favor, verifica tus datos.",
  "User already registered": "Este correo electrónico ya está registrado. Intenta iniciar sesión.",
  "Email rate limit exceeded": "Se han enviado demasiadas solicitudes para este correo. Intenta más tarde.",
  "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
  "Unable to validate email address: invalid format": "El formato del correo electrónico no es válido.",
  "NetworkError when attempting to fetch resource":
    "Error de red. Verifica tu conexión a internet e inténtalo de nuevo.",
  "Failed to fetch": "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.",
  // Puedes agregar más códigos de error específicos de PostgREST aquí si es necesario
}

export function getFriendlyErrorMessage(error: Error | SupabaseError | any): string {
  // Siempre es buena idea loguear el error original para depuración interna
  console.error("Error original capturado:", error)

  if (error && typeof error === "object") {
    // Intentar con el mapa de errores conocidos primero
    if ("message" in error && typeof error.message === "string") {
      for (const key in supabaseErrorMap) {
        if (error.message.includes(key)) {
          return supabaseErrorMap[key]
        }
      }
    }

    // Errores específicos de Supabase con `status`
    const supabaseError = error as SupabaseError
    if (supabaseError.status) {
      switch (supabaseError.status) {
        case 401:
          return "Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente."
        case 403:
          return "No tienes permiso para realizar esta acción."
        case 404:
          return "El recurso solicitado no fue encontrado."
        case 429:
          return "Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde."
        // Otros códigos de estado HTTP relevantes
      }
    }

    // Si es un error con `message` pero no mapeado arriba
    if ("message" in error && typeof error.message === "string") {
      // Para errores genéricos de Supabase que no están en el mapa pero tienen un mensaje
      if (error.message.toLowerCase().includes("supabase") || error.message.toLowerCase().includes("postgrest")) {
        return `Error del sistema: ${error.message}. Si el problema persiste, contacta a soporte.`
      }
      // Devolver el mensaje de error si es relativamente simple, de lo contrario, un mensaje genérico.
      // Esto evita exponer detalles técnicos excesivos al usuario.
      if (
        error.message.length < 120 &&
        !error.message.match(/SQL|query|database|constraint|foreign key|unique constraint/i)
      ) {
        return error.message
      }
    }
  }

  // Mensaje genérico por defecto si ninguna de las condiciones anteriores se cumple
  return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde o contacta a soporte si el problema continúa."
}
