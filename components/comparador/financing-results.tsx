"use client"

import { useMemo, useState } from "react"
import { useFinancingStore } from "@/lib/stores/financing-store"
import { useFilteredFinancingOptions } from "@/lib/hooks/use-financing-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FinancingOptionSkeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Filter } from "lucide-react"

interface FinancingResultsProps {
  onSelectOption: (FinancingOption) => void
}

export default function FinancingResults({ onSelectOption }: FinancingResultsProps) {
  const { calculatorParams } = useFinancingStore()
  const { options, isLoading } = useFilteredFinancingOptions()

  // Estados para filtros
  const [sortBy, setSortBy] = useState<"payment" | "rate">("payment")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [rateTypeFilter, setRateTypeFilter] = useState<string>("all")

  // Calcular cuotas estimadas para cada opción
  const optionsWithPayments = useMemo(() => {
    if (!options || options.length === 0) return []

    return options
      .map((option) => {
        // Calcular cuota mensual estimada
        const engancheAmount = (calculatorParams.loanAmount * calculatorParams.downPayment) / 100
        const principal = calculatorParams.loanAmount - engancheAmount
        const monthlyRate = option.interestRate / 100 / 12
        const numPayments = calculatorParams.loanTerm

        let monthlyPayment = 0
        if (monthlyRate > 0) {
          monthlyPayment =
            (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
            (Math.pow(1 + monthlyRate, numPayments) - 1)
        } else {
          monthlyPayment = principal / numPayments
        }

        return {
          ...option,
          estimatedPayment: monthlyPayment,
        }
      })
      .filter((option) => {
        // Filtrar por tipo de tasa
        if (rateTypeFilter === "all") return true
        return option.rateType === rateTypeFilter
      })
      .sort((a, b) => {
        // Ordenar según criterio seleccionado
        let comparison = 0
        if (sortBy === "payment") {
          comparison = a.estimatedPayment - b.estimatedPayment
        } else if (sortBy === "rate") {
          comparison = a.interestRate - b.interestRate
        }
        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [options, calculatorParams, sortBy, sortOrder, rateTypeFilter])

  // Obtener tipos de tasa únicos para el filtro
  const rateTypes = useMemo(() => {
    if (!options) return []
    const types = [...new Set(options.map((option) => option.rateType))]
    return types.filter(Boolean)
  }, [options])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <FinancingOptionSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!optionsWithPayments || optionsWithPayments.length === 0) {
    return (
      <Card className="w-full shadow-soft-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Resultados del Cálculo</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Ajusta los parámetros de la calculadora para ver opciones de financiamiento.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-soft-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Todas las Opciones</CardTitle>
        <p className="text-xs text-muted-foreground break-all">
          {calculatorParams.loanCurrency === "CRC" ? "₡" : "$"}
          {(
            calculatorParams.loanAmount -
            (calculatorParams.loanAmount * calculatorParams.downPayment) / 100
          ).toLocaleString()}{" "}
          a {calculatorParams.loanTerm} meses
        </p>
      </CardHeader>

      {/* Filtros */}
      <CardContent className="pt-0 pb-2">
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 font-medium">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs text-gray-600 flex-shrink-0">Ordenar:</span>
              <Select value={sortBy} onValueChange={(value: "payment" | "rate") => setSortBy(value)}>
                <SelectTrigger className="w-20 sm:w-24 h-7 text-xs min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Cuota</SelectItem>
                  <SelectItem value="rate">Tasa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 min-w-0">
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger className="w-16 sm:w-20 h-7 text-xs min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Menor</SelectItem>
                  <SelectItem value="desc">Mayor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {rateTypes.length > 0 && (
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs text-gray-600 flex-shrink-0">Tipo:</span>
                <Select value={rateTypeFilter} onValueChange={setRateTypeFilter}>
                  <SelectTrigger className="w-16 sm:w-20 h-7 text-xs min-w-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {rateTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Badge variant="secondary" className="text-xs">
              {optionsWithPayments.length} resultados
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          {optionsWithPayments.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="mb-3 sm:mb-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative h-8 w-8 rounded-md overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                      <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {option.entity.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <h4 className="font-medium text-xs truncate">{option.entity}</h4>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{option.product}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs mb-2">
                    <div>
                      <span className="text-muted-foreground">Tasa:</span>{" "}
                      <span className="font-medium">{option.interestRate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span> <span>{option.rateType}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base font-bold break-all">
                        {calculatorParams.loanCurrency === "CRC" ? "₡" : "$"}
                        {Math.round(option.estimatedPayment).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">por mes</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectOption(option)}
                      className="text-xs px-2 py-1 h-7 flex-shrink-0"
                    >
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
