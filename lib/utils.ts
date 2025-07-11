import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | undefined | null): string {
  // Asegurarse de que amount sea un número válido
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₡0"
  }

  try {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch (error) {
    console.error("Error al formatear moneda:", error)
    return "₡0"
  }
}
