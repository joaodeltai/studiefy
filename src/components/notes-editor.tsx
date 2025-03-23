"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { debounce } from "lodash"

interface NotesEditorProps {
  notes: string | undefined
  onSave: (notes: string) => Promise<void>
  placeholder?: string
  className?: string
}

export function NotesEditor({
  notes = "",
  onSave,
  placeholder = "Anote aqui seus pensamentos, ideias e observações sobre este conteúdo...",
  className = "",
}: NotesEditorProps) {
  const [value, setValue] = useState(notes || "")
  
  // Atualiza o valor quando as notas mudarem externamente
  useEffect(() => {
    setValue(notes || "")
  }, [notes])

  // Debounce para salvar as alterações
  const debouncedSave = React.useCallback(
    debounce(async (newValue: string) => {
      try {
        await onSave(newValue)
      } catch (error) {
        console.error("Erro ao salvar anotações:", error)
      }
    }, 1000),
    [onSave]
  )

  // Salva as alterações quando o valor mudar
  useEffect(() => {
    if (value !== notes) {
      debouncedSave(value)
    }
    
    return () => {
      debouncedSave.cancel()
    }
  }, [value, notes, debouncedSave])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <h2 className="text-lg font-semibold mb-3">Anotações</h2>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-h-[300px] resize-none p-4 text-base bg-white rounded-lg border-0 focus-visible:ring-blue-500"
      />
      <p className="text-xs text-muted-foreground mt-3 text-right">
        Salvamento automático ativo
      </p>
    </div>
  )
}
