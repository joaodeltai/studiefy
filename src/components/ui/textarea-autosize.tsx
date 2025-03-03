"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaAutosizeProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export const TextareaAutosize = React.forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>(({ className, value, onChange, rows = 3, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])
  
  React.useEffect(() => {
    if (textareaRef.current) {
      adjustHeight()
    }
  }, [value, adjustHeight])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e)
  }

  return (
    <textarea
      ref={(node) => {
        textareaRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      className={cn(
        "flex min-h-[80px] w-full resize-none overflow-hidden rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={value}
      onChange={handleChange}
      rows={rows}
      {...props}
    />
  )
})

TextareaAutosize.displayName = "TextareaAutosize"
