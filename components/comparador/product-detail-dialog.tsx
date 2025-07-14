"use client"

import Image from "next/image"
import { Info } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ProductDetailProps {
  product: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] md:max-w-3xl max-h-[80vh] overflow-y-auto">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                    <Image
                      src={product.logo || "/placeholder.svg"}
                      alt={product.entity}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg">
                      {product.entity} - {product.product}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      {product.vehicleType === "nuevo" ? "Vehículo Nuevo" : "Vehículo Usado"} |
                      {product.currency === "CRC" ? " Colones" : " Dólares"}
                      {product.isEco && " | Eco-Amigable"}
                      {product.isPromo && " | Promoción"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Detalles del Financiamiento</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasa de Interés:</span>
                      <span>
                        {product.interestRate}% ({product.rateType})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasa Moratoria:</span>
                      <span>{product.moratoriumRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plazo Máximo:</span>
                      <span>{product.maxTerm} meses</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prima Mínima:</span>
                      <span>{product.minDownPayment}%</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-medium mt-4 mb-2">Información Adicional</h3>
                  <p className="text-sm">{product.additionalInfo}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Requisitos</h3>
                  <ul className="space-y-1">
                    {product.requirements.map((req: string, index: number) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>

                  {product.monthlyPayment && (
                    <>
                      <h3 className="text-sm font-medium mt-4 mb-2">Cálculo de Cuota</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Monto a Financiar:</span>
                          <span>
                            {product.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(product.principal).replace("₡", "")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cuota Mensual:</span>
                          <span className="font-bold">
                            {product.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(product.monthlyPayment).replace("₡", "")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Plazo:</span>
                          <span>{product.applicableTerm} meses</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total de Intereses:</span>
                          <span>
                            {product.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(product.totalInterest).replace("₡", "")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total a Pagar:</span>
                          <span>
                            {product.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(product.totalPayment).replace("₡", "")}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                <p>
                  <Info className="inline h-3 w-3 mr-1" />
                  Esta información es referencial. Las condiciones finales pueden variar según la evaluación crediticia
                  y políticas vigentes de la entidad financiera.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailDialog
