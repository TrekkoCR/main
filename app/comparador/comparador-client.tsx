"use client"

import dynamic from "next/dynamic"

// Importar el componente de forma dinámica para evitar problemas de hidratación
const OptimizedComparadorPage = dynamic(() => import("./optimized-page"), {
  ssr: false,
})

export default function ComparadorClient() {
  return <OptimizedComparadorPage />
}
