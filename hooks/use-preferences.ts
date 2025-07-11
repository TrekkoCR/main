"use client"

import { useState, useCallback, useEffect } from "react"

interface PreferenceOptions<T> {
  storageKey?: string
  initialValues: T
  persist?: boolean
}

/**
 * Hook para manejar preferencias de usuario con persistencia opcional
 * @param options - Opciones de configuración
 * @returns - Estado y funciones para manejar preferencias
 */
export function usePreferences<T extends Record<string, any>>(options: PreferenceOptions<T>) {
  const { storageKey = "user_preferences", initialValues, persist = true } = options

  // Cargar preferencias desde localStorage si existen
  const loadStoredPreferences = (): T => {
    if (typeof window === "undefined" || !persist) {
      return initialValues
    }

    try {
      const storedValue = localStorage.getItem(storageKey)
      return storedValue ? JSON.parse(storedValue) : initialValues
    } catch (error) {
      console.error("Error loading preferences from localStorage:", error)
      return initialValues
    }
  }

  const [preferences, setPreferences] = useState<T>(loadStoredPreferences)

  // Actualizar una preferencia específica
  const updatePreference = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value }
      return updated
    })
  }, [])

  // Resetear todas las preferencias
  const resetPreferences = useCallback(() => {
    setPreferences(initialValues)
  }, [initialValues])

  // Persistir preferencias en localStorage cuando cambien
  useEffect(() => {
    if (typeof window !== "undefined" && persist) {
      localStorage.setItem(storageKey, JSON.stringify(preferences))
    }
  }, [preferences, storageKey, persist])

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences,
  }
}
