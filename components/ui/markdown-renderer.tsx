import type React from "react"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const renderContent = () => {
    const lines = content.split("\n")
    const elements: React.ReactNode[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      if (trimmedLine === "") {
        elements.push(<div key={`space-${index}`} className="h-2" />)
        return
      }

      // Headers
      if (trimmedLine.startsWith("### ")) {
        const text = trimmedLine.replace("### ", "")
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-bold text-gray-900 mb-2 mt-4">
            {text}
          </h3>,
        )
        return
      }

      if (trimmedLine.startsWith("## ")) {
        const text = trimmedLine.replace("## ", "")
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-gray-900 mb-3 mt-5">
            {text}
          </h2>,
        )
        return
      }

      // List items
      if (trimmedLine.startsWith("- ")) {
        const text = trimmedLine.replace("- ", "")
        const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        elements.push(
          <div key={`li-${index}`} className="flex items-start gap-2 mb-1">
            <span className="text-gray-400 mt-1.5 text-xs">●</span>
            <div className="flex-1 text-gray-700" dangerouslySetInnerHTML={{ __html: processedText }} />
          </div>,
        )
        return
      }

      // Numbered lists
      if (trimmedLine.match(/^\d+\.\s/)) {
        const text = trimmedLine.replace(/^\d+\.\s/, "")
        const number = trimmedLine.match(/^\d+/)?.[0]
        const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        elements.push(
          <div key={`ol-${index}`} className="flex items-start gap-2 mb-1">
            <span className="text-gray-500 font-semibold text-sm mt-0.5">{number}.</span>
            <div className="flex-1 text-gray-700" dangerouslySetInnerHTML={{ __html: processedText }} />
          </div>,
        )
        return
      }

      // Regular paragraphs with bold text
      const processedText = trimmedLine.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900">$1</strong>',
      )
      elements.push(
        <p
          key={`p-${index}`}
          className="text-gray-700 mb-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedText }}
        />,
      )
    })

    return elements
  }

  return <div className={cn("space-y-1", className)}>{renderContent()}</div>
}
