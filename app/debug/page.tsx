"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [vehicleResults, setVehicleResults] = useState<any>(null)

  const testBasicEndpoint = async () => {
    setLoading("basic")
    try {
      console.log("Testing basic endpoint...")
      const response = await fetch("/api/chat", {
        method: "GET",
      })
      const data = await response.json()
      setResults((prev: any) => ({
        ...prev,
        basic: {
          status: "SUCCESS",
          httpStatus: response.status,
          data,
        },
      }))
    } catch (error) {
      setResults((prev: any) => ({
        ...prev,
        basic: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testMinimalPost = async () => {
    setLoading("minimal")
    try {
      console.log("Testing minimal POST...")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "test",
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      setResults((prev: any) => ({
        ...prev,
        minimal: {
          status: "SUCCESS",
          httpStatus: response.status,
          data,
          hasReply: !!data.reply,
          replyLength: data.reply?.length || 0,
        },
      }))
    } catch (error) {
      console.error("Minimal POST error:", error)
      setResults((prev: any) => ({
        ...prev,
        minimal: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testEnvironment = async () => {
    setLoading("env")
    try {
      console.log("Testing environment...")
      const response = await fetch("/api/chat?debug=true")
      const data = await response.json()
      setResults((prev: any) => ({
        ...prev,
        environment: {
          status: "SUCCESS",
          data,
        },
      }))
    } catch (error) {
      setResults((prev: any) => ({
        ...prev,
        environment: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testFinancingQuestion = async () => {
    setLoading("financing")
    try {
      console.log("Testing financing question...")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "¿Qué opciones de financiamiento hay para vehículos?",
        }),
      })

      console.log("Financing response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Financing response data:", data)

      setResults((prev: any) => ({
        ...prev,
        financing: {
          status: "SUCCESS",
          httpStatus: response.status,
          data,
          hasReply: !!data.reply,
          replyLength: data.reply?.length || 0,
          replyPreview: data.reply?.substring(0, 200) + (data.reply?.length > 200 ? "..." : ""),
        },
      }))
    } catch (error) {
      console.error("Financing test error:", error)
      setResults((prev: any) => ({
        ...prev,
        financing: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testDirectTool = async () => {
    setLoading("tool")
    try {
      console.log("Testing direct tool execution...")
      const response = await fetch("/api/debug-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle_type: "todos",
          currency: "todos",
        }),
      })

      const data = await response.json()
      console.log("Direct tool result:", data)

      setResults((prev: any) => ({
        ...prev,
        tool: {
          status: response.ok ? "SUCCESS" : "ERROR",
          httpStatus: response.status,
          data,
          resultCount: Array.isArray(data.results) ? data.results.length : 0,
        },
      }))
    } catch (error) {
      console.error("Direct tool test error:", error)
      setResults((prev: any) => ({
        ...prev,
        tool: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testStreamDebug = async () => {
    setLoading("stream")
    try {
      console.log("Testing stream debug...")
      const response = await fetch("/api/debug-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "¿Qué opciones de financiamiento hay para vehículos?",
        }),
      })

      const data = await response.json()
      console.log("Stream debug result:", data)

      setResults((prev: any) => ({
        ...prev,
        stream: {
          status: response.ok ? "SUCCESS" : "ERROR",
          httpStatus: response.status,
          data,
        },
      }))
    } catch (error) {
      console.error("Stream debug test error:", error)
      setResults((prev: any) => ({
        ...prev,
        stream: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testFullStream = async () => {
    setLoading("fullstream")
    try {
      console.log("Testing full stream debug...")
      const response = await fetch("/api/debug-full-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "¿Qué opciones de financiamiento hay para vehículos?",
        }),
      })

      const data = await response.json()
      console.log("Full stream debug result:", data)

      setResults((prev: any) => ({
        ...prev,
        fullstream: {
          status: response.ok ? "SUCCESS" : "ERROR",
          httpStatus: response.status,
          data,
        },
      }))
    } catch (error) {
      console.error("Full stream debug test error:", error)
      setResults((prev: any) => ({
        ...prev,
        fullstream: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  const testDirectVehicles = async () => {
    setLoading("vehicles")
    try {
      console.log("Testing direct vehicles query...")

      // Primero test GET básico
      console.log("1. Testing GET endpoint...")
      const getResponse = await fetch("/api/debug-vehicles", {
        method: "GET",
      })

      console.log("GET Response status:", getResponse.status)
      console.log("GET Response headers:", Object.fromEntries(getResponse.headers.entries()))

      if (!getResponse.ok) {
        const errorText = await getResponse.text()
        console.error("GET request failed:", errorText)
        throw new Error(`GET failed: ${getResponse.status} - ${errorText}`)
      }

      const getResult = await getResponse.json()
      console.log("GET Result:", getResult)

      // Ahora test POST
      console.log("2. Testing POST endpoint...")
      const postResponse = await fetch("/api/debug-vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marca: "todos",
          limit: 5,
        }),
      })

      console.log("POST Response status:", postResponse.status)
      console.log("POST Response headers:", Object.fromEntries(postResponse.headers.entries()))

      if (!postResponse.ok) {
        const errorText = await postResponse.text()
        console.error("POST request failed:", errorText)
        throw new Error(`POST failed: ${postResponse.status} - ${errorText}`)
      }

      const data = await postResponse.json()
      console.log("POST Result:", data)

      setResults((prev: any) => ({
        ...prev,
        vehicles: {
          status: "SUCCESS",
          httpStatus: postResponse.status,
          data,
          resultCount: data.count || 0,
          sampleVehicle: data.sample_data?.[0] || null,
          step: data.step || "unknown",
        },
      }))
    } catch (error) {
      console.error("Direct vehicles test error:", error)
      setResults((prev: any) => ({
        ...prev,
        vehicles: {
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
          step: "client_error",
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔍 Diagnóstico Avanzado</h1>
        <p className="text-muted-foreground">Tests específicos para identificar el problema con las herramientas</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tests de Diagnóstico</CardTitle>
            <CardDescription>Ejecuta estos tests para identificar el problema específico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={testBasicEndpoint}
                disabled={loading === "basic"}
                variant={results.basic?.status === "SUCCESS" ? "default" : "outline"}
              >
                {loading === "basic" ? "..." : "1. GET Básico"}
                {results.basic?.status === "SUCCESS" && " ✅"}
                {results.basic?.status === "ERROR" && " ❌"}
              </Button>

              <Button
                onClick={testEnvironment}
                disabled={loading === "env"}
                variant={results.environment?.status === "SUCCESS" ? "default" : "outline"}
              >
                {loading === "env" ? "..." : "2. Variables"}
                {results.environment?.status === "SUCCESS" && " ✅"}
                {results.environment?.status === "ERROR" && " ❌"}
              </Button>

              <Button
                onClick={testMinimalPost}
                disabled={loading === "minimal"}
                variant={results.minimal?.status === "SUCCESS" ? "default" : "outline"}
              >
                {loading === "minimal" ? "..." : "3. POST Simple"}
                {results.minimal?.status === "SUCCESS" && " ✅"}
                {results.minimal?.status === "ERROR" && " ❌"}
              </Button>

              <Button
                onClick={testDirectTool}
                disabled={loading === "tool"}
                variant={results.tool?.status === "SUCCESS" ? "default" : "outline"}
              >
                {loading === "tool" ? "..." : "4. Herramienta"}
                {results.tool?.status === "SUCCESS" && " ✅"}
                {results.tool?.status === "ERROR" && " ❌"}
              </Button>

              <Button
                onClick={testStreamDebug}
                disabled={loading === "stream"}
                variant={results.stream?.status === "SUCCESS" ? "default" : "outline"}
              >
                {loading === "stream" ? "..." : "5. Stream"}
                {results.stream?.status === "SUCCESS" && " ✅"}
                {results.stream?.status === "ERROR" && " ❌"}
              </Button>

              <Button
                onClick={testFullStream}
                disabled={loading === "fullstream"}
                variant={results.fullstream?.status === "SUCCESS" ? "default" : "outline"}
              >
                {loading === "fullstream" ? "..." : "6. Full Stream"}
                {results.fullstream?.status === "SUCCESS" && " ✅"}
                {results.fullstream?.status === "ERROR" && " ❌"}
              </Button>
              <Button
                onClick={testDirectVehicles}
                disabled={loading === "vehicles"}
                variant={results.vehicles?.status === "SUCCESS" ? "default" : "outline"}
              >
                {loading === "vehicles" ? "..." : "7. Vehículos DB"}
                {results.vehicles?.status === "SUCCESS" && " ✅"}
                {results.vehicles?.status === "ERROR" && " ❌"}
              </Button>
            </div>

            <Button
              onClick={testFinancingQuestion}
              disabled={loading === "financing"}
              variant={results.financing?.status === "SUCCESS" ? "default" : "outline"}
              className="w-full"
            >
              {loading === "financing" ? "..." : "🎯 Test Pregunta de Financiamiento Completa"}
              {results.financing?.status === "SUCCESS" && " ✅"}
              {results.financing?.status === "ERROR" && " ❌"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        {Object.keys(results).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results).map(([key, result]: [string, any]) => (
                  <div key={key} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold capitalize">{key}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          result.status === "SUCCESS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>

                    {result.error && (
                      <div className="text-red-600 text-sm mb-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}

                    {result.httpStatus && (
                      <div className="text-sm mb-2">
                        <strong>HTTP Status:</strong> {result.httpStatus}
                      </div>
                    )}

                    {result.hasReply !== undefined && (
                      <div className="text-sm mb-2">
                        <strong>Has Reply:</strong> {result.hasReply ? "Yes" : "No"}
                        {result.replyLength > 0 && ` (${result.replyLength} chars)`}
                      </div>
                    )}

                    {result.resultCount !== undefined && (
                      <div className="text-sm mb-2">
                        <strong>Results Count:</strong> {result.resultCount}
                      </div>
                    )}

                    {result.sampleVehicle && (
                      <div className="text-sm mb-2">
                        <strong>Sample Vehicle:</strong> {result.sampleVehicle.marca} {result.sampleVehicle.modelo}{" "}
                        {result.sampleVehicle.anio}
                      </div>
                    )}

                    {result.replyPreview && (
                      <div className="text-sm mb-2">
                        <strong>Preview:</strong> {result.replyPreview}
                      </div>
                    )}

                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">Ver datos completos</summary>
                      <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>
                <strong>CRÍTICO:</strong> Ejecuta el nuevo <strong>"6. Full Stream"</strong> test
              </p>
              <p>Este test nos mostrará exactamente qué eventos se generan en el stream y por qué está vacío.</p>
              <p className="mt-4 p-3 bg-red-50 rounded">
                <strong>🚨 Ejecuta "6. Full Stream" y copia el resultado completo.</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
