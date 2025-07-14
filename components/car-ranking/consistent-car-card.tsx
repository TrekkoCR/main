"use client"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ConsistentCard } from "@/components/ui/consistent-card"
import { Typography } from "@/components/ui/typography"

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

interface ConsistentCarCardProps {
  car: Car
}

export function ConsistentCarCard({ car }: ConsistentCarCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/car-ranking/${car.id}`)
  }

  return (
    <ConsistentCard
      className="overflow-hidden cursor-pointer transition-consistent"
      hoverable
      shadow="sm"
      onClick={handleClick}
    >
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
            <Typography variant="h4" className="font-medium">
              {car.brand} {car.model}
            </Typography>
            <Typography variant="muted">Año {car.year}</Typography>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex items-center">
              <Typography variant="small" className="font-medium">
                Precio:
              </Typography>
              <Typography variant="small" className="ml-1">
                {formatCurrency(car.price)}
              </Typography>
            </div>
            <div className="flex items-center">
              <Typography variant="small" className="font-medium">
                Kilometraje:
              </Typography>
              <Typography variant="small" className="ml-1">
                {car.mileage.toLocaleString()} km
              </Typography>
            </div>
            <div className="flex items-center sm:col-span-2">
              <Typography variant="small" className="font-medium">
                Consumo:
              </Typography>
              <Typography variant="small" className="ml-1">
                {car.fuelConsumption} km/l
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </ConsistentCard>
  )
}
