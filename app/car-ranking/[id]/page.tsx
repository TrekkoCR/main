"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Car, ChevronRight, Fuel, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { FinancingOption } from "@/components/car-ranking/financing-option"
import { useRouter } from "next/navigation"

// Datos de ejemplo para el prototipo
const carDetails = {
  id: "1",
  brand: "Toyota",
  model: "Corolla",
  year: 2020,
  price: 12500000,
  mileage: 45000,
  fuelConsumption: 16.5,
  image: "/placeholder.svg?height=300&width=500&text=Toyota+Corolla",
  score: 87,
  transmission: "Automática",
  engine: "1.8L 4 cilindros",
  fuelType: "Gasolina",
  color: "Blanco",
  doors: 4,
  additionalCosts: {
    transfer: 1250000, // 10% del precio
    marchamo: 187500, // 1.5% del precio
    insurance: 312500, // 2.5% del precio
    fuelTank: 35000, // Costo fijo estimado
  },
}

// Opciones de financiamiento de ejemplo
const financingOptions = [
  {
    bank: "BCR",
    downPayment: 20,
    downPaymentAmount: 2500000,
    financedAmount: 10000000,
    interestRate: 8.95,
    term: 60,
    monthlyPayment: 207500,
  },
  {
    bank: "BAC",
    downPayment: 15,
    downPaymentAmount: 1875000,
    financedAmount: 10625000,
    interestRate: 10.5,
    term: 72,
    monthlyPayment: 198000,
  },
  {
    bank: "Scotiabank",
    downPayment: 10,
    downPaymentAmount: 1250000,
    financedAmount: 11250000,
    interestRate: 11.5,
    term: 84,
    monthlyPayment: 189000,
  },
]

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState(carDetails)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // En una implementación real, aquí cargaríamos los datos del vehículo desde la API
  useEffect(() => {
    const loadCarDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulación de carga de datos
        console.log(`Loading car with ID: ${params.id}`)

        // Simulación de una petición a API
        // En una implementación real, aquí cargaríamos los datos del vehículo desde la API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Si no se encuentra el vehículo, lanzar error
        if (params.id !== "1" && params.id !== "2" && params.id !== "3") {
          throw new Error("Vehículo no encontrado")
        }

        // Establecer los datos del vehículo
        setCar(carDetails)
      } catch (err) {
        console.error("Error loading car details:", err)
        setError("No se pudo cargar la información del vehículo. Por favor, inténtalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCarDetails()
  }, [params.id, router])

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/car-ranking" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver a resultados
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Cargando información del vehículo...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>
          <Button onClick={() => router.push("/car-ranking")} className="shadow-soft-sm shadow-soft-hover">
            Volver a resultados
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative w-full h-64">
                  <Image
                    src={car.image || "/placeholder.svg"}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {car.brand} {car.model}
                      </h1>
                      <p className="text-muted-foreground">Año {car.year}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{car.transmission}</span>
                    </div>
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{car.engine}</span>
                    </div>
                    <div className="flex items-center">
                      <Fuel className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="h-4 w-4 mr-2 flex items-center justify-center text-muted-foreground text-xs">
                        km
                      </span>
                      <span className="text-sm">{car.mileage.toLocaleString()} km</span>
                    </div>
                  </div>

                  <Tabs defaultValue="specs">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="specs">Especificaciones</TabsTrigger>
                      <TabsTrigger value="review">Reseña AI</TabsTrigger>
                    </TabsList>
                    <TabsContent value="specs" className="pt-4">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Marca:</span> {car.brand}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Modelo:</span> {car.model}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Año:</span> {car.year}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Color:</span> {car.color}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Transmisión:</span> {car.transmission}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Motor:</span> {car.engine}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Combustible:</span> {car.fuelType}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Puertas:</span> {car.doors}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Kilometraje:</span> {car.mileage.toLocaleString()} km
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Consumo:</span> {car.fuelConsumption} km/l
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="review" className="pt-4">
                      <div className="space-y-4">
                        <p className="text-sm">
                          El Toyota Corolla 2020 es una excelente opción para quienes buscan un sedán confiable y
                          económico. Este modelo destaca por su bajo consumo de combustible y su historial de
                          durabilidad.
                        </p>
                        <p className="text-sm">
                          Con un kilometraje de 45,000 km, este vehículo todavía tiene mucha vida útil por delante.
                          Toyota es conocida por fabricar motores que pueden superar fácilmente los 300,000 km con el
                          mantenimiento adecuado.
                        </p>
                        <p className="text-sm">
                          El precio está dentro del rango esperado para este modelo y año, considerando el mercado
                          costarricense actual.
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground pt-2">
                          <span>Creado por ChatGPT</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Precio y costos adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Precio del vehículo</span>
                    <span className="font-bold">{formatCurrency(car.price)}</span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Otros costos</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Traspaso</span>
                        <span>{formatCurrency(car.additionalCosts.transfer)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Marchamo</span>
                        <span>{formatCurrency(car.additionalCosts.marchamo)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Seguro</span>
                        <span>{formatCurrency(car.additionalCosts.insurance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Llenar tanque</span>
                        <span>{formatCurrency(car.additionalCosts.fuelTank)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-bold">
                    <span>Costo total</span>
                    <span>
                      {formatCurrency(
                        car.price +
                          car.additionalCosts.transfer +
                          car.additionalCosts.marchamo +
                          car.additionalCosts.insurance +
                          car.additionalCosts.fuelTank,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opciones de financiamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Prima (20%)</p>
                      <p className="font-medium">{formatCurrency(car.price * 0.2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">A financiar (80%)</p>
                      <p className="font-medium">{formatCurrency(car.price * 0.8)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {financingOptions.map((option, index) => (
                      <FinancingOption key={index} option={option} />
                    ))}
                  </div>

                  <Button variant="outline" className="w-full shadow-soft-sm shadow-soft-hover">
                    Ver más opciones
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-6 bg-muted p-4 rounded-lg text-center text-sm text-muted-foreground">
        Espacio para anuncios
      </div>
    </div>
  )
}
