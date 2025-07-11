"use client"

import { memo } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import type { FinancingOption } from "@/lib/services/financing-service"
import { useFilteredFinancingOptions } from "@/lib/hooks/use-financing-queries"
import { FinancingTableSkeleton } from "@/components/ui/skeleton"
import { ErrorDisplay } from "@/components/ui/error-display"
import { useQueryClient } from "@tanstack/react-query"
import { financingKeys } from "@/lib/hooks/use-financing-queries"

interface FinancingOptionsTableProps {
  onSelectOption: (option: FinancingOption) => void
}

// Componente de fila de tabla memoizado
const MemoizedTableRow = memo(
  ({ option, onSelectOption }: { option: FinancingOption; onSelectOption: (option: FinancingOption) => void }) => {
    return (
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => onSelectOption(option)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelectOption(option)
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Ver detalles de ${option.entity} - ${option.product}`}
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
              <Image src={option.logo || "/placeholder.svg"} alt={option.entity} fill className="object-contain p-1" />
            </div>
            <div>
              <div className="font-medium">{option.entity}</div>
              <div className="text-sm text-muted-foreground">{option.product}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <span className="font-medium">{option.interestRate}%</span>
            <span className="ml-2 text-xs text-muted-foreground">({option.rateType})</span>
          </div>
        </TableCell>
        <TableCell>{option.maxTerm} meses</TableCell>
        <TableCell>{option.minDownPayment}%</TableCell>
        <TableCell className="hidden md:table-cell">
          {option.vehicleType === "nuevo" ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              Nuevo
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              Usado
            </Badge>
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell">{option.currency === "CRC" ? "₡ Colones" : "$ Dólares"}</TableCell>
        <TableCell>
          <div className="flex gap-1">
            {option.isEco && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      Eco
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Financiamiento especial para vehículos eléctricos o híbridos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {option.isPromo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                      Promo
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tasa promocional por tiempo limitado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </TableCell>
      </TableRow>
    )
  },
  (prevProps, nextProps) => {
    // Comparación personalizada para evitar renderizaciones innecesarias
    return prevProps.option.id === nextProps.option.id
  },
)

MemoizedTableRow.displayName = "MemoizedTableRow"

function FinancingOptionsTable({ onSelectOption }: FinancingOptionsTableProps) {
  // Usar React Query en lugar del store directamente
  const { options, isLoading, error } = useFilteredFinancingOptions()
  const queryClient = useQueryClient()

  // Función para reintentar la carga de datos
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: financingKeys.options() })
  }

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return <FinancingTableSkeleton />
  }

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorDisplay
            title="Error al cargar opciones de financiamiento"
            message="No se pudieron cargar las opciones de financiamiento. Por favor, inténtalo de nuevo."
            onRetry={handleRetry}
          />
        </CardContent>
      </Card>
    )
  }

  // Si no hay opciones, mostrar mensaje
  if (!options || options.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Opciones de Financiamiento (0)</CardTitle>
          <CardDescription>No se encontraron opciones con los filtros seleccionados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron opciones de financiamiento con los filtros seleccionados.</p>
            <p className="mt-2">Intenta ajustar los filtros para ver más resultados.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Opciones de Financiamiento ({options.length})</CardTitle>
        <CardDescription>Haga clic en una opción para ver más detalles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="hidden sm:block overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Entidad / Producto</TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        Tasa de Interés
                        <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Tasa de interés nominal anual. Las tasas pueden ser fijas, variables o mixtas.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>Plazo Máx.</TableHead>
                <TableHead>Prima Mín.</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Moneda</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map((option) => (
                <MemoizedTableRow key={option.id} option={option} onSelectOption={onSelectOption} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Exportar componente memoizado
export default memo(FinancingOptionsTable)
