"use client"

import { useMemo } from "react"
import type { FinancingOption } from "@/lib/services/financing-service"

interface FinancingCalculatorParams {
  loanAmount: number
  loanCurrency: string
  loanTerm: number
  downPayment: number
}

interface FinancingResult extends FinancingOption {
  principal: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  applicableTerm: number
}

/**
 * Hook para realizar cálculos financieros
 * @param options - Opciones de financiamiento disponibles
 * @param params - Parámetros para el cálculo
 * @returns - Resultados de financiamiento calculados
 */
export function useFinancingCalculator(
  options: FinancingOption[] | null | undefined,
  params: FinancingCalculatorParams,
) {
  const { loanAmount, loanCurrency, loanTerm, downPayment } = params

  // Función para calcular la cuota mensual
  const calculateMonthlyPayment = (principal: number, annualRate: number, termMonths: number): number => {
    // Validar parámetros para evitar errores
    if (!principal || principal <= 0 || !annualRate || annualRate <= 0 || !termMonths || termMonths <= 0) {
      return 0
    }

    try {
      const monthlyRate = annualRate / 100 / 12
      // Si la tasa es 0, simplemente dividir el principal entre los meses
      if (monthlyRate === 0) {
        return principal / termMonths
      }
      return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
    } catch (error) {
      console.error("Error en cálculo de cuota mensual:", error)
      return 0
    }
  }

  // Asegurar que options siempre sea un array
  const safeOptions = Array.isArray(options) ? options : []

  // Calcular resultados para cada opción (memoizado)
  const results = useMemo(() => {
    // Validar que los parámetros sean números válidos
    if (
      !loanAmount ||
      isNaN(loanAmount) ||
      !loanTerm ||
      isNaN(loanTerm) ||
      downPayment === undefined ||
      isNaN(downPayment)
    ) {
      return []
    }

    return safeOptions
      .map((option): FinancingResult => {
        try {
          // Convertir moneda si es necesario
          const principal =
            loanCurrency === option.currency
              ? loanAmount * (1 - downPayment / 100)
              : loanCurrency === "CRC"
                ? (loanAmount * (1 - downPayment / 100)) / 500 // Conversión aproximada CRC a USD
                : loanAmount * (1 - downPayment / 100) * 500 // Conversión aproximada USD a CRC

          // Calcular plazo aplicable (no exceder el plazo máximo de la opción)
          const applicableTerm = Math.min(loanTerm, option.maxTerm || 0)

          // Calcular cuota mensual
          const monthlyPayment = calculateMonthlyPayment(principal, option.interestRate, applicableTerm)

          // Calcular totales
          const totalPayment = monthlyPayment * applicableTerm
          const totalInterest = totalPayment - principal

          return {
            ...option,
            principal,
            monthlyPayment,
            totalPayment,
            totalInterest,
            applicableTerm,
          }
        } catch (error) {
          console.error("Error en cálculo de financiamiento:", error)
          // Devolver un objeto con valores por defecto en caso de error
          return {
            ...option,
            principal: 0,
            monthlyPayment: 0,
            totalPayment: 0,
            totalInterest: 0,
            applicableTerm: 0,
          }
        }
      })
      .filter((result) => result.monthlyPayment > 0) // Filtrar resultados inválidos
      .sort((a, b) => a.monthlyPayment - b.monthlyPayment)
  }, [safeOptions, loanAmount, loanCurrency, loanTerm, downPayment])

  return {
    results,
    calculateMonthlyPayment,
  }
}
