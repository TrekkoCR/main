// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(key: string): void {
    this.metrics.set(key, performance.now())
  }

  endTimer(key: string): number {
    const startTime = this.metrics.get(key)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.metrics.delete(key)

    if (process.env.NODE_ENV === "development") {
      console.log(`⏱️ ${key}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  measureAsync<T>(key: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(key)
    return fn().finally(() => this.endTimer(key))
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window !== "undefined" && "memory" in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    }
  }
  return null
}
