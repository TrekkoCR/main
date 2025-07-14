"use client"

import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export function QueryStatus() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const [isVisible, setIsVisible] = useState(false)

  // Mostrar el indicador solo si la carga dura más de 300ms
  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isFetching || isMutating) {
      timeout = setTimeout(() => {
        setIsVisible(true)
      }, 300)
    } else {
      setIsVisible(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [isFetching, isMutating])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs flex items-center shadow-md z-50">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      <span>Cargando datos...</span>
    </div>
  )
}
