"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calculator, HelpCircle, Info, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { financingService, type FinancingOption, type FinancingFilters } from "@/lib/financing-service"

export default function ComparadorPage() {
  // Estados para los datos
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para los filtros
  const [vehicleType, setVehicleType] = useState<string>("todos")
  const [currency, setCurrency] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [termRange, setTermRange] = useState<number[]>([12, 96])
  const [downPaymentRange, setDownPaymentRange] = useState<number[]>([0, 50])
  const [interestRateRange, setInterestRateRange] = useState<number[]>([0, 15])

  // Estados para la calculadora
  const [loanAmount, setLoanAmount] = useState<number>(15000000)
  const [loanCurrency, setLoanCurrency] = useState<string>("CRC")
  const [loanTerm, setLoanTerm] = useState<number>(60)
  const [downPayment, setDownPayment] = useState<number>(20)

  // Estado para el detalle del producto
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showProductDetail, setShowProductDetail] = useState<boolean>(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadFinancingOptions()
  }, [])

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    const filters: FinancingFilters = {
      vehicleType,
      currency,
      searchTerm,
      termRange: termRange as [number, number],
      downPaymentRange: downPaymentRange as [number, number],
      interestRateRange: interestRateRange as [number, number],
    }

    loadFinancingOptions(filters)
  }, [vehicleType, currency, searchTerm, termRange, downPaymentRange, interestRateRange])

  const loadFinancingOptions = async (filters: FinancingFilters = {}) => {
    try {
      setIsLoading(true)
      setError(null)
      const options = await financingService.getFinancingOptions(filters)
      setFinancingOptions(options)
    } catch (err) {
      console.error("Error loading financing options:", err)
      setError("Error al cargar las opciones de financiamiento")
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular cuota mensual
  const calculateMonthlyPayment = (principal: number, annualRate: number, termMonths: number) => {
    const monthlyRate = annualRate / 100 / 12
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
  }

  // Calcular resultados para cada opción
  const calculatorResults = financingOptions
    .map((option) => {
      const principal =
        loanCurrency === option.currency
          ? loanAmount * (1 - downPayment / 100)
          : loanCurrency === "CRC"
            ? (loanAmount * (1 - downPayment / 100)) / 500 // Conversión aproximada CRC a USD
            : loanAmount * (1 - downPayment / 100) * 500 // Conversión aproximada USD a CRC

      const monthlyPayment = calculateMonthlyPayment(principal, option.interestRate, Math.min(loanTerm, option.maxTerm))
      const totalPayment = monthlyPayment * Math.min(loanTerm, option.maxTerm)
      const totalInterest = totalPayment - principal

      return {
        ...option,
        principal,
        monthlyPayment,
        totalPayment,
        totalInterest,
        applicableTerm: Math.min(loanTerm, option.maxTerm),
      }
    })
    .sort((a, b) => a.monthlyPayment - b.monthlyPayment)

  // Mostrar detalle del producto
  const handleShowProductDetail = (product: any) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  // Componente de tarjeta para vista móvil
  const MobileFinancingCard = ({ option }: { option: FinancingOption }) => (
    <Card className="mb-4 cursor-pointer hover:bg-muted/50" onClick={() => handleShowProductDetail(option)}>
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
  )

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadFinancingOptions()}>Reintentar</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Comparador de Financiamiento</h1>
        <p className="text-sm text-muted-foreground">
          Compare opciones de financiamiento para vehículos nuevos y usados de diferentes entidades financieras en Costa
          Rica.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Información actualizada. Los cálculos son estimaciones y pueden variar según las condiciones finales de cada
          entidad.
        </p>
      </div>

      <Tabs defaultValue="comparar" className="mb-8">
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

        <TabsContent value="comparar" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtros</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVehicleType("todos")
                    setCurrency("todos")
                    setSearchTerm("")
                    setTermRange([12, 96])
                    setDownPaymentRange([0, 50])
                    setInterestRateRange([0, 15])
                  }}
                >
                  Limpiar
                </Button>
              </div>
              <CardDescription>
                Ajuste los filtros para encontrar las opciones que mejor se adapten a sus necesidades.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Tipo de Vehículo</Label>
                  <div className="flex space-x-1 sm:space-x-2">
                    <Button
                      variant={vehicleType === "todos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVehicleType("todos")}
                      className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                    >
                      Todos
                    </Button>
                    <Button
                      variant={vehicleType === "nuevo" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVehicleType("nuevo")}
                      className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                    >
                      Nuevo
                    </Button>
                    <Button
                      variant={vehicleType === "usado" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVehicleType("usado")}
                      className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
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
                    >
                      Todas
                    </Button>
                    <Button
                      variant={currency === "CRC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrency("CRC")}
                      className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                    >
                      ₡ Colones
                    </Button>
                    <Button
                      variant={currency === "USD" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrency("USD")}
                      className="flex-1 text-xs sm:text-sm px-1 sm:px-3"
                    >
                      $ Dólares
                    </Button>
                  </div>
                </div>

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
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="termRange">Plazo (meses)</Label>
                    <span className="text-sm text-muted-foreground">
                      {termRange[0]} - {termRange[1]} meses
                    </span>
                  </div>
                  <Slider id="termRange" min={12} max={120} step={12} value={termRange} onValueChange={setTermRange} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="downPaymentRange">Prima (%)</Label>
                    <span className="text-sm text-muted-foreground">
                      {downPaymentRange[0]}% - {downPaymentRange[1]}%
                    </span>
                  </div>
                  <Slider
                    id="downPaymentRange"
                    min={0}
                    max={50}
                    step={5}
                    value={downPaymentRange}
                    onValueChange={setDownPaymentRange}
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla comparativa (solo para desktop) / Tarjetas (para móvil) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Opciones de Financiamiento ({isLoading ? "Cargando..." : financingOptions.length})
              </CardTitle>
              <CardDescription>Haga clic en una opción para ver más detalles.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando opciones de financiamiento...</p>
                </div>
              ) : (
                <>
                  {/* Vista móvil: Tarjetas */}
                  <div className="sm:hidden">
                    {financingOptions.length > 0 ? (
                      financingOptions.map((option) => <MobileFinancingCard key={option.id} option={option} />)
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No se encontraron opciones que coincidan con los filtros seleccionados.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vista desktop: Tabla */}
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
                        {financingOptions.length > 0 ? (
                          financingOptions.map((option) => (
                            <TableRow
                              key={option.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleShowProductDetail(option)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="relative h-10 w-10 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                    <Image
                                      src={option.logo || "/placeholder.svg"}
                                      alt={option.entity}
                                      fill
                                      className="object-contain p-1"
                                    />
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
                              <TableCell className="hidden md:table-cell">
                                {option.currency === "CRC" ? "₡ Colones" : "$ Dólares"}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {option.isEco && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge
                                            variant="outline"
                                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                          >
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
                                          <Badge
                                            variant="outline"
                                            className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                                          >
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
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No se encontraron opciones que coincidan con los filtros seleccionados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calcular" className="space-y-6">
          {/* Calculadora */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Calculadora de Cuota</CardTitle>
              <CardDescription>
                Ingrese los detalles del financiamiento que necesita para calcular las cuotas mensuales estimadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Monto a Financiar</Label>
                    <div className="flex">
                      <Button
                        variant="outline"
                        className="rounded-r-none"
                        onClick={() => setLoanCurrency(loanCurrency === "CRC" ? "USD" : "CRC")}
                      >
                        {loanCurrency === "CRC" ? "₡" : "$"}
                      </Button>
                      <Input
                        id="loanAmount"
                        type="number"
                        className="rounded-l-none"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">Plazo (meses)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="loanTerm"
                        min={12}
                        max={120}
                        step={12}
                        value={[loanTerm]}
                        onValueChange={(value) => setLoanTerm(value[0])}
                        className="flex-1"
                      />
                      <span className="w-16 text-right">{loanTerm} meses</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="downPayment">Prima (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="downPayment"
                        min={0}
                        max={50}
                        step={5}
                        value={[downPayment]}
                        onValueChange={(value) => setDownPayment(value[0])}
                        className="flex-1"
                      />
                      <span className="w-16 text-right">{downPayment}%</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monto de Prima:</span>
                      <span className="font-medium">
                        {loanCurrency === "CRC" ? "₡" : "$"}{" "}
                        {formatCurrency(loanAmount * (downPayment / 100)).replace("₡", "")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Monto a Financiar:</span>
                      <span className="font-medium">
                        {loanCurrency === "CRC" ? "₡" : "$"}{" "}
                        {formatCurrency(loanAmount * (1 - downPayment / 100)).replace("₡", "")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados de la calculadora */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Resultados ({isLoading ? "Cargando..." : calculatorResults.length})
              </CardTitle>
              <CardDescription>Opciones ordenadas por cuota mensual más baja.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando resultados...</p>
                  </div>
                ) : calculatorResults.length > 0 ? (
                  calculatorResults.map((result) => (
                    <Card key={result.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div
                          className="p-4 cursor-pointer hover:bg-muted/50"
                          onClick={() => handleShowProductDetail(result)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                                <Image
                                  src={result.logo || "/placeholder.svg"}
                                  alt={result.entity}
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium truncate">{result.entity}</div>
                                <div className="text-sm text-muted-foreground truncate">{result.product}</div>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {result.isEco && (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-xs"
                                >
                                  Eco
                                </Badge>
                              )}
                              {result.isPromo && (
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 text-amber-700 hover:bg-amber-50 text-xs"
                                >
                                  Promo
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Cuota Mensual</div>
                              <div className="text-lg font-bold truncate">
                                {result.currency === "CRC" ? "₡" : "$"}{" "}
                                {formatCurrency(result.monthlyPayment).replace("₡", "")}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-muted-foreground">Tasa de Interés</div>
                              <div className="font-medium">
                                {result.interestRate}% ({result.rateType})
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-muted-foreground">Plazo</div>
                              <div className="font-medium">{result.applicableTerm} meses</div>
                            </div>

                            <div>
                              <div className="text-sm text-muted-foreground">Total a Pagar</div>
                              <div className="font-medium truncate">
                                {result.currency === "CRC" ? "₡" : "$"}{" "}
                                {formatCurrency(result.totalPayment).replace("₡", "")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No se encontraron opciones que coincidan con los criterios seleccionados.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detalle del producto */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="w-[95vw] max-w-[95vw] md:max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                    <Image
                      src={selectedProduct.logo || "/placeholder.svg"}
                      alt={selectedProduct.entity}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg">
                      {selectedProduct.entity} - {selectedProduct.product}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      {selectedProduct.vehicleType === "nuevo" ? "Vehículo Nuevo" : "Vehículo Usado"} |
                      {selectedProduct.currency === "CRC" ? " Colones" : " Dólares"}
                      {selectedProduct.isEco && " | Eco-Amigable"}
                      {selectedProduct.isPromo && " | Promoción"}
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
                        {selectedProduct.interestRate}% ({selectedProduct.rateType})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tasa Moratoria:</span>
                      <span>{selectedProduct.moratoriumRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plazo Máximo:</span>
                      <span>{selectedProduct.maxTerm} meses</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prima Mínima:</span>
                      <span>{selectedProduct.minDownPayment}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monto Máximo:</span>
                      <span>
                        {selectedProduct.currency === "CRC" ? "₡" : "$"}{" "}
                        {formatCurrency(selectedProduct.maxAmount).replace("₡", "")}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-medium mt-4 mb-2">Información Adicional</h3>
                  <p className="text-sm">{selectedProduct.additionalInfo}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Requisitos</h3>
                  <ul className="space-y-1">
                    {selectedProduct.requirements.map((req: string, index: number) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedProduct.monthlyPayment && (
                    <>
                      <h3 className="text-sm font-medium mt-4 mb-2">Cálculo de Cuota</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Monto a Financiar:</span>
                          <span>
                            {selectedProduct.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(selectedProduct.principal).replace("₡", "")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cuota Mensual:</span>
                          <span className="font-bold">
                            {selectedProduct.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(selectedProduct.monthlyPayment).replace("₡", "")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Plazo:</span>
                          <span>{selectedProduct.applicableTerm} meses</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total de Intereses:</span>
                          <span>
                            {selectedProduct.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(selectedProduct.totalInterest).replace("₡", "")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total a Pagar:</span>
                          <span>
                            {selectedProduct.currency === "CRC" ? "₡" : "$"}{" "}
                            {formatCurrency(selectedProduct.totalPayment).replace("₡", "")}
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
