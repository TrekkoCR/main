"use client"

import { memo } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { FinancingOption } from "@/lib/services/financing-service"
import { motion } from "framer-motion"

interface MobileFinancingCardProps {
  option: FinancingOption
  onClick: (option: FinancingOption) => void
  index?: number
}

function MobileFinancingCard({ option, onClick, index = 0 }: MobileFinancingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className="mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => onClick(option)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClick(option)
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Ver detalles de ${option.entity} - ${option.product}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-white border border-gray-200">
              <Image src={option.logo || "/placeholder.svg"} alt={option.entity} fill className="object-contain p-2" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{option.entity}</div>
              <div className="text-sm text-muted-foreground truncate">{option.product}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Tasa:</span>{" "}
              <span className="font-medium">{option.interestRate}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo:</span> <span>{option.rateType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Plazo:</span> <span>{option.maxTerm} meses</span>
            </div>
            <div>
              <span className="text-muted-foreground">Prima:</span> <span>{option.minDownPayment}%</span>
            </div>
          </div>

          <div className="flex gap-1 mt-3">
            {option.vehicleType === "nuevo" ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 text-xs">
                Nuevo
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-xs">
                Usado
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {option.currency === "CRC" ? "₡ Colones" : "$ Dólares"}
            </Badge>
            {option.isEco && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-xs">
                Eco
              </Badge>
            )}
            {option.isPromo && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 text-xs">
                Promo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Exportar componente memoizado con comparación personalizada
export default memo(MobileFinancingCard, (prevProps, nextProps) => prevProps.option.id === nextProps.option.id)
