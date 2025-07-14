import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@supabase/supabase-js"
import type { Tables } from "@/lib/supabase/database.types"

export type FinancingProduct = Tables<"finance_products">

export interface FinancingOption {
  id: number
  entity: string
  logo: string
  product: string
  vehicleType: string
  currency: string
  interestRate: number
  rateType: string
  maxTerm: number
  minDownPayment: number
  maxAmount: number
  defaultAmount: number
  moratoriumRate: number
  isEco: boolean
  isPromo: boolean
  requirements: string[]
  additionalInfo: string
}

export interface FinancingFilters {
  vehicleType?: string
  currency?: string
  searchTerm?: string
  termRange?: [number, number]
  downPaymentRange?: [number, number]
  interestRateRange?: [number, number]
}

// Mapear datos de la DB al formato esperado por el frontend
function mapFinancingProduct(product: FinancingProduct, bankLogo?: string): FinancingOption {
  // Parsear tasa nominal (remover % si existe)
  const interestRate = Number.parseFloat(
    typeof product.tasa_nominal_percent === "string"
      ? product.tasa_nominal_percent.replace("%", "")
      : product.tasa_nominal_percent?.toString() || "0",
  )

  // Parsear tasa moratoria
  const moratoriumRate = Number.parseFloat(
    typeof product.tasa_moratoria_percent === "string"
      ? product.tasa_moratoria_percent.replace("%", "")
      : product.tasa_moratoria_percent?.toString() || "0",
  )

  // Determinar tipo de vehículo basado en tipo_de_bien
  const vehicleType = product.tipo_de_bien?.toLowerCase().includes("usado") ? "usado" : "nuevo"

  // Determinar si es eco-amigable basado en el nombre del producto
  const isEco =
    product.nombre_del_producto?.toLowerCase().includes("eco") ||
    product.nombre_del_producto?.toLowerCase().includes("verde") ||
    product.nombre_del_producto?.toLowerCase().includes("eléctrico") ||
    false

  // Determinar si es promocional basado en observaciones o nombre
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
    maxAmount: product.moneda_del_producto === "CRC" ? 50000000 : 75000, // Valores por defecto
    defaultAmount: product.moneda_del_producto === "CRC" ? 15000000 : 25000,
    moratoriumRate,
    isEco,
    isPromo,
    requirements: ["Cédula de identidad", "Comprobante de ingresos", "Estados de cuenta bancarios"], // Requisitos por defecto
    additionalInfo: product.observaciones_a_la_tasa || "Consulte condiciones específicas con la entidad financiera.",
  }
}

export class FinancingService {
  // Usar createClient como método para obtener una instancia fresca de Supabase
  private getSupabase = () => {
    // Check if we're on the server side
    if (typeof window === "undefined") {
      // Server-side: use server client with service role key
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase server environment variables")
      }

      return createServerClient(supabaseUrl, supabaseServiceKey)
    } else {
      // Client-side: use the existing client
      return createClient()
    }
  }

  // Convertir el método a una función de flecha para mantener el contexto 'this'
  getFinancingOptions = async (filters: FinancingFilters = {}): Promise<FinancingOption[]> => {
    try {
      console.log("Fetching financing options from Supabase with filters:", filters)
      const supabase = this.getSupabase()

      // Primero obtener todos los logos de bancos
      const { data: banksData, error: banksError } = await supabase.from("bancos").select("id_oferente, logo_url")

      if (banksError) {
        console.error("Error fetching banks:", banksError)
      }

      // Crear un mapa de logos por id_oferente
      const bankLogos = new Map<string, string>()
      if (banksData) {
        banksData.forEach((bank) => {
          if (bank.id_oferente && bank.logo_url) {
            bankLogos.set(bank.id_oferente, bank.logo_url)
          }
        })
      }

      // Ahora obtener los productos de financiamiento
      let query = supabase.from("finance_products").select("*")

      // Aplicar filtros en el servidor cuando sea posible
      if (filters.vehicleType && filters.vehicleType !== "todos") {
        if (filters.vehicleType === "nuevo") {
          query = query.not("tipo_de_bien", "ilike", "%usado%")
        } else if (filters.vehicleType === "usado") {
          query = query.ilike("tipo_de_bien", "%usado%")
        }
      }

      // Corregir el filtro de moneda para asegurar que funcione correctamente
      if (filters.currency && filters.currency !== "todos") {
        // Asegurarse de que estamos comparando con el valor correcto en la base de datos
        query = query.eq("moneda_del_producto", filters.currency)
        console.log(`Filtering by currency: ${filters.currency}`)
      }

      if (filters.searchTerm) {
        query = query.or(`oferente.ilike.%${filters.searchTerm}%,nombre_del_producto.ilike.%${filters.searchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching financing options:", error)
        return [] // Retornar array vacío en caso de error en lugar de datos dummy
      }

      if (!data || data.length === 0) {
        console.warn("No financing options found in Supabase")
        return [] // Retornar array vacío si no hay datos en lugar de datos dummy
      }

      console.log(`Found ${data.length} financing options in Supabase`)

      // Mapear los datos combinando con los logos
      let mappedData = data.map((product) => {
        const bankLogo = product.id_oferente ? bankLogos.get(product.id_oferente) : undefined
        return mapFinancingProduct(product, bankLogo)
      })

      // Aplicar filtros adicionales en el cliente
      if (filters.interestRateRange) {
        const [min, max] = filters.interestRateRange
        mappedData = mappedData.filter((option) => option.interestRate >= min && option.interestRate <= max)
      }

      if (filters.downPaymentRange) {
        const [min, max] = filters.downPaymentRange
        mappedData = mappedData.filter((option) => option.minDownPayment >= min && option.minDownPayment <= max)
      }

      if (filters.termRange) {
        const [min] = filters.termRange
        mappedData = mappedData.filter((option) => option.maxTerm >= min)
      }

      return mappedData
    } catch (error) {
      console.error("Error in getFinancingOptions:", error)
      return [] // Retornar array vacío en caso de error en lugar de datos dummy
    }
  }

  getFinancingOptionById = async (id: number): Promise<FinancingOption | null> => {
    try {
      const supabase = this.getSupabase()

      // Obtener el producto específico
      const { data: productData, error: productError } = await supabase
        .from("finance_products")
        .select("*")
        .eq("id", id)
        .single()

      if (productError || !productData) {
        console.error("Error fetching financing option:", productError)
        return null // Retornar null en lugar de datos dummy
      }

      // Obtener el logo del banco si existe id_oferente
      let bankLogo: string | undefined
      if (productData.id_oferente) {
        const { data: bankData, error: bankError } = await supabase
          .from("bancos")
          .select("logo_url")
          .eq("id_oferente", productData.id_oferente)
          .single()

        if (!bankError && bankData) {
          bankLogo = bankData.logo_url
        }
      }

      const mappedOption = mapFinancingProduct(productData, bankLogo)
      return mappedOption
    } catch (error) {
      console.error("Error in getFinancingOptionById:", error)
      return null // Retornar null en lugar de datos dummy
    }
  }

  getUniqueValues = async () => {
    try {
      const supabase = this.getSupabase()

      const { data, error } = await supabase
        .from("finance_products")
        .select("oferente, moneda_del_producto, tipo_de_bien")

      if (error) {
        console.error("Error fetching unique values:", error)
        return {
          entities: [],
          currencies: [],
          vehicleTypes: [],
        }
      }

      const entities = [...new Set(data?.map((item) => item.oferente).filter(Boolean))]
      const currencies = [...new Set(data?.map((item) => item.moneda_del_producto).filter(Boolean))]
      const vehicleTypes = [...new Set(data?.map((item) => item.tipo_de_bien).filter(Boolean))]

      return {
        entities,
        currencies,
        vehicleTypes,
      }
    } catch (error) {
      console.error("Error in getUniqueValues:", error)
      return {
        entities: [],
        currencies: [],
        vehicleTypes: [],
      }
    }
  }
}

// Instancia singleton del servicio
export const financingService = new FinancingService()
