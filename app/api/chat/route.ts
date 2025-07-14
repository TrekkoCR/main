import { openai } from "@ai-sdk/openai"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import type { Database } from "@/lib/supabase/database.types"
import type { FinancingOption } from "@/lib/services/financing-service"
import { logger } from "@/lib/logger"

export const maxDuration = 30

// Agregar después de las importaciones existentes
interface Vehicle {
  id: string
  user_id: string
  price: number
  currency_code: string
  marca: string
  modelo: string
  anio: number
  kilometraje: number
  color: string
  transmision: string
  motor_cc: number
  capacidad_tanque_l: number
  consumo_km_l: number
  photo_url: string
  created_at: string
  updated_at: string
  nombre_vendedor: string
  numero_telefono: string
  url_anuncio: string
  carroceria: string
  combustible: string
  capacidad_bateria: number | null
}

// Mapear datos de la DB al formato esperado por el frontend
function mapFinancingProduct(product: any, bankLogo?: string): FinancingOption {
  const interestRate = Number.parseFloat(
    typeof product.tasa_nominal_percent === "string"
      ? product.tasa_nominal_percent.replace("%", "")
      : product.tasa_nominal_percent?.toString() || "0",
  )

  const moratoriumRate = Number.parseFloat(
    typeof product.tasa_moratoria_percent === "string"
      ? product.tasa_moratoria_percent.replace("%", "")
      : product.tasa_moratoria_percent?.toString() || "0",
  )

  const vehicleType = product.tipo_de_bien?.toLowerCase().includes("usado") ? "usado" : "nuevo"

  const isEco =
    product.nombre_del_producto?.toLowerCase().includes("eco") ||
    product.nombre_del_producto?.toLowerCase().includes("verde") ||
    product.nombre_del_producto?.toLowerCase().includes("eléctrico") ||
    false

  const isPromo =
    product.observaciones_a_la_tasa?.toLowerCase().includes("promo") ||
    product.nombre_del_producto?.toLowerCase().includes("promo") ||
    false

  return {
    id: product.id,
    entity: product.oferente || "Entidad Financiera",
    logo: bankLogo || `/placeholder.svg?height=40&width=40&text=${product.oferente?.substring(0, 3) || "EF"}`,
    product: product.nombre_del_producto || "Producto de Financiamiento",
    vehicleType,
    currency: product.moneda_del_producto || "CRC",
    interestRate,
    rateType: product.tipo_tasa || "fija",
    maxTerm: product.plazo_en_meses || 60,
    minDownPayment: Number(product.prima_en_percent) || 20,
    maxAmount: product.moneda_del_producto === "CRC" ? 50000000 : 75000,
    defaultAmount: product.moneda_del_producto === "CRC" ? 15000000 : 25000,
    moratoriumRate,
    isEco,
    isPromo,
    requirements: ["Cédula de identidad", "Comprobante de ingresos", "Estados de cuenta bancarios"],
    additionalInfo: product.observaciones_a_la_tasa || "Consulte condiciones específicas con la entidad financiera.",
  }
}

async function get_finance_products_tool_logic(args: {
  vehicle_type?: "nuevo" | "usado" | "todos"
  currency?: "CRC" | "USD" | "todos"
  bank_name?: string
  loan_term_months?: number
  down_payment_percentage?: number
  interest_type?: string
  max_nominal_rate?: number
  customer_type?: string
}): Promise<FinancingOption[]> {
  try {
    logger.debug("Executing financing tool", args)

    const supabase = createServerComponentClient<Database>({ cookies })

    let query = supabase.from("finance_products").select("*")

    // Apply filters
    if (args.vehicle_type && args.vehicle_type !== "todos") {
      if (args.vehicle_type === "nuevo") {
        query = query.not("tipo_de_bien", "ilike", "%usado%")
      } else if (args.vehicle_type === "usado") {
        query = query.ilike("tipo_de_bien", "%usado%")
      }
    }

    if (args.currency && args.currency !== "todos") {
      query = query.eq("moneda_del_producto", args.currency)
    }

    if (args.bank_name) {
      query = query.or(`oferente.ilike.%${args.bank_name}%,nombre_del_producto.ilike.%${args.bank_name}%`)
    }

    if (args.max_nominal_rate) {
      query = query.lte("tasa_nominal_percent", args.max_nominal_rate)
    }

    const { data, error } = await query.limit(10)

    if (error) {
      logger.error("Database query error", error)
      return []
    }

    if (!data || data.length === 0) {
      logger.warn("No financing options found")
      return []
    }

    const mappedData = data.map((product) => mapFinancingProduct(product))

    logger.debug("Financing options retrieved", { count: mappedData.length })

    return mappedData
  } catch (error) {
    logger.error("Tool execution error", error)
    return []
  }
}

async function get_vehicles_tool_logic(args: {
  marca?: string
  modelo?: string
  anio_min?: number
  anio_max?: number
  precio_min?: number
  precio_max?: number
  currency_code?: "CRC" | "USD"
  kilometraje_max?: number
  transmision?: string
  carroceria?: string
  combustible?: string
  color?: string
  motor_cc_min?: number
  motor_cc_max?: number
  consumo_min?: number
  limit?: number
}): Promise<Vehicle[]> {
  try {
    logger.debug("Executing vehicles tool", args)

    const supabase = createServerComponentClient<Database>({ cookies })

    let query = supabase.from("vehicles").select("*")

    // Apply filters
    if (args.marca) {
      query = query.ilike("marca", `%${args.marca}%`)
    }

    if (args.modelo) {
      query = query.ilike("modelo", `%${args.modelo}%`)
    }

    if (args.anio_min) {
      query = query.gte("anio", args.anio_min)
    }

    if (args.anio_max) {
      query = query.lte("anio", args.anio_max)
    }

    if (args.precio_min) {
      query = query.gte("price", args.precio_min)
    }

    if (args.precio_max) {
      query = query.lte("price", args.precio_max)
    }

    if (args.currency_code) {
      query = query.eq("currency_code", args.currency_code)
    }

    if (args.kilometraje_max) {
      query = query.lte("kilometraje", args.kilometraje_max)
    }

    if (args.transmision) {
      query = query.ilike("transmision", `%${args.transmision}%`)
    }

    if (args.carroceria) {
      query = query.ilike("carroceria", `%${args.carroceria}%`)
    }

    if (args.combustible) {
      query = query.ilike("combustible", `%${args.combustible}%`)
    }

    if (args.color) {
      query = query.ilike("color", `%${args.color}%`)
    }

    if (args.motor_cc_min) {
      query = query.gte("motor_cc", args.motor_cc_min)
    }

    if (args.motor_cc_max) {
      query = query.lte("motor_cc", args.motor_cc_max)
    }

    if (args.consumo_min) {
      query = query.gte("consumo_km_l", args.consumo_min)
    }

    // Apply limit
    const limit = args.limit || 10
    query = query.limit(limit)

    // Order by price (ascending)
    query = query.order("price", { ascending: true })

    const { data, error } = await query

    if (error) {
      logger.error("Supabase vehicles query error", error)
      return []
    }

    if (!data || data.length === 0) {
      logger.warn("No vehicles found")
      return []
    }

    logger.debug("Vehicles retrieved", { count: data.length })

    return data as Vehicle[]
  } catch (error) {
    logger.error("Vehicles tool execution error", error)
    return []
  }
}

// GET method - ULTRA SIMPLE
export async function GET() {
  try {
    // Return empty array for initial load - let the chat start fresh
    return NextResponse.json([])
  } catch (error) {
    logger.error("Error in GET /api/chat:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array even on error
  }
}

// POST method - FIXED APPROACH
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    logger.debug("Processing chat message:", message)

    // Generate AI response
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `Eres Trekko, un asistente experto en compra de vehículos en Costa Rica. 
      Ayudas a las personas a tomar decisiones informadas sobre:
      - Financiamiento de vehículos
      - Comparación de modelos
      - Trámites legales y documentación
      - Seguros y marchamo
      - Diferencias entre vehículos nuevos y usados
      
      Responde de manera amigable, profesional y con información específica para Costa Rica.
      Usa emojis ocasionalmente para hacer la conversación más amena.`,
      prompt: message,
      maxTokens: 1000,
    })

    logger.debug("AI response generated successfully")

    return NextResponse.json({
      reply: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Error in POST /api/chat:", error)

    return NextResponse.json(
      {
        reply: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }, // Return 200 to avoid breaking the UI
    )
  }
}
