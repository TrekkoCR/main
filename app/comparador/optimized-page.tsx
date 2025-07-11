"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Calculator, SlidersHorizontal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useScreenSize } from "@/hooks/use-screen-size"
import { useUIStore } from "@/lib/stores/ui-store"
import { FinancingFilters as FinancingFiltersComponent } from "@/components/comparador/financing-filters"
import { useFilteredFinancingOptions } from "@/lib/hooks/use-financing-queries"
import { useNotifications } from "@/lib/stores/notification-store"
import { FinancingTableSkeleton, FinancingOptionSkeleton, CalculatorSkeleton } from "@/components/ui/skeleton"
import { ErrorDisplay } from "@/components/ui/error-display"
import { useQueryClient } from "@tanstack/react-query"
import { financingKeys } from "@/lib/hooks/use-financing-queries"
import { motion, AnimatePresence } from "framer-motion"
import { ResourcePreloader } from "@/components/resource-preloader"

// Importar componentes con carga diferida optimizada
const FinancingCalculator = dynamic(() => import("@/components/comparador/financing-calculator"), {
  loading: () => <CalculatorSkeleton />,
  ssr: false,
})

const FinancingResults = dynamic(() => import("@/components/comparador/financing-results"), {
  loading: () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <FinancingOptionSkeleton key={index} />
      ))}
    </div>
  ),
  ssr: false,
})

const FinancingOptionsTable = dynamic(() => import("@/components/comparador/financing-options-table"), {
  loading: () => <FinancingTableSkeleton />,
  ssr: false,
})

const OptimizedMobileFinancingCard = dynamic(() => import("@/components/comparador/optimized-mobile-financing-card"), {
  loading: () => <FinancingOptionSkeleton />,
  ssr: false,
})

const ProductDetailDialog = dynamic(() => import("@/components/comparador/product-detail-dialog"), {
  ssr: false,
})

export default function OptimizedComparadorPage() {
  // Detección de tamaño de pantalla
  const { isMobile } = useScreenSize()

  // Usar los stores
  const { activeTab, setActiveTab } = useUIStore()
  const { notifyError, notifySuccess, notifyInfo } = useNotifications()

  // Usar React Query
  const { options, isLoading, error } = useFilteredFinancingOptions()
  const queryClient = useQueryClient()

  // Estado para el detalle del producto
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showProductDetail, setShowProductDetail] = useState<boolean>(false)

  // Recursos críticos para precargar
  const criticalResources = [{ type: "image" as const, url: "/placeholder.svg", options: { width: 48, height: 48 } }]

  // Mostrar detalle del producto (memoizado)
  const handleShowProductDetail = useCallback((product: any) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }, [])

  // Función para reintentar la carga de datos
  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: financingKeys.options() })
    notifyInfo("Recargando datos", "Intentando cargar las opciones de financiamiento nuevamente.")
  }, [queryClient, notifyInfo])

  // Mostrar notificación de error si hay un error
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl min-h-screen">
        <div className="flex items-center justify-center h-64">
          <ErrorDisplay
            title="Error al cargar opciones de financiamiento"
            message="No se pudieron cargar las opciones de financiamiento. Por favor, inténtalo de nuevo."
            onRetry={handleRetry}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <ResourcePreloader resources={criticalResources} />

      <div className="container mx-auto py-6 px-4 max-w-6xl min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-3xl font-bold mb-2">Comparador de Financiamiento</h1>
          <p className="text-muted-foreground mb-6">
            Compare opciones de financiamiento para vehículos nuevos y usados de diferentes entidades financieras en
            Costa Rica.
          </p>
          <p className="text-muted-foreground mb-4">
            Información actualizada mm/dd/aaaa. Los cálculos son estimaciones y pueden variar según las condiciones finales de cada
            entidad.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="comparar" className="text-xs sm:text-sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Comparar Opciones</span>
              <span className="xs:hidden">Comparar</span>
            </TabsTrigger>
            <TabsTrigger value="calcular" className="text-xs sm:text-sm">
              <Calculator className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Calcular Cuota</span>
              <span className="xs:hidden">Calcular</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="comparar" className="space-y-6">
              {/* Filtros */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FinancingFiltersComponent />
              </motion.div>

              {/* Tabla comparativa (solo para desktop) / Tarjetas (para móvil) */}
              {isMobile ? (
                <div className="sm:hidden">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <FinancingOptionSkeleton key={index} />
                      ))}
                    </div>
                  ) : options && options.length > 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      {options.map((option, index) => (
                        <OptimizedMobileFinancingCard
                          key={option.id}
                          option={option}
                          onClick={handleShowProductDetail}
                          index={index}
                          priority={index < 3} // Priorizar las primeras 3 tarjetas
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No se encontraron opciones de financiamiento con los filtros seleccionados.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FinancingOptionsTable onSelectOption={handleShowProductDetail} />
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="calcular" className="space-y-4 sm:space-y-6">
              {/* Calculadora */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <FinancingCalculator />
              </motion.div>

              {/* Resultados de la calculadora */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full"
              >
                <FinancingResults onSelectOption={handleShowProductDetail} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Detalle del producto */}
        {showProductDetail && (
          <ProductDetailDialog product={selectedProduct} open={showProductDetail} onOpenChange={setShowProductDetail} />
        )}
      </div>
    </>
  )
}
