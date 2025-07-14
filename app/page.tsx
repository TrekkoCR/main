import type { Metadata } from "next"
import ClientHomePage from "./ClientHomePage"

export const metadata: Metadata = {
  title: "Trekko - Encuentra tu vehículo ideal con IA",
  description:
    "La plataforma más inteligente para comprar vehículos en Costa Rica. Compara precios, encuentra financiamiento y completa tu compra con asistencia de IA.",
  keywords: "vehículos Costa Rica, financiamiento carros, comprar carro, IA automotriz, Trekko",
  openGraph: {
    title: "Trekko - Encuentra tu vehículo ideal con IA",
    description: "La plataforma más inteligente para comprar vehículos en Costa Rica",
    type: "website",
  },
}

export default function HomePage() {
  return <ClientHomePage />
}
