"use client"

import { useCallback, useRef, useState } from "react"

// Optimized state hook that prevents unnecessary re-renders
export function useOptimizedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue)
  const stateRef = useRef<T>(initialValue)

  const setOptimizedState = useCallback((newValue: T | ((prev: T) => T)) => {
    const nextValue = typeof newValue === "function" ? (newValue as (prev: T) => T)(stateRef.current) : newValue

    // Only update if value actually changed
    if (Object.is(nextValue, stateRef.current)) {
      return
    }

    stateRef.current = nextValue
    setState(nextValue)
  }, [])

  return [state, setOptimizedState] as const
}

// Batched state updates
export function useBatchedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue)
  const pendingUpdates = useRef<((prev: T) => T)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const setBatchedState = useCallback((updater: (prev: T) => T) => {
    pendingUpdates.current.push(updater)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setState((prev) => {
        let result = prev
        for (const update of pendingUpdates.current) {
          result = update(result)
        }
        pendingUpdates.current = []
        return result
      })
    }, 0)
  }, [])

  return [state, setBatchedState] as const
}
