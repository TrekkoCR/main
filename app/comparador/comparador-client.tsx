"use client"

import dynamic from "next/dynamic"

const OptimizedComparadorPage = dynamic(() => import("./optimized-page"), {
  loading: () => <div>Cargando comparador...</div>,
  ssr: false,
})

export default function ComparadorClient() {
  return <OptimizedComparadorPage />
}
