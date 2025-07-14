"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface Car {
  id: string
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  fuelConsumption: number
  image: string
  score: number
}

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/car-ranking/${car.id}`)
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer shadow-soft-sm hover:shadow-soft-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="flex">
          <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
            <OptimizedImage
              src={car.image || "/placeholder.svg"}
              alt={`${car.brand} ${car.model}`}
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-cover"
              containerClassName="w-full h-full"
            />
          </div>
          <div className="flex-1 p-4">
            <div>
              <div>
                <h3 className="font-medium">
                  {car.brand} {car.model}
                </h3>
                <p className="text-sm text-muted-foreground">Año {car.year}</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center text-sm">
                <span className="font-medium">Precio:</span>
                <span className="ml-1">{formatCurrency(car.price)}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium">Kilometraje:</span>
                <span className="ml-1">{car.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex items-center text-sm sm:col-span-2">
                <span className="font-medium">Consumo:</span>
                <span className="ml-1">{car.fuelConsumption} km/l</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
