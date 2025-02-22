"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface EditableTitleProps {
  title: string
  onSave: (newTitle: string) => Promise<void>
  className?: string
}

export function EditableTitle({ title, onSave, className }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editedTitle.trim() !== title) {
      await onSave(editedTitle)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditedTitle(title)
      setIsEditing(false)
    }
  }

  const renderTitleWithTags = (text: string) => {
    const parts = text.split(/(#\w+)/)
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="font-bold text-blue-500">
            {part}
          </span>
        )
      }
      return part
    })
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-transparent border-none outline-none p-0",
          "focus:ring-0 focus:border-none",
          "text-studiefy-black font-medium",
          className
        )}
      />
    )
  }

  return (
    <h1
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer hover:text-studiefy-black/80 transition-colors",
        className
      )}
    >
      {renderTitleWithTags(title)}
    </h1>
  )
}
