"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-1 mb-4 sm:mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 fill-current" />
          ))}
          <span className="ml-2 text-white/90 font-medium text-sm sm:text-base">Más de 1,000 usuarios satisfechos</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
          ¿Listo para encontrar tu vehículo ideal?
        </h2>

        <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Únete a miles de costarricenses que ya encontraron su vehículo perfecto con Trekko
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 px-6 sm:px-8 py-3 rounded-full font-semibold"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Link href="/car-ranking">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 rounded-full bg-transparent"
            >
              Ver Ejemplos
            </Button>
          </Link>
        </div>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-sm sm:text-base text-blue-100">Vehículos Analizados</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-sm sm:text-base text-blue-100">Opciones de Financiamiento</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm sm:text-base text-blue-100">Asistencia Disponible</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
