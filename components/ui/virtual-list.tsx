"use client"

import type React from "react"
import { useMemo, useState, useRef } from "react"

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = "",
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + overscan, items.length)

    const visibleStartIndex = Math.max(0, startIndex - overscan)
    const visibleItems = items.slice(visibleStartIndex, endIndex)

    return {
      visibleItems: visibleItems.map((item, index) => ({
        item,
        index: visibleStartIndex + index,
      })),
      totalHeight: items.length * itemHeight,
      offsetY: visibleStartIndex * itemHeight,
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
