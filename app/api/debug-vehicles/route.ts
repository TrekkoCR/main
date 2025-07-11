import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🔍 Debug Vehicles - Starting...")

  try {
    // Test básico primero
    const response = {
      success: true,
      message: "Endpoint reached successfully",
      timestamp: new Date().toISOString(),
      step: "initial",
    }

    console.log("✅ Basic endpoint test passed")

    // Intentar importar Supabase
    let supabase
    try {
      const { createClient } = await import("@/lib/supabase/server")
      supabase = createClient()
      response.step = "supabase_imported"
      console.log("✅ Supabase client created")
    } catch (importError) {
      console.error("❌ Supabase import error:", importError)
      return NextResponse.json({
        success: false,
        error: "Failed to import Supabase client",
        details: importError instanceof Error ? importError.message : String(importError),
        step: "supabase_import_failed",
      })
    }

    // Test de conexión básica
    try {
      const { data, error } = await supabase.from("vehicles").select("id, marca, modelo").limit(1)

      if (error) {
        console.error("❌ Supabase query error:", error)
        return NextResponse.json({
          success: false,
          error: "Supabase query failed",
          supabase_error: error.message,
          step: "query_failed",
        })
      }

      console.log("✅ Supabase query successful")
      response.step = "query_success"
      response.sample_data = data
      response.count = data?.length || 0
    } catch (queryError) {
      console.error("❌ Query execution error:", queryError)
      return NextResponse.json({
        success: false,
        error: "Query execution failed",
        details: queryError instanceof Error ? queryError.message : String(queryError),
        step: "query_execution_failed",
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Unexpected error:", error)

    // Asegurar que siempre devolvemos JSON válido
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error",
        message: error instanceof Error ? error.message : String(error),
        step: "unexpected_error",
      },
      { status: 500 },
    )
  }
}

// Agregar método GET para debugging
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Debug vehicles endpoint is working",
    methods: ["GET", "POST"],
    timestamp: new Date().toISOString(),
  })
}
