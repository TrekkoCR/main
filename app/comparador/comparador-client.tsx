"use client"

import dynamic from "next/dynamic"
import { FinancingTableSkeleton } from "@/components/ui/skeleton"

// Dynamic import to avoid SSR issues and improve performance
const OptimizedComparadorPage = dynamic(() => import("./optimized-page"), {
  loading: () => <FinancingTableSkeleton />,
  ssr: false,
})

export default function ComparadorClient() {
  return <OptimizedComparadorPage />
}
