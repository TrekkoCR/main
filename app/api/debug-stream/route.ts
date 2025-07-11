import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"
import type { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  console.log("🔍 === DEBUG STREAM ENDPOINT ===")

  try {
    const body = await req.json()
    const userMessage = body.message || "¿Qué opciones de financiamiento hay para vehículos?"

    console.log("📝 Testing with message:", userMessage)

    // Test 1: Simple message without tools
    console.log("🧪 TEST 1: Simple message without tools")
    try {
      const simpleResult = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [{ role: "user", content: "Say hello" }],
        maxTokens: 20,
      })

      let simpleResponse = ""
      for await (const chunk of simpleResult.textStream) {
        simpleResponse += chunk
      }

      console.log("✅ Simple test result:", simpleResponse)
    } catch (error) {
      console.error("❌ Simple test failed:", error)
      return Response.json({
        error: "Simple test failed",
        details: error instanceof Error ? error.message : String(error),
      })
    }

    // Test 2: Message with tools but no forced usage
    console.log("🧪 TEST 2: Message with tools (auto)")
    try {
      const autoResult = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [{ role: "user", content: userMessage }],
        maxTokens: 100,
        tools: {
          test_tool: tool({
            description: "A simple test tool",
            parameters: z.object({
              message: z.string().describe("A test message"),
            }),
            execute: async (args) => {
              console.log("🔧 Test tool called with:", args)
              return { result: "Tool executed successfully" }
            },
          }),
        },
      })

      let autoResponse = ""
      const toolCalls = []

      for await (const chunk of autoResult.fullStream) {
        if (chunk.type === "text-delta") {
          autoResponse += chunk.textDelta
        } else if (chunk.type === "tool-call") {
          toolCalls.push(chunk)
          console.log("🔧 Tool call detected:", chunk)
        } else if (chunk.type === "tool-result") {
          console.log("🔧 Tool result:", chunk)
        }
      }

      console.log("✅ Auto test result:", { response: autoResponse, toolCalls: toolCalls.length })
    } catch (error) {
      console.error("❌ Auto test failed:", error)
      return Response.json({
        error: "Auto test failed",
        details: error instanceof Error ? error.message : String(error),
      })
    }

    // Test 3: Forced tool usage
    console.log("🧪 TEST 3: Forced tool usage")
    try {
      const forcedResult = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [{ role: "user", content: userMessage }],
        toolChoice: "required",
        maxTokens: 200,
        tools: {
          test_tool: tool({
            description: "A simple test tool that must be used",
            parameters: z.object({
              message: z.string().describe("A test message"),
            }),
            execute: async (args) => {
              console.log("🔧 Forced test tool called with:", args)
              return { result: "Forced tool executed successfully", data: args }
            },
          }),
        },
      })

      let forcedResponse = ""
      const forcedToolCalls = []
      const streamEvents = []

      for await (const chunk of forcedResult.fullStream) {
        streamEvents.push({ type: chunk.type, timestamp: Date.now() })

        if (chunk.type === "text-delta") {
          forcedResponse += chunk.textDelta
        } else if (chunk.type === "tool-call") {
          forcedToolCalls.push(chunk)
          console.log("🔧 Forced tool call:", chunk)
        } else if (chunk.type === "tool-result") {
          console.log("🔧 Forced tool result:", chunk)
        }

        console.log("📦 Stream chunk:", chunk.type)
      }

      console.log("✅ Forced test completed")

      return Response.json({
        success: true,
        tests: {
          simple: "✅ Passed",
          auto: "✅ Passed",
          forced: "✅ Passed",
        },
        forcedTest: {
          response: forcedResponse,
          toolCalls: forcedToolCalls.length,
          streamEvents: streamEvents.length,
          events: streamEvents,
        },
      })
    } catch (error) {
      console.error("❌ Forced test failed:", error)
      return Response.json({
        error: "Forced test failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  } catch (error) {
    console.error("💥 Debug stream error:", error)
    return Response.json({
      error: "Debug stream failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
