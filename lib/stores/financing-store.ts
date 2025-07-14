import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { FinancingOption, FinancingFilters } from "@/lib/services/financing-service"
import { financingService } from "@/lib/services/financing-service"

interface FinancingState {
  // Estado
  options: FinancingOption[]
  isLoading: boolean
  error: string | null
  filters: FinancingFilters
  calculatorParams: {
    loanAmount: number
    loanCurrency: string
    loanTerm: number
    downPayment: number
  }

  // Acciones
  fetchOptions: (filters?: FinancingFilters) => Promise<void>
  updateFilters: (filters: Partial<FinancingFilters>) => void
  resetFilters: () => void
  updateCalculatorParams: (params: Partial<typeof initialCalculatorParams>) => void
  resetCalculatorParams: () => void
}

// Valores iniciales
const initialFilters: FinancingFilters = {
  vehicleType: "todos",
  currency: "todos",
  searchTerm: "",
  termRange: [12, 96],
  downPaymentRange: [0, 50],
  interestRateRange: [0, 15],
}

const initialCalculatorParams = {
  loanAmount: 15000000,
  loanCurrency: "CRC",
  loanTerm: 60,
  downPayment: 20,
}

export const useFinancingStore = create<FinancingState>()(
  persist(
    (set, get) => ({
      options: [],
      isLoading: false,
      error: null,
      filters: initialFilters,
      calculatorParams: initialCalculatorParams,

      fetchOptions: async (filters) => {
        set({ isLoading: true, error: null })
        try {
          const currentFilters = filters || get().filters
          const options = await financingService.getFinancingOptions(currentFilters)
          set({ options, isLoading: false })
        } catch (error) {
          console.error("Error fetching financing options:", error)
          set({
            error: error instanceof Error ? error.message : "Error desconocido",
            isLoading: false,
            options: [], // Asegurar que siempre hay un valor válido
          })
        }
      },

      updateFilters: (newFilters) => {
        const updatedFilters = { ...get().filters, ...newFilters }
        set({ filters: updatedFilters })
        // No llamamos a fetchOptions aquí para evitar múltiples llamadas
        // El componente que usa este store debe decidir cuándo llamar a fetchOptions
      },

      resetFilters: () => set({ filters: initialFilters }),

      updateCalculatorParams: (params) =>
        set((state) => ({
          calculatorParams: { ...state.calculatorParams, ...params },
        })),

      resetCalculatorParams: () => set({ calculatorParams: initialCalculatorParams }),
    }),
    {
      name: "trekko-financing-storage",
      partialize: (state) => ({
        filters: state.filters,
        calculatorParams: state.calculatorParams,
      }),
    },
  ),
)
