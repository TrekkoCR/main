import { Suspense } from "react"
import type { Metadata } from "next"
import ComparadorClient from "./comparador-client"
import { FinancingTableSkeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Comparador de Financiamiento | Trekko",
  description:
    "Compare opciones de financiamiento para vehículos nuevos y usados de diferentes entidades financieras en Costa Rica.",
}

export default function ComparadorPage() {
  return (
    <Suspense fallback={<FinancingTableSkeleton />}>
      <ComparadorClient />
    </Suspense>
  )
}
