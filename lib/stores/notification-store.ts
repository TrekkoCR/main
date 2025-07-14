import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number // en milisegundos
  dismissible?: boolean
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = uuidv4()
    const newNotification = {
      id,
      dismissible: true,
      duration: 5000, // 5 segundos por defecto
      ...notification,
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))

    // Auto-dismiss después de la duración especificada
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, newNotification.duration)
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },
}))

// Hook para usar notificaciones en cualquier componente
export function useNotifications() {
  const { addNotification, removeNotification, clearNotifications, notifications } = useNotificationStore()

  // Funciones de ayuda para tipos específicos de notificaciones
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
