"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { useNotificationStore, type Notification } from "@/lib/stores/notification-store"

export function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />
    default:
      return null
  }
}

export function NotificationItem({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (notification.duration! / 100)
          return newProgress < 0 ? 0 : newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [notification.duration])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-lg border bg-background p-4 shadow-md"
      style={{ width: "100%", maxWidth: "400px" }}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />

        <div className="flex-1 space-y-1">
          <h3 className="font-medium">{notification.title}</h3>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
        </div>

        {notification.dismissible && (
          <button onClick={onDismiss} className="rounded-full p-1 hover:bg-muted" aria-label="Cerrar notificación">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-muted-foreground/20 w-full">
          <div
            className={`h-full ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                  ? "bg-red-500"
                  : notification.type === "warning"
                    ? "bg-amber-500"
                    : "bg-blue-500"
            }`}
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          />
        </div>
      )}
    </motion.div>
  )
}

export function NotificationsContainer() {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:bottom-4 md:right-4">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
