import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  // Estado
  theme: "light" | "dark" | "system"
  sidebarOpen: boolean
  activeTab: string

  // Acciones
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarOpen: false,
      activeTab: "comparar",

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "trekko-ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        activeTab: state.activeTab,
      }),
    },
  ),
)
