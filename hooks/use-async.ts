"use client"

import { useState, useCallback, useEffect } from "react"
import { useNotifications } from "@/lib/stores/notification-store"
import { getFriendlyErrorMessage } from "@/lib/errors"

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

interface AsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => boolean | void // Si devuelve true, suprime la notificación automática
  immediate?: boolean
  customErrorMessage?: string | ((error: Error) => string)
  successMessage?: string // Mensaje de éxito opcional
  successTitle?: string // Título para notificación de éxito
  errorTitle?: string // Título para notificación de error
}

export function useAsync<T, P extends any[] = any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  options: AsyncOptions<T> = {},
) {
  const {
    onSuccess,
    onError,
    immediate = false,
    customErrorMessage,
    successMessage,
    successTitle = "Éxito", // Título por defecto para éxito
    errorTitle = "Error", // Título por defecto para error
  } = options

  const { notifyError, notifySuccess } = useNotifications()
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  })

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    })
  }, [])

  const execute = useCallback(
    async (...args: P): Promise<T | undefined> => {
      setState((prevState) => ({
        ...prevState,
        isLoading: true,
        error: null,
      }))

      try {
        const data = await asyncFunction(...args)
        setState({
          data,
          isLoading: false,
          error: null,
        })

        if (onSuccess) {
          onSuccess(data)
        }
        if (successMessage) {
          notifySuccess(successTitle, successMessage)
        }

        return data
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error(String(error))
        setState({
          data: null,
          isLoading: false,
          error: errorObject,
        })

        let message: string
        if (typeof customErrorMessage === "function") {
          message = customErrorMessage(errorObject)
        } else if (typeof customErrorMessage === "string") {
          message = customErrorMessage
        } else {
          message = getFriendlyErrorMessage(errorObject)
        }

        const suppressNotification = onError ? onError(errorObject) : false

        if (!suppressNotification) {
          notifyError(errorTitle, message)
        }

        return undefined
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      asyncFunction,
      onSuccess,
      onError,
      customErrorMessage,
      successMessage,
      successTitle,
      errorTitle,
      notifyError,
      notifySuccess,
    ],
  )

  useEffect(() => {
    if (immediate) {
      // Si la función asíncrona no espera argumentos, P será `void[]` o similar.
      // casteamos `[]` a `P` para satisfacer TypeScript.
      execute(...([] as unknown as P))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]) // `execute` está memoizado, no es necesario como dependencia aquí.

  return {
    ...state,
    execute,
    reset,
  }
}
