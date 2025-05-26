"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, Plus, Send } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/chat")
        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim()) return

    // Optimistically add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Add bot response to UI
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.reply,
        sender: "bot",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col w-full max-w-3xl mx-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-4xl font-medium text-neutral-800 text-center">Hey, ¡Compremos un carro!</h1>

          <div className="mt-8 w-full max-w-xl">
            <Card className="relative overflow-hidden border border-neutral-200 shadow-conversation">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4">
                <Input
                  className="flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  placeholder="Escribe a Trekko"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full shadow-soft-sm shadow-soft-hover"
                  disabled={isLoading}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full shadow-soft-sm shadow-soft-hover"
                  disabled={isLoading}
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="rounded-full shadow-soft-sm shadow-soft-hover"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </Card>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <SuggestionButton onClick={() => setInputMessage("¿Qué es Trekko?")}>¿Qué es Trekko?</SuggestionButton>
            <SuggestionButton onClick={() => setInputMessage("Marchamo")}>Marchamo</SuggestionButton>
            <SuggestionButton onClick={() => setInputMessage("¿Electrico o Gasolina?")}>
              ¿Electrico o Gasolina?
            </SuggestionButton>
            <SuggestionButton onClick={() => setInputMessage("Financiamiento")}>Financiamiento</SuggestionButton>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <SuggestionButton onClick={() => setInputMessage("Ayudame a decidir entre nuevo o usado")}>
              Ayudame a decidir entre nuevo o usado
            </SuggestionButton>
            <SuggestionButton onClick={() => setInputMessage("¿Cuanto cuesta el traspaso?")}>
              ¿Cuanto cuesta el traspaso?
            </SuggestionButton>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === "user" ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {messages.length > 0 && (
        <div className="mt-4 w-full">
          <Card className="relative overflow-hidden border border-neutral-200 shadow-conversation">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4">
              <Input
                className="flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                placeholder="Escribe a Trekko"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full shadow-soft-sm shadow-soft-hover"
                disabled={isLoading}
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full shadow-soft-sm shadow-soft-hover"
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="rounded-full shadow-soft-sm shadow-soft-hover"
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </Card>
        </div>
      )}

      <footer className="mt-4 w-full text-center text-xs text-neutral-500">
        <p>
          Trekko puede cometer errores. Al interactuar con Trekko aceptas los{" "}
          <Link href="#" className="underline">
            Términos y Condiciones
          </Link>
          . Consulta nuestra{" "}
          <Link href="#" className="underline">
            Politica de privacidad
          </Link>
          .
        </p>
      </footer>
    </div>
  )
}

function SuggestionButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Button
      variant="outline"
      className="h-auto rounded-full border-neutral-200 px-4 py-2 text-sm font-normal shadow-soft-sm shadow-soft-hover"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
