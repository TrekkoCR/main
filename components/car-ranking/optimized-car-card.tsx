"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { LazyLoadWrapper } from "@/components/ui/lazy-load-wrapper"

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
  priority?: boolean
}

export function OptimizedCarCard({ car, priority = false }: CarCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/car-ranking/${car.id}`)
  }

  return (
    <LazyLoadWrapper
      fallback={
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted animate-pulse" />
              <div className="flex-1 p-4 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    >
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
                priority={priority}
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <div>
                <h3 className="font-medium">
                  {car.brand} {car.model}
                </h3>
                <p className="text-sm text-muted-foreground">Año {car.year}</p>
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
    </LazyLoadWrapper>
  )
}
