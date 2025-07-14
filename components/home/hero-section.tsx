"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            La forma más{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              inteligente
            </span>{" "}
            de comprar tu vehículo
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Trekko AI te ayuda a encontrar las mejores opciones de financiamiento, compara precios en tiempo real y te
            guía paso a paso en todo el proceso de compra de tu vehículo en Costa Rica.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Link href="/comparador">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base"
              >
                <span className="flex items-center gap-2">
                  Comenzar Ahora
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </Button>
            </Link>

            <Link href="/car-ranking">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full font-semibold bg-transparent text-sm sm:text-base"
              >
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Búsqueda Inteligente</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Nuestra IA analiza miles de opciones para encontrar el vehículo perfecto según tus necesidades y
                presupuesto.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Mejores Precios</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Comparamos precios en tiempo real de múltiples fuentes para garantizar que obtengas la mejor oferta.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Proceso Seguro</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Te guiamos en cada paso del proceso legal y financiero para una compra 100% segura y transparente.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center px-4">
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            Más de 1,000 costarricenses ya encontraron su vehículo ideal
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold">500+</div>
              <div className="text-xs sm:text-sm text-gray-500">
                Vehículos
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Analizados
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold">50+</div>
              <div className="text-xs sm:text-sm text-gray-500">
                Opciones de
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Financiamiento
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="text-xl sm:text-2xl font-bold">24/7</div>
              <div className="text-xs sm:text-sm text-gray-500">
                Asistencia
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Disponible
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
