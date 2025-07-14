import { memo } from "react"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

// Memoized components to prevent unnecessary re-renders
export const MemoizedMarkdownRenderer = memo(MarkdownRenderer, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content
})

export const MemoizedMessageItem = memo(
  ({ message }: { message: any }) => {
    return (
      <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[85%]`}>
          <div
            className={`p-4 ${
              message.sender === "user" ? "bg-gray-200 text-gray-900 rounded-2xl" : "bg-transparent text-gray-900"
            }`}
          >
            {message.sender === "user" ? (
              <p className="whitespace-pre-wrap text-gray-900 leading-relaxed">{message.content}</p>
            ) : (
              <MemoizedMarkdownRenderer content={message.content} />
            )}
          </div>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.message.id === nextProps.message.id && prevProps.message.content === nextProps.message.content
  },
)

MemoizedMessageItem.displayName = "MemoizedMessageItem"
