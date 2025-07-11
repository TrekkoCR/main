"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, FileSearch, MessageSquare, TrendingUp, Shield, Clock, Star } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Calculator,
      title: "Calculadora de Financiamiento",
      description: "Calcula cuotas, intereses y encuentra las mejores opciones de financiamiento para tu presupuesto.",
      badge: "Popular",
      color: "blue",
    },
    {
      icon: FileSearch,
      title: "Comparador de Vehículos",
      description: "Compara especificaciones, precios y características de múltiples vehículos lado a lado.",
      badge: "Nuevo",
      color: "green",
    },
    {
      icon: MessageSquare,
      title: "Asistente IA 24/7",
      description: "Pregunta cualquier cosa sobre vehículos, financiamiento o trámites legales en Costa Rica.",
      badge: "IA",
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: "Análisis de Mercado",
      description: "Obtén insights sobre tendencias de precios y el mejor momento para comprar.",
      badge: "Pro",
      color: "orange",
    },
    {
      icon: Shield,
      title: "Verificación Legal",
      description: "Verificamos el estado legal del vehículo y te ayudamos con todos los trámites.",
      badge: "Seguro",
      color: "red",
    },
    {
      icon: Clock,
      title: "Proceso Rápido",
      description: "Encuentra y financia tu vehículo en menos de 48 horas con nuestro proceso optimizado.",
      badge: "Rápido",
      color: "indigo",
    },
  ]

  const testimonials = [
    {
      name: "María González",
      location: "San José",
      text: "Encontré mi carro perfecto en 2 días. El proceso fue súper fácil y transparente.",
      rating: 5,
    },
    {
      name: "Carlos Rodríguez",
      location: "Cartago",
      text: "La calculadora de financiamiento me ayudó a tomar la mejor decisión financiera.",
      rating: 5,
    },
    {
      name: "Ana Jiménez",
      location: "Heredia",
      text: "El asistente IA respondió todas mis dudas sobre trámites y documentos.",
      rating: 5,
    },
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Features Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitas en un solo lugar</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Desde la búsqueda hasta el financiamiento, Trekko te acompaña en cada paso del proceso de compra de tu
            vehículo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 text-${feature.color}-600`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Process Steps */}
        <div className="mb-16 sm:mb-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Proceso Simple en 3 Pasos</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg sm:text-2xl font-bold">
                1
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Cuéntanos qué buscas</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Describe tu vehículo ideal y presupuesto a nuestro asistente IA
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg sm:text-2xl font-bold">
                2
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Recibe opciones personalizadas</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Obtén una lista curada de vehículos y opciones de financiamiento
              </p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg sm:text-2xl font-bold">
                3
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Completa tu compra</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Te ayudamos con todos los trámites y documentación necesaria
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Lo que dicen nuestros usuarios</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="text-sm sm:text-base font-semibold">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
