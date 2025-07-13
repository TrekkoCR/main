"use client"

import { useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useFinancingStore } from "@/lib/stores/financing-store"
import { useFilteredFinancingOptions } from "@/lib/hooks/use-financing-queries"
import { ConsistentCard } from "@/components/ui/consistent-card"
import { ConsistentButton } from "@/components/ui/consistent-button"
import { Typography } from "@/components/ui/typography"
import { Loader2, TrendingDown } from "lucide-react"

export default function FinancingCalculator() {
  // Conectar con el store real del sistema
  const { calculatorParams, updateCalculatorParams, fetchOptions } = useFinancingStore()

  // Obtener opciones reales y estado de carga
  const { options, isLoading } = useFilteredFinancingOptions()

  // Extraer valores para facilitar su uso
  const { loanAmount, loanCurrency, loanTerm, downPayment } = calculatorParams

  // Validaciones
  const minLoanAmount = loanCurrency === "CRC" ? 2000000 : 4000
  const maxLoanAmount = loanCurrency === "CRC" ? 50000000 : 100000
  const isValidAmount = loanAmount >= minLoanAmount && loanAmount <= maxLoanAmount

  // Funciones para actualizar parámetros con validación
  const setLoanAmount = (amount: number) => {
    const validAmount = Math.max(minLoanAmount, Math.min(maxLoanAmount, amount))
    updateCalculatorParams({ loanAmount: validAmount })
  }

  const setLoanCurrency = (currency: string) => updateCalculatorParams({ loanCurrency: currency })
  const setLoanTerm = (term: number) => updateCalculatorParams({ loanTerm: Math.max(12, Math.min(120, term)) })
  const setDownPayment = (payment: number) =>
    updateCalculatorParams({ downPayment: Math.max(10, Math.min(50, payment)) })

  const toggleCurrency = () => {
    const newCurrency = loanCurrency === "CRC" ? "USD" : "CRC"
    setLoanCurrency(newCurrency)

    // Ajustar el monto al cambiar la moneda (conversión aproximada)
    if (loanCurrency === "CRC") {
      // Convertir de CRC a USD
      setLoanAmount(Math.round(loanAmount / 500))
    } else {
      // Convertir de USD a CRC
      setLoanAmount(Math.round(loanAmount * 500))
    }
  }

  // Recalcular opciones cuando cambien parámetros críticos
  useEffect(() => {
    if (isValidAmount) {
      const timeoutId = setTimeout(() => {
        fetchOptions()
      }, 500) // Debounce para evitar múltiples llamadas

      return () => clearTimeout(timeoutId)
    }
  }, [loanAmount, loanTerm, downPayment, loanCurrency, fetchOptions, isValidAmount])

  // Calcular las 3 mejores opciones disponibles
  const bestOptions = useMemo(() => {
    if (!options || options.length === 0) return []

    const optionsWithPayments = options.map((option) => {
      const engancheAmount = (loanAmount * (downPayment || 20)) / 100
      const principal = loanAmount - engancheAmount
      const monthlyRate = option.interestRate / 100 / 12
      const numPayments = loanTerm

      let monthlyPayment = 0
      if (monthlyRate > 0) {
        monthlyPayment =
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)
      } else {
        monthlyPayment = principal / numPayments
      }

      return { ...option, estimatedPayment: monthlyPayment }
    })

    return optionsWithPayments.sort((a, b) => a.estimatedPayment - b.estimatedPayment).slice(0, 3) // Tomar solo los primeros 3
  }, [options, loanAmount, downPayment, loanTerm])

  return (
    <ConsistentCard
      title="Calculadora de Cuota"
      shadow="md"
      compact={true}
      className="w-full max-w-full overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <div className="space-y-4 min-w-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Typography variant="small" className="font-semibold text-gray-700 text-xs sm:text-sm flex-shrink-0">
                Precio del Auto
              </Typography>
              {!isValidAmount && (
                <Typography variant="small" className="text-red-500 text-xs whitespace-nowrap">
                  {loanCurrency === "CRC" ? "Rango: ₡2M-₡50M" : "Rango: $4K-$100K"}
                </Typography>
              )}
            </div>
            <div className="flex max-w-full">
              <ConsistentButton
                variant="outline"
                shadow="sm"
                hoverable={true}
                className="rounded-r-none px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium border-r-0 flex-shrink-0"
                onClick={toggleCurrency}
                aria-label={`Cambiar a ${loanCurrency === "CRC" ? "dólares" : "colones"}`}
              >
                {loanCurrency === "CRC" ? "₡" : "$"}
              </ConsistentButton>
              <Input
                id="loanAmount"
                type="text"
                className={`rounded-l-none flex-1 min-w-0 text-xs sm:text-sm md:text-base py-2 sm:py-3 px-2 sm:px-4 font-medium overflow-hidden text-ellipsis ${
                  !isValidAmount ? "border-red-300 focus:border-red-500" : ""
                }`}
                value={typeof loanAmount === "number" ? loanAmount.toLocaleString() : ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "")
                  const numValue = value === "" ? 0 : Number(value)
                  setLoanAmount(isNaN(numValue) ? 0 : numValue)
                }}
                placeholder={loanCurrency === "CRC" ? "15M" : "30K"}
                aria-label="Precio del auto"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Typography variant="small" className="font-semibold text-gray-700 text-xs sm:text-sm">
              Enganche (10% - 50%)
            </Typography>
            <div className="flex items-center gap-2 sm:gap-3">
              <Slider
                id="downPayment"
                min={10}
                max={50}
                step={5}
                value={[typeof downPayment === "number" ? downPayment : 20]}
                onValueChange={(value) => setDownPayment(value[0])}
                className="flex-1 min-w-0"
                aria-label="Porcentaje de enganche"
              />
              <Typography
                variant="small"
                className="w-10 sm:w-12 text-right font-medium text-gray-600 text-xs sm:text-sm flex-shrink-0"
              >
                {typeof downPayment === "number" ? downPayment : 20}%
              </Typography>
            </div>
          </div>
        </div>

        <div className="space-y-3 min-w-0">
          <div className="space-y-2">
            <Typography variant="small" className="font-semibold text-gray-700 text-xs sm:text-sm">
              Plazo del Prestamo (1 - 10 años)
            </Typography>
            <div className="flex items-center gap-2 sm:gap-3">
              <Slider
                id="loanTerm"
                min={12}
                max={120}
                step={12}
                value={[typeof loanTerm === "number" ? loanTerm : 60]}
                onValueChange={(value) => setLoanTerm(value[0])}
                className="flex-1 min-w-0"
                aria-label="Plazo del prestamo en meses"
              />
              <Typography
                variant="small"
                className="w-12 sm:w-16 text-right font-medium text-gray-600 text-xs sm:text-sm flex-shrink-0"
              >
                {Math.round((typeof loanTerm === "number" ? loanTerm : 60) / 12)} años
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de cálculo y resultados */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <Typography variant="small" className="text-gray-600">
                  Calculando opciones...
                </Typography>
              </>
            ) : null}
          </div>
        </div>

        {/* Monto a Financiar - Mayor relevancia */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="text-center">
            <Typography variant="small" className="text-gray-700 font-medium mb-1 text-xs sm:text-sm">
              Monto a Financiar
            </Typography>
            <Typography variant="h5" className="text-gray-900 font-bold text-lg sm:text-xl break-all">
              {loanCurrency === "CRC" ? "₡" : "$"}
              {(loanAmount - (loanAmount * (downPayment || 20)) / 100).toLocaleString()}
            </Typography>
          </div>
        </div>

        {/* Preview de las 3 mejores opciones */}
        {bestOptions.length > 0 && !isLoading && isValidAmount && (
          <div className="space-y-2">
            {bestOptions.map((option, index) => (
              <div key={option.id} className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <Typography variant="small" className="font-semibold text-green-800">
                    {index === 0 ? "Mejor opción disponible" : `Opción #${index + 1}`}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Typography variant="h6" className="font-bold text-green-900 text-sm sm:text-base break-all">
                      {loanCurrency === "CRC" ? "₡" : "$"}
                      {Math.round(option.estimatedPayment).toLocaleString()}/mes
                    </Typography>
                    <Typography variant="small" className="text-green-700">
                      {option.entity} • {option.interestRate}% anual
                    </Typography>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300 flex-shrink-0">
                    #{index + 1} Recomendado
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje de validación */}
        {!isValidAmount && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <Typography variant="small" className="text-amber-800">
              ⚠️ Ajusta el precio del auto dentro del rango permitido para ver opciones de financiamiento.
            </Typography>
          </div>
        )}
      </div>
    </ConsistentCard>
  )
}
