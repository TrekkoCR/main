"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { financingService, type FinancingFilters } from "@/lib/services/financing-service"
import { useFinancingStore } from "@/lib/stores/financing-store"
import { useCallback } from "react"

// Claves de consulta para React Query
export const financingKeys = {
  all: ["financing"] as const,
  options: (filters?: FinancingFilters) => [...financingKeys.all, "options", filters] as const,
  option: (id: number) => [...financingKeys.all, "option", id] as const,
  uniqueValues: () => [...financingKeys.all, "uniqueValues"] as const,
}

// Hook para obtener opciones de financiamiento con React Query
export function useFinancingOptions(enabled = true) {
  const { filters } = useFinancingStore()

  return useQuery({
    queryKey: financingKeys.options(filters),
    queryFn: () => financingService.getFinancingOptions(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    placeholderData: (previousData) => previousData, // Mantener datos anteriores mientras se recargan
  })
}

// Hook para obtener una opción de financiamiento específica
export function useFinancingOption(id: number) {
  return useQuery({
    queryKey: financingKeys.option(id),
    queryFn: () => financingService.getFinancingOptionById(id),
    enabled: !!id,
  })
}

// Hook para obtener valores únicos (entidades, monedas, tipos de vehículos)
export function useFinancingUniqueValues() {
  return useQuery({
    queryKey: financingKeys.uniqueValues(),
    queryFn: () => financingService.getUniqueValues(),
    staleTime: 1000 * 60 * 30, // 30 minutos (estos datos cambian con poca frecuencia)
  })
}

// Hook para filtrar opciones de financiamiento
export function useFilteredFinancingOptions() {
  const queryClient = useQueryClient()
  const { filters, updateFilters, resetFilters } = useFinancingStore()
  const { data: options, isLoading, error } = useFinancingOptions()

  // Función para actualizar filtros y refrescar datos si es necesario
  const updateFiltersAndRefetch = useCallback(
    (newFilters: Partial<FinancingFilters>) => {
      updateFilters(newFilters)

      // Invalidar la consulta para forzar una recarga
      // Solo si los filtros que cambiaron afectan la consulta del servidor
      const serverSideFilters = ["vehicleType", "currency", "searchTerm"]
      const hasServerSideFilterChanged = Object.keys(newFilters).some((key) => serverSideFilters.includes(key))

      if (hasServerSideFilterChanged) {
        queryClient.invalidateQueries({ queryKey: financingKeys.options() })
      }
    },
    [updateFilters, queryClient],
  )

  // Función para resetear filtros y refrescar datos
  const resetFiltersAndRefetch = useCallback(() => {
    resetFilters()
    queryClient.invalidateQueries({ queryKey: financingKeys.options() })
  }, [resetFilters, queryClient])

  return {
    options: options || [],
    isLoading,
    error,
    filters,
    updateFilters: updateFiltersAndRefetch,
    resetFilters: resetFiltersAndRefetch,
  }
}
