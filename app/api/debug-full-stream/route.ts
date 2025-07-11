import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  console.log("🔍 === FULL STREAM DEBUG ===")

  try {
    const body = await req.json()
    const userMessage = body.message || "¿Qué opciones de financiamiento hay para vehículos?"

    console.log("📝 Testing with message:", userMessage)

    // Simplified tool for testing
    const testTool = tool({
      description: "Get financing options for vehicles in Costa Rica",
      parameters: z.object({
        vehicle_type: z.string().optional().describe("Type of vehicle"),
      }),
      execute: async (args) => {
        console.log("🔧 Test tool executed with:", args)

        // Simple database test
        try {
          const supabase = createServerComponentClient<Database>({ cookies })
          const { data, error } = await supabase
            .from("finance_products")
            .select("oferente, nombre_del_producto")
            .limit(3)

          if (error) {
            console.error("❌ DB error in tool:", error)
            return { error: error.message, results: [] }
          }

          console.log("✅ Tool got data:", data?.length || 0, "records")
          return {
            success: true,
            count: data?.length || 0,
            results: data || [],
            message: `Found ${data?.length || 0} financing options`,
          }
        } catch (error) {
          console.error("❌ Tool exception:", error)
          return { error: String(error), results: [] }
        }
      },
    })

    // Test the full stream with detailed logging
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful assistant. When the user asks about financing, use the get_financing_options tool and then provide a helpful response based on the results.",
      messages: [{ role: "user", content: userMessage }],
      tools: {
        get_financing_options: testTool,
      },
      maxTokens: 500,
    })

    // Collect all stream events
    const streamEvents = []
    let textResponse = ""
    const toolCalls = []
    const toolResults = []
    const errors = []

    try {
      console.log("📖 Starting full stream read...")

      for await (const chunk of result.fullStream) {
        const event = {
          type: chunk.type,
          timestamp: Date.now(),
        }

        console.log("📦 Stream event:", chunk.type)

        if (chunk.type === "text-delta") {
          textResponse += chunk.textDelta
          event.textDelta = chunk.textDelta
        } else if (chunk.type === "tool-call") {
          toolCalls.push(chunk)
          event.toolCall = {
            toolCallId: chunk.toolCallId,
            toolName: chunk.toolName,
            args: chunk.args,
          }
          console.log("🔧 Tool call:", chunk.toolName, chunk.args)
        } else if (chunk.type === "tool-result") {
          toolResults.push(chunk)
          event.toolResult = {
            toolCallId: chunk.toolCallId,
            result: chunk.result,
          }
          console.log("🔧 Tool result:", chunk.result)
        } else if (chunk.type === "error") {
          errors.push(chunk)
          event.error = chunk.error
          console.error("❌ Stream error:", chunk.error)
        } else if (chunk.type === "step-start") {
          event.stepType = chunk.stepType
          console.log("🚀 Step start:", chunk.stepType)
        } else if (chunk.type === "step-finish") {
          event.stepType = chunk.stepType
          event.finishReason = chunk.finishReason
          console.log("🏁 Step finish:", chunk.stepType, chunk.finishReason)
        } else if (chunk.type === "finish") {
          event.finishReason = chunk.finishReason
          event.usage = chunk.usage
          console.log("🏁 Stream finish:", chunk.finishReason)
        }

        streamEvents.push(event)
      }

      console.log("✅ Stream read complete")
      console.log("📊 Final stats:", {
        textLength: textResponse.length,
        toolCalls: toolCalls.length,
        toolResults: toolResults.length,
        errors: errors.length,
        events: streamEvents.length,
      })

      return Response.json({
        success: true,
        results: {
          textResponse,
          textLength: textResponse.length,
          toolCalls: toolCalls.length,
          toolResults: toolResults.length,
          errors: errors.length,
          streamEvents: streamEvents.length,
          hasText: textResponse.length > 0,
          hasTools: toolCalls.length > 0,
          hasResults: toolResults.length > 0,
        },
        details: {
          streamEvents: streamEvents.slice(0, 10), // First 10 events
          toolCalls,
          toolResults,
          errors,
          textPreview: textResponse.substring(0, 200),
        },
      })
    } catch (streamError) {
      console.error("❌ Stream reading error:", streamError)
      return Response.json({
        success: false,
        error: "Stream reading failed",
        details: streamError instanceof Error ? streamError.message : String(streamError),
        streamEvents,
      })
    }
  } catch (error) {
    console.error("💥 Full stream debug error:", error)
    return Response.json({
      success: false,
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
