import { type NextRequest, NextResponse } from "next/server"

// Simulated database of messages
const messages = [
  // You can add some initial messages here if needed
  // Example: { id: '1', content: 'Hola, ¿en qué puedo ayudarte?', sender: 'bot', timestamp: new Date().toISOString() }
]

export async function GET() {
  return NextResponse.json(messages)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Add user message to database
    const userMessage = {
      id: Date.now().toString(),
      content: body.message,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    messages.push(userMessage)

    // Simulate bot response (in a real app, this would call an AI service)
    const botResponses: Record<string, string> = {
      requisitos:
        "Para comprar un carro necesitas: identificación válida, comprobante de ingresos, y seguro obligatorio.",
      marchamo:
        "El marchamo es un impuesto anual que se paga por la circulación de vehículos. Se renueva en diciembre.",
      electrico:
        "Los carros eléctricos tienen beneficios fiscales y menor costo de mantenimiento, pero mayor precio inicial.",
      gasolina: "Los carros de gasolina son más económicos inicialmente y tienen mayor autonomía.",
      financiamiento: "Ofrecemos opciones de financiamiento con tasas desde 7.5% anual y plazos de hasta 84 meses.",
      nuevo: "Los carros nuevos tienen garantía y tecnología actualizada.",
      usado: "Los carros usados son más económicos pero pueden requerir más mantenimiento.",
      traspaso: "El traspaso de un vehículo cuesta aproximadamente un 2.5% del valor fiscal más timbres y honorarios.",
    }

    // Simple keyword matching for demo purposes
    let botReply =
      "Lo siento, no tengo información específica sobre eso. ¿Puedo ayudarte con requisitos, marchamo, tipos de vehículos o financiamiento?"

    const lowerMessage = body.message.toLowerCase()

    for (const [keyword, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(keyword)) {
        botReply = response
        break
      }
    }

    // Add bot response to database
    const botMessage = {
      id: (Date.now() + 1).toString(),
      content: botReply,
      sender: "bot",
      timestamp: new Date().toISOString(),
    }

    messages.push(botMessage)

    // Return only the bot's reply
    return NextResponse.json({ reply: botReply })
  } catch (error) {
    console.error("Error processing message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
