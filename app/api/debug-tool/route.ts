import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"
import type { FinancingOption } from "@/lib/services/financing-service"

export const maxDuration = 30

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

export async function POST(req: NextRequest) {
  console.log("🔧 === DEBUG TOOL ENDPOINT START ===")

  try {
    const body = await req.json()
    console.log("📨 Debug tool request:", body)

    const args = {
      vehicle_type: body.vehicle_type || "todos",
      currency: body.currency || "todos",
      bank_name: body.bank_name,
      loan_term_months: body.loan_term_months,
      down_payment_percentage: body.down_payment_percentage,
      interest_type: body.interest_type,
      max_nominal_rate: body.max_nominal_rate,
      customer_type: body.customer_type,
    }

    console.log("🔧 Tool args:", JSON.stringify(args, null, 2))

    const supabase = createServerComponentClient<Database>({ cookies })
    console.log("🔧 Supabase client created successfully")

    let query = supabase.from("finance_products").select("*")
    console.log("🔧 Base query created")

    // Apply filters
    if (args.vehicle_type && args.vehicle_type !== "todos") {
      if (args.vehicle_type === "nuevo") {
        query = query.not("tipo_de_bien", "ilike", "%usado%")
        console.log("🔧 Applied filter: vehicle_type = nuevo")
      } else if (args.vehicle_type === "usado") {
        query = query.ilike("tipo_de_bien", "%usado%")
        console.log("🔧 Applied filter: vehicle_type = usado")
      }
    }

    if (args.currency && args.currency !== "todos") {
      query = query.eq("moneda_del_producto", args.currency)
      console.log("🔧 Applied filter: currency =", args.currency)
    }

    if (args.bank_name) {
      query = query.or(`oferente.ilike.%${args.bank_name}%,nombre_del_producto.ilike.%${args.bank_name}%`)
      console.log("🔧 Applied filter: bank_name =", args.bank_name)
    }

    console.log("🔧 Executing Supabase query...")
    const { data, error } = await query.limit(5) // Small limit for debugging

    if (error) {
      console.error("❌ Supabase query error:", error)
      return Response.json(
        {
          success: false,
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          },
        },
        { status: 500 },
      )
    }

    console.log("✅ Supabase query successful")
    console.log(`📊 Found ${data?.length || 0} financing options`)

    if (!data || data.length === 0) {
      console.warn("⚠️ No financing options found")
      return Response.json({
        success: true,
        results: [],
        message: "No financing options found",
      })
    }

    // Map the data
    const mappedData = data.map((product, index) => {
      console.log(`🔧 Mapping product ${index + 1}:`, product.oferente, "-", product.nombre_del_producto)
      return mapFinancingProduct(product)
    })

    console.log(`🎯 Returning ${mappedData.length} options`)
    console.log("🔧 === DEBUG TOOL ENDPOINT END ===")

    return Response.json({
      success: true,
      results: mappedData,
      count: mappedData.length,
      message: `Found ${mappedData.length} financing options`,
    })
  } catch (error) {
    console.error("💥 CRITICAL ERROR in debug tool:", error)
    return Response.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : "No stack available",
        },
      },
      { status: 500 },
    )
  }
}
