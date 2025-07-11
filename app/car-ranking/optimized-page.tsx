"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Paperclip, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CarCard } from "@/components/car-ranking/car-card"
import { LazyLoadWrapper } from "@/components/ui/lazy-load-wrapper"
import { ResourcePreloader } from "@/components/resource-preloader"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

// Datos de ejemplo para mostrar en el prototipo
const sampleCars = [
  {
    id: "1",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    price: 12500000,
    mileage: 45000,
    fuelConsumption: 16.5,
    image: "/placeholder.svg?height=200&width=300&text=Toyota+Corolla",
    score: 87,
  },
  {
    id: "2",
    brand: "Hyundai",
    model: "Tucson",
    year: 2019,
    price: 14800000,
    mileage: 62000,
    fuelConsumption: 12.3,
    image: "/placeholder.svg?height=200&width=300&text=Hyundai+Tucson",
    score: 82,
  },
  {
    id: "3",
    brand: "Nissan",
    model: "Sentra",
    year: 2021,
    price: 13200000,
    mileage: 28000,
    fuelConsumption: 18.2,
    image: "/placeholder.svg?height=200&width=300&text=Nissan+Sentra",
    score: 91,
  },
]

export default function OptimizedCarRankingPage() {
  const [urls, setUrls] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cars, setCars] = useState(sampleCars)
  const [searchTerm, setSearchTerm] = useState("")
  const [preferences, setPreferences] = useState({
    price: 0,
    year: 0,
    mileage: 0,
    fuelConsumption: 0,
  })
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [isEvaluacionExpanded, setIsEvaluacionExpanded] = useState(false) // Nuevo estado para la sección de evaluación

  // Recursos críticos para precargar
  const criticalResources = [{ type: "image" as const, url: "/placeholder.svg", options: { width: 150, height: 100 } }]

  // Establecer el estado inicial basado en si es móvil o no
  useEffect(() => {
    const handleResize = () => {
      setFiltersExpanded(window.innerWidth >= 768)
      setIsEvaluacionExpanded(window.innerWidth >= 768) // Establecer estado inicial para evaluación
    }

    // Establecer el estado inicial
    handleResize()

    // Añadir listener para cambios de tamaño
    window.addEventListener("resize", handleResize)

    // Limpiar listener
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handlePreferenceChange = (name: keyof typeof preferences, value: number) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddUrls = async () => {
    if (!urls.trim()) return

    setIsProcessing(true)

    // Simulación de procesamiento
    const timeoutId = setTimeout(() => {
      setIsProcessing(false)
      // En una implementación real, aquí procesaríamos las URLs con OpenAI
      // y agregaríamos los nuevos autos a la lista
      setUrls("")
    }, 2000)

    // Limpiar el timeout si el componente se desmonta
    return () => clearTimeout(timeoutId)
  }

  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <ResourcePreloader resources={criticalResources} />

      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Car Ranking</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Encuentra tu auto perfecto comparando opciones y analizando costos adicionales
        </p>

        <LazyLoadWrapper>
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                {" "}
                {/* Contenedor para título y botón */}
                <h2 className="text-xl font-semibold">Evaluar vehículos</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsEvaluacionExpanded(!isEvaluacionExpanded)}>
                  {isEvaluacionExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {/* Contenido colapsable */}
              <div className={`${!isEvaluacionExpanded && "hidden"}`}>
                <p className="text-sm text-muted-foreground mb-4">
                  Ingresa los enlaces de los anuncios o sube fotografías de los vehículos que te interesan evaluar.
                  Nuestro sistema analizará las características y te ofrecerá una evaluación detallada.
                </p>
                <div className="space-y-4">
                  <Textarea
                    placeholder="https://ejemplo.com/auto1
https://ejemplo.com/auto2"
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="shadow-soft-sm shadow-soft-hover bg-transparent">
                      <Paperclip className="h-4 w-4 mr-2" />
                    </Button>
                    <Button
                      onClick={handleAddUrls}
                      disabled={isProcessing || !urls.trim()}
                      className="bg-neutral-800 hover:bg-neutral-700 shadow-soft-sm shadow-soft-hover"
                    >
                      {isProcessing ? "Procesando..." : "Agregar vehículos"}
                      {!isProcessing && <PlusCircle className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </LazyLoadWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <LazyLoadWrapper>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Mis Preferencias</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setFiltersExpanded(!filtersExpanded)}
                    >
                      {filtersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className={`space-y-5 ${!filtersExpanded && "hidden md:block"}`}>
                    {/* Filtro de moneda */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Moneda</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          Ambas
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          ₡
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          $
                        </Button>
                      </div>
                    </div>

                    {/* Filtro de precio */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Precio máximo</Label>
                        <span className="text-xs text-muted-foreground">₡{(25000000).toLocaleString()}</span>
                      </div>
                      <div className="pt-5 pb-1">
                        <Slider
                          defaultValue={[25000000]}
                          min={1000000}
                          max={50000000}
                          step={500000}
                          className="slider-track"
                        />
                      </div>
                    </div>

                    {/* Filtro de año */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Año mínimo</Label>
                        <span className="text-xs text-muted-foreground">2015</span>
                      </div>
                      <div className="pt-5 pb-1">
                        <Slider defaultValue={[2015]} min={2000} max={2024} step={1} className="slider-track" />
                      </div>
                    </div>

                    {/* Filtro de kilometraje */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Kilometraje máximo</Label>
                        <span className="text-xs text-muted-foreground">100.000 km</span>
                      </div>
                      <div className="pt-5 pb-1">
                        <Slider defaultValue={[100000]} min={0} max={300000} step={5000} className="slider-track" />
                      </div>
                    </div>

                    {/* Filtro de tipo de vehículo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tipo de vehículo</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Sedán
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          SUV
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Hatchback
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Pick-up
                        </Button>
                      </div>
                    </div>

                    {/* Filtro de combustible */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Combustible</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Gasolina
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Diésel
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Híbrido
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Eléctrico
                        </Button>
                      </div>
                    </div>

                    {/* Filtro de marcas populares */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Marcas populares</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Toyota
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Hyundai
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Nissan
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs justify-start bg-transparent">
                          <input type="checkbox" className="mr-2" />
                          Honda
                        </Button>
                      </div>
                      <Button variant="link" size="sm" className="text-xs mt-1 h-auto p-0">
                        Ver todas las marcas
                      </Button>
                    </div>

                    {/* Filtro de estado */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Estado</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          Todos
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          Nuevo
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          Usado
                        </Button>
                      </div>
                    </div>

                    {/* Filtro de transmisión */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Transmisión</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          Todas
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          Manual
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                          Automática
                        </Button>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-2">
                      <Button className="w-full">Aplicar filtros</Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LazyLoadWrapper>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar vehículos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredCars.length > 0 ? (
                filteredCars.map((car) => <CarCard key={car.id} car={car} />)
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron vehículos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg text-center text-sm text-muted-foreground">Espacio para anuncios</div>
      </div>
    </>
  )
}
