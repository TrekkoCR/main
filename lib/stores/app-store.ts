import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { FinancingOption, FinancingFilters } from "@/lib/services/financing-service"
import { financingService } from "@/lib/services/financing-service"

// Tipos consolidados
export interface UserPreferences {
  currency: string
  vehicleType: string
  priceRange: [number, number]
  yearRange: [number, number]
  mileageRange: [number, number]
}

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
  dismissible?: boolean
}

// Estado consolidado
interface AppState {
  // User section
  user: {
    preferences: UserPreferences
    recentSearches: string[]
    savedComparisons: any[]
  }

  // Financing section
  financing: {
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
  }

  // UI section
  ui: {
    theme: "light" | "dark" | "system"
    sidebarOpen: boolean
    activeTab: string
  }

  // Notifications section
  notifications: {
    list: Notification[]
  }

  // Actions
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  addRecentSearch: (search: string) => void
  clearRecentSearches: () => void
  saveComparison: (comparison: any) => void
  removeSavedComparison: (id: string) => void

  fetchFinancingOptions: (filters?: FinancingFilters) => Promise<void>
  updateFinancingFilters: (filters: Partial<FinancingFilters>) => void
  resetFinancingFilters: () => void
  updateCalculatorParams: (params: any) => void
  resetCalculatorParams: () => void

  setTheme: (theme: "light" | "dark" | "system") => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void

  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

// Valores iniciales
const initialUserPreferences: UserPreferences = {
  currency: "CRC",
  vehicleType: "todos",
  priceRange: [0, 50000000],
  yearRange: [2010, 2024],
  mileageRange: [0, 200000],
}

const initialFinancingFilters: FinancingFilters = {
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

// Store consolidado
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: {
        preferences: initialUserPreferences,
        recentSearches: [],
        savedComparisons: [],
      },

      financing: {
        options: [],
        isLoading: false,
        error: null,
        filters: initialFinancingFilters,
        calculatorParams: initialCalculatorParams,
      },

      ui: {
        theme: "light",
        sidebarOpen: false,
        activeTab: "comparar",
      },

      notifications: {
        list: [],
      },

      // User actions
      updateUserPreferences: (newPreferences) =>
        set((state) => ({
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, ...newPreferences },
          },
        })),

      addRecentSearch: (search) =>
        set((state) => {
          const filteredSearches = state.user.recentSearches.filter((s) => s !== search)
          return {
            user: {
              ...state.user,
              recentSearches: [search, ...filteredSearches].slice(0, 10),
            },
          }
        }),

      clearRecentSearches: () =>
        set((state) => ({
          user: { ...state.user, recentSearches: [] },
        })),

      saveComparison: (comparison) =>
        set((state) => ({
          user: {
            ...state.user,
            savedComparisons: [...state.user.savedComparisons, comparison],
          },
        })),

      removeSavedComparison: (id) =>
        set((state) => ({
          user: {
            ...state.user,
            savedComparisons: state.user.savedComparisons.filter((c) => c.id !== id),
          },
        })),

      // Financing actions
      fetchFinancingOptions: async (filters) => {
        set((state) => ({
          financing: { ...state.financing, isLoading: true, error: null },
        }))

        try {
          const currentFilters = filters || get().financing.filters
          const options = await financingService.getFinancingOptions(currentFilters)
          set((state) => ({
            financing: { ...state.financing, options, isLoading: false },
          }))
        } catch (error) {
          console.error("Error fetching financing options:", error)
          set((state) => ({
            financing: {
              ...state.financing,
              error: error instanceof Error ? error.message : "Error desconocido",
              isLoading: false,
              options: [],
            },
          }))
        }
      },

      updateFinancingFilters: (newFilters) => {
        const updatedFilters = { ...get().financing.filters, ...newFilters }
        set((state) => ({
          financing: { ...state.financing, filters: updatedFilters },
        }))
      },

      resetFinancingFilters: () =>
        set((state) => ({
          financing: { ...state.financing, filters: initialFinancingFilters },
        })),

      updateCalculatorParams: (params) =>
        set((state) => ({
          financing: {
            ...state.financing,
            calculatorParams: { ...state.financing.calculatorParams, ...params },
          },
        })),

      resetCalculatorParams: () =>
        set((state) => ({
          financing: { ...state.financing, calculatorParams: initialCalculatorParams },
        })),

      // UI actions
      setTheme: (theme) =>
        set((state) => ({
          ui: { ...state.ui, theme },
        })),

      toggleSidebar: () =>
        set((state) => ({
          ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
        })),

      setSidebarOpen: (open) =>
        set((state) => ({
          ui: { ...state.ui, sidebarOpen: open },
        })),

      setActiveTab: (tab) =>
        set((state) => ({
          ui: { ...state.ui, activeTab: tab },
        })),

      // Notification actions
      addNotification: (notification) => {
        const id = Date.now().toString()
        const newNotification = {
          id,
          dismissible: true,
          duration: 5000,
          ...notification,
        }

        set((state) => ({
          notifications: {
            list: [...state.notifications.list, newNotification].slice(0, 5), // Keep max 5
          },
        }))

        // Auto-dismiss
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: {
                list: state.notifications.list.filter((n) => n.id !== id),
              },
            }))
          }, newNotification.duration)
        }
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: {
            list: state.notifications.list.filter((n) => n.id !== id),
          },
        })),

      clearNotifications: () =>
        set((state) => ({
          notifications: { list: [] },
        })),
    }),
    {
      name: "trekko-app-storage",
      partialize: (state) => ({
        user: {
          preferences: state.user.preferences,
          recentSearches: state.user.recentSearches,
          savedComparisons: state.user.savedComparisons,
        },
        financing: {
          filters: state.financing.filters,
          calculatorParams: state.financing.calculatorParams,
        },
        ui: {
          theme: state.ui.theme,
          activeTab: state.ui.activeTab,
        },
      }),
    },
  ),
)

// Hooks de conveniencia para backward compatibility
export const useUserStore = () => {
  const user = useAppStore((state) => state.user)
  const updateUserPreferences = useAppStore((state) => state.updateUserPreferences)
  const addRecentSearch = useAppStore((state) => state.addRecentSearch)
  const clearRecentSearches = useAppStore((state) => state.clearRecentSearches)
  const saveComparison = useAppStore((state) => state.saveComparison)
  const removeSavedComparison = useAppStore((state) => state.removeSavedComparison)

  return {
    ...user,
    updatePreferences: updateUserPreferences,
    addRecentSearch,
    clearRecentSearches,
    saveComparison,
    removeSavedComparison,
  }
}

export const useFinancingStore = () => {
  const financing = useAppStore((state) => state.financing)
  const fetchOptions = useAppStore((state) => state.fetchFinancingOptions)
  const updateFilters = useAppStore((state) => state.updateFinancingFilters)
  const resetFilters = useAppStore((state) => state.resetFinancingFilters)
  const updateCalculatorParams = useAppStore((state) => state.updateCalculatorParams)
  const resetCalculatorParams = useAppStore((state) => state.resetCalculatorParams)

  return {
    ...financing,
    fetchOptions,
    updateFilters,
    resetFilters,
    updateCalculatorParams,
    resetCalculatorParams,
  }
}

export const useUIStore = () => {
  const ui = useAppStore((state) => state.ui)
  const setTheme = useAppStore((state) => state.setTheme)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const setActiveTab = useAppStore((state) => state.setActiveTab)

  return {
    ...ui,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    setActiveTab,
  }
}

export const useNotificationStore = () => {
  const notifications = useAppStore((state) => state.notifications.list)
  const addNotification = useAppStore((state) => state.addNotification)
  const removeNotification = useAppStore((state) => state.removeNotification)
  const clearNotifications = useAppStore((state) => state.clearNotifications)

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}

export function useNotifications() {
  const { notifications, addNotification, removeNotification, clearNotifications } = useNotificationStore()

  const notifySuccess = (title: string, message: string, options = {}) => {
    addNotification({ type: "success", title, message, ...options })
  }

  const notifyError = (title: string, message: string, options = {}) => {
    addNotification({ type: "error", title, message, ...options })
  }

  const notifyWarning = (title: string, message: string, options = {}) => {
    addNotification({ type: "warning", title, message, ...options })
  }

  const notifyInfo = (title: string, message: string, options = {}) => {
    addNotification({ type: "info", title, message, ...options })
  }

  return {
    notifications,
    notify: addNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    removeNotification,
    clearNotifications,
  }
}
