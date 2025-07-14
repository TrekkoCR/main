import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface UserPreferences {
  currency: string
  vehicleType: string
  priceRange: [number, number]
  yearRange: [number, number]
  mileageRange: [number, number]
}

interface UserState {
  preferences: UserPreferences
  recentSearches: string[]
  savedComparisons: any[]

  // Acciones
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  addRecentSearch: (search: string) => void
  clearRecentSearches: () => void
  saveComparison: (comparison: any) => void
  removeSavedComparison: (id: string) => void
}

// Valores iniciales
const initialPreferences: UserPreferences = {
  currency: "CRC",
  vehicleType: "todos",
  priceRange: [0, 50000000],
  yearRange: [2010, 2024],
  mileageRange: [0, 200000],
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      preferences: initialPreferences,
      recentSearches: [],
      savedComparisons: [],

      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      addRecentSearch: (search) =>
        set((state) => {
          // Evitar duplicados y mantener solo las 10 búsquedas más recientes
          const filteredSearches = state.recentSearches.filter((s) => s !== search)
          return {
            recentSearches: [search, ...filteredSearches].slice(0, 10),
          }
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      saveComparison: (comparison) =>
        set((state) => ({
          savedComparisons: [...state.savedComparisons, comparison],
        })),

      removeSavedComparison: (id) =>
        set((state) => ({
          savedComparisons: state.savedComparisons.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "trekko-user-storage",
      // Solo persistir ciertos campos
      partialize: (state) => ({
        preferences: state.preferences,
        recentSearches: state.recentSearches,
        savedComparisons: state.savedComparisons,
      }),
    },
  ),
)
