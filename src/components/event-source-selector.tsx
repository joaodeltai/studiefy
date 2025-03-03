"use client"

import { useEventSources } from "@/hooks/useEventSources"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EventSourceSelectorProps {
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export function EventSourceSelector({
  value,
  onValueChange,
  placeholder = "Selecione uma origem",
  disabled = false
}: EventSourceSelectorProps) {
  const { sources, loading } = useEventSources()

  if (loading) {
    return (
      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md border-input bg-background">
        <Loader2 className="h-4 w-4 animate-spin text-studiefy-black/70 mr-2" />
        <span className="text-sm text-studiefy-gray">Carregando origens...</span>
      </div>
    )
  }

  return (
    <Select 
      value={value || "none"} 
      onValueChange={(value) => onValueChange(value === "none" ? null : value)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhuma</SelectItem>
        {sources.length === 0 ? (
          <SelectItem value="empty" disabled>
            Nenhuma origem cadastrada
          </SelectItem>
        ) : (
          sources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
