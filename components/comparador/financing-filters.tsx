"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Search } from "lucide-react"
import { useEffect } from "react"
import { useFilteredFinancingOptions } from "@/lib/hooks/use-financing-queries"

export function FinancingFilters() {
  // Usar el hook personalizado en lugar del store directamente
  const { filters, updateFilters, resetFilters } = useFilteredFinancingOptions()

  // Extraer valores para facilitar su uso
  const { vehicleType, currency, searchTerm, termRange, interestRateRange } = filters

  // Funciones para actualizar filtros individuales
  const setVehicleType = (value: string) => updateFilters({ vehicleType: value })
  const setCurrency = (value: string) => updateFilters({ currency: value })
  const setSearchTerm = (value: string) => updateFilters({ searchTerm: value })
  const setTermRange = (value: number[]) => updateFilters({ termRange: value as [number, number] })
  const setInterestRateRange = (value: number[]) => updateFilters({ interestRateRange: value as [number, number] })

  // Añadir logging para depuración
  useEffect(() => {
    console.log("Current currency filter:", currency)
  }, [currency])

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtros</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Limpiar
            </Button>
          </div>
          <CardDescription>
            Ajuste los filtros para encontrar las opciones que mejor se adapten a sus necesidades.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Tipo de Vehículo</Label>
              <div className="flex space-x-1 sm:space-x-2">
                <Button
                  variant={vehicleType === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVehicleType("todos")}
                  className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                  aria-pressed={vehicleType === "todos"}
                >
                  Todos
                </Button>
                <Button
                  variant={vehicleType === "nuevo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVehicleType("nuevo")}
                  className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                  aria-pressed={vehicleType === "nuevo"}
                >
                  Nuevo
                </Button>
                <Button
                  variant={vehicleType === "usado" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVehicleType("usado")}
                  className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                  aria-pressed={vehicleType === "usado"}
                >
                  Usado
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <div className="flex space-x-1 sm:space-x-2">
                <Button
                  variant={currency === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrency("todos")}
                  className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                  aria-pressed={currency === "todos"}
                >
                  Todas
                </Button>
                <Button
                  variant={currency === "CRC" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrency("CRC")}
                  className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                  aria-pressed={currency === "CRC"}
                >
                  ₡ Colones
                </Button>
                <Button
                  variant={currency === "USD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrency("USD")}
                  className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                  aria-pressed={currency === "USD"}
                >
                  $ Dólares
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="termRange">Plazo (meses)</Label>
                <span className="text-sm text-muted-foreground">
                  {termRange[0]} - {termRange[1]} meses
                </span>
              </div>
              <Slider
                id="termRange"
                min={12}
                max={120}
                step={12}
                value={termRange}
                onValueChange={setTermRange}
                aria-label="Plazo en meses"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="interestRateRange">Tasa de Interés (%)</Label>
                <span className="text-sm text-muted-foreground">
                  {interestRateRange[0]}% - {interestRateRange[1]}%
                </span>
              </div>
              <Slider
                id="interestRateRange"
                min={0}
                max={25}
                step={0.5}
                value={interestRateRange}
                onValueChange={setInterestRateRange}
                aria-label="Tasa de interés"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar Entidad o Producto</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Ej: BAC, Eco Crédito..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar entidad o producto"
            />
          </div>
        </div>
      </div>
    </>
  )
}
