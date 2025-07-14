type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === "debug") {
      return // Skip debug logs in production
    }

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    }

    // Only log to console in development or for errors/warnings
    if (this.isDevelopment || level === "error" || level === "warn") {
      const logMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log

      if (data) {
        logMethod(`[${level.toUpperCase()}] ${message}`, data)
      } else {
        logMethod(`[${level.toUpperCase()}] ${message}`)
      }
    }

    // In production, you might want to send to a logging service
    if (!this.isDevelopment && (level === "error" || level === "warn")) {
      // TODO: Send to logging service like Sentry, LogRocket, etc.
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data)
  }

  info(message: string, data?: any) {
    this.log("info", message, data)
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data)
  }

  error(message: string, data?: any) {
    this.log("error", message, data)
  }
}

export const logger = new Logger()
