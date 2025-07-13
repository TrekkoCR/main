"use client"

import React from "react"
import { Suspense } from "react"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { CTASection } from "@/components/home/cta-section"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

import type { ReactNode } from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Mic, Paperclip, Send, Loader2, Car, FileText, Settings2, BadgeCent } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { logger } from "@/lib/logger"
import { debounce, PerformanceMonitor } from "@/lib/performance-utils"
import { useOptimizedState } from "@/hooks/use-optimized-state"
import { apiCache } from "@/lib/api-cache"
import { MemoizedMessageItem } from "@/components/optimized/memo-components"

// Lazy load heavy components
const LazyMarkdownRenderer = dynamic(() => import("@/components/ui/markdown-renderer"), {
  loading: () => <div className="animate-pulse h-4 bg-gray-200 rounded"></div>,
})

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
}

interface ChatInputBarProps {
  inputMessage: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  specialtyMenuOpen: boolean
  setSpecialtyMenuOpen: (open: boolean) => void
  selectedSpecialty: string | null
  onSpecialtySelect: (specialty: string) => void
  specialtyOptions: Array<{ id: string; label: string; icon: any }>
  micTooltipVisible: boolean
  onMicClick: () => void
  specialtyMenuRef: React.RefObject<HTMLDivElement>
}

// Memoized ChatInputBar to prevent unnecessary re-renders
const ChatInputBar = React.memo(
  ({
    inputMessage,
    onInputChange,
    onSubmit,
    isLoading,
    specialtyMenuOpen,
    setSpecialtyMenuOpen,
    selectedSpecialty,
    onSpecialtySelect,
    specialtyOptions,
    micTooltipVisible,
    onMicClick,
    specialtyMenuRef,
  }: ChatInputBarProps) => {
    return (
      <div className="relative w-full max-w-2xl mx-auto px-2 sm:px-0" ref={specialtyMenuRef}>
        <Card
          className="relative overflow-visible border border-neutral-200 shadow-lg bg-white rounded-[18px]"
          style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-3 px-3 sm:px-4 py-3 sm:py-4">
            <input
              className="w-full bg-transparent text-gray-700 placeholder:text-gray-400 outline-none border-none focus:outline-none focus:ring-0 focus:border-none appearance-none text-sm sm:text-base"
              placeholder="Escribe a Trekko"
              value={inputMessage}
              onChange={onInputChange}
              disabled={isLoading}
              autoComplete="off"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className={`rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                    selectedSpecialty
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                  onClick={() => setSpecialtyMenuOpen(!specialtyMenuOpen)}
                  disabled={isLoading}
                >
                  <Settings2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Especialidad
                </Button>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  disabled={isLoading}
                >
                  <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    disabled={isLoading}
                    onClick={onMicClick}
                  >
                    <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  {micTooltipVisible && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                      Próximamente
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {specialtyMenuOpen && (
          <div className="absolute top-full left-2 sm:left-0 right-2 sm:right-auto mt-2 sm:w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            {specialtyOptions.map((option, index) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedSpecialty === option.id ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  } ${index === 0 ? "rounded-t-2xl" : ""} ${index === specialtyOptions.length - 1 ? "rounded-b-2xl" : ""}`}
                  onClick={() => onSpecialtySelect(option.id)}
                >
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{option.label}</span>
                  {selectedSpecialty === option.id && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  },
)

ChatInputBar.displayName = "ChatInputBar"

// Memoized SuggestionButton
const SuggestionButton = React.memo(
  ({
    children,
    onClick,
  }: {
    children: ReactNode
    onClick?: () => void
  }) => {
    return (
      <Button
        variant="outline"
        className="h-auto rounded-full border-neutral-200 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-normal shadow-soft-sm shadow-soft-hover bg-blue-100 text-blue-800 hover:bg-blue-200"
        onClick={onClick}
      >
        {children}
      </Button>
    )
  },
)

SuggestionButton.displayName = "SuggestionButton"

export default function ClientHomePage() {
  const [messages, setMessages] = useOptimizedState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [specialtyMenuOpen, setSpecialtyMenuOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const specialtyMenuRef = useRef<HTMLDivElement>(null)
  const [micTooltipVisible, setMicTooltipVisible] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const performanceMonitor = PerformanceMonitor.getInstance()

  // Memoized specialty options to prevent recreation
  const specialtyOptions = useMemo(
    () => [
      { id: "financiamiento", label: "Financiamiento", icon: BadgeCent },
      { id: "vehiculos", label: "Vehiculos", icon: Car },
      { id: "legal", label: "Legal y Requisitos", icon: FileText },
    ],
    [],
  )

  // Optimized fetch with caching and abort controller
  const fetchMessages = useCallback(async () => {
    const cacheKey = "initial-messages"
    const cached = apiCache.get(cacheKey)

    if (cached) {
      setMessages(cached)
      return
    }

    try {
      performanceMonitor.startTimer("fetch-messages")

      const controller = new AbortController()
      abortControllerRef.current = controller

      const response = await fetch("/api/chat", {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setMessages(data)
        apiCache.set(cacheKey, data, 60000) // Cache for 1 minute
      } else {
        logger.warn("API returned non-array data:", data)
        setMessages([])
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        logger.error("Error fetching messages:", error)
        setMessages([])
      }
    } finally {
      performanceMonitor.endTimer("fetch-messages")
      abortControllerRef.current = null
    }
  }, [setMessages, performanceMonitor])

  // Fetch initial messages
  useEffect(() => {
    fetchMessages()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchMessages])

  // Optimized scroll to bottom with intersection observer
  useEffect(() => {
    if (messagesEndRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (!entry.isIntersecting) {
            // Solo hacer scroll si realmente necesitamos
          }
        },
        { threshold: 0.1 },
      )

      observer.observe(messagesEndRef.current)

      return () => observer.disconnect()
    }
  }, [messages])

  // Optimized click outside handler with event delegation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (specialtyMenuRef.current && !specialtyMenuRef.current.contains(event.target as Node)) {
        setSpecialtyMenuOpen(false)
      }
    }

    if (specialtyMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside, { passive: true })
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [specialtyMenuOpen])

  // Debounced input change to prevent excessive re-renders
  const debouncedInputChange = useMemo(
    () =>
      debounce((value: string) => {
        // Any expensive operations based on input change
      }, 300),
    [],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputMessage(value)
      debouncedInputChange(value)
    },
    [debouncedInputChange],
  )

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!inputMessage.trim()) return

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      performanceMonitor.startTimer("send-message")

      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        sender: "user",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => {
        const currentMessages = Array.isArray(prev) ? prev : []
        return [...currentMessages, userMessage]
      })

      const currentInput = inputMessage
      setInputMessage("")
      setIsLoading(true)
      setError(null)

      try {
        const controller = new AbortController()
        abortControllerRef.current = controller

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: currentInput }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.reply || "Lo siento, no pude procesar tu mensaje.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : []
          return [...currentMessages, botMessage]
        })

        // Clear cache after new message
        apiCache.delete("initial-messages")
      } catch (error: any) {
        if (error.name !== "AbortError") {
          logger.error("Error sending message:", error)
          setError("No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.")

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
            sender: "bot",
            timestamp: new Date().toISOString(),
          }

          setMessages((prev) => {
            const currentMessages = Array.isArray(prev) ? prev : []
            return [...currentMessages, errorMessage]
          })
        }
      } finally {
        setIsLoading(false)
        performanceMonitor.endTimer("send-message")
        abortControllerRef.current = null
      }
    },
    [inputMessage, setMessages, performanceMonitor],
  )

  const handleSpecialtySelect = useCallback(
    (specialty: string) => {
      if (selectedSpecialty === specialty) {
        setSelectedSpecialty(null)
      } else {
        setSelectedSpecialty(specialty)
      }
      setSpecialtyMenuOpen(false)
    },
    [selectedSpecialty],
  )

  const handleMicClick = useCallback(() => {
    setMicTooltipVisible(true)
    setTimeout(() => {
      setMicTooltipVisible(false)
    }, 3000)
  }, [])

  // Memoized suggestion handlers
  const suggestionHandlers = useMemo(
    () => ({
      trekko: () => setInputMessage("¿Qué es Trekko?"),
      marchamo: () => setInputMessage("Marchamo"),
      electric: () => setInputMessage("¿Eléctrico o Gasolina?"),
      financing: () => setInputMessage("Financiamiento"),
      newUsed: () => setInputMessage("Ayúdame a decidir entre nuevo o usado"),
      transfer: () => setInputMessage("¿Cuánto cuesta el traspaso?"),
    }),
    [],
  )

  const safeMessages = Array.isArray(messages) ? messages : []
  const isChatMode = safeMessages.length > 0

  return (
    <div className={`bg-white ${isChatMode ? "h-screen flex flex-col" : "min-h-screen"}`}>
      {/* Chat Section - Conditional positioning */}
      {!isChatMode ? (
        // Landing page mode - chat at top
        <section className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-5xl font-bold text-neutral-800 mb-6 sm:mb-8 px-2">Hey, ¡Compremos un carro!</h1>

              <ChatInputBar
                inputMessage={inputMessage}
                onInputChange={handleInputChange}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                specialtyMenuOpen={specialtyMenuOpen}
                setSpecialtyMenuOpen={setSpecialtyMenuOpen}
                selectedSpecialty={selectedSpecialty}
                onSpecialtySelect={handleSpecialtySelect}
                specialtyOptions={specialtyOptions}
                micTooltipVisible={micTooltipVisible}
                onMicClick={handleMicClick}
                specialtyMenuRef={specialtyMenuRef}
              />

              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 px-2">
                <SuggestionButton onClick={suggestionHandlers.trekko}>¿Qué es Trekko?</SuggestionButton>
                <SuggestionButton onClick={suggestionHandlers.marchamo}>Marchamo</SuggestionButton>
                <SuggestionButton onClick={suggestionHandlers.electric}>¿Eléctrico o Gasolina?</SuggestionButton>
                <SuggestionButton onClick={suggestionHandlers.financing}>Financiamiento</SuggestionButton>
              </div>
              <div className="mt-2 sm:mt-3 flex flex-wrap justify-center gap-2 px-2">
                <SuggestionButton onClick={suggestionHandlers.newUsed}>
                  <span className="hidden sm:inline">Ayúdame a decidir entre nuevo o usado</span>
                  <span className="sm:hidden">Nuevo vs Usado</span>
                </SuggestionButton>
                <SuggestionButton onClick={suggestionHandlers.transfer}>
                  <span className="hidden sm:inline">¿Cuánto cuesta el traspaso?</span>
                  <span className="sm:hidden">Costo traspaso</span>
                </SuggestionButton>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md mt-4 max-w-2xl mx-auto text-sm">
                {error}
              </div>
            )}
          </div>
        </section>
      ) : (
        // Chat mode - messages in main area, input at bottom
        <div className="flex flex-col h-full">
          {/* Chat Messages */}
          <section className="flex-1 py-6 sm:py-8 px-4 sm:px-6 pb-52 overflow-y-auto">
            <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto px-2">
              {safeMessages.map((message) => (
                <MemoizedMessageItem key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="p-3 sm:p-4 bg-transparent">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-gray-600 text-sm">Trekko está pensando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md mt-4 max-w-2xl mx-auto text-sm">
                {error}
              </div>
            )}
          </section>

          {/* Chat Input at Bottom */}
          <section className="fixed bottom-0 left-0 md:left-64 right-0 bg-white shadow-lg py-0 px-4 sm:px-6 z-20">
            <div className="max-w-2xl mx-auto">
              <ChatInputBar
                inputMessage={inputMessage}
                onInputChange={handleInputChange}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                specialtyMenuOpen={specialtyMenuOpen}
                setSpecialtyMenuOpen={setSpecialtyMenuOpen}
                selectedSpecialty={selectedSpecialty}
                onSpecialtySelect={handleSpecialtySelect}
                specialtyOptions={specialtyOptions}
                micTooltipVisible={micTooltipVisible}
                onMicClick={handleMicClick}
                specialtyMenuRef={specialtyMenuRef}
              />
            </div>
          </section>
        </div>
      )}

      {/* Landing Page Content - Only show when not in chat mode */}
      {!isChatMode && (
        <>
          <Suspense fallback={<LoadingSpinner />}>
            <HeroSection />
          </Suspense>

          <Suspense fallback={<div className="h-64 sm:h-96 animate-pulse bg-gray-100" />}>
            <FeaturesSection />
          </Suspense>

          <Suspense fallback={<div className="h-48 sm:h-64 animate-pulse bg-gray-50" />}>
            <CTASection />
          </Suspense>
        </>
      )}

      {/* Footer - Only show when NOT in chat mode */}
      {!isChatMode && (
        <footer className="w-full text-center text-xs text-neutral-500 p-4 sm:p-6 bg-gray-50 border-t">
          <p className="max-w-4xl mx-auto leading-relaxed">
            Trekko puede cometer errores. Al interactuar con Trekko aceptas los{" "}
            <Link href="#" className="underline hover:text-neutral-700">
              Términos y Condiciones
            </Link>
            . Consulta nuestra{" "}
            <Link href="#" className="underline hover:text-neutral-700">
              Política de privacidad
            </Link>
            .
          </p>
        </footer>
      )}
    </div>
  )
}
