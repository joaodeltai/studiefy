"use client"

import * as React from "react"
import { PrioritySelector } from "@/components/priority-selector"
import { DeleteContentDialog } from "@/components/delete-content-dialog"
import { PriorityLevel } from "@/hooks/useContents"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { debounce } from "lodash"

interface DateTextProps {
  date: string | null
  onDateChange: (date: Date | null) => Promise<void>
}

function DateText({ date, onDateChange }: DateTextProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date ? new Date(date) : undefined
  )

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date || undefined)
    await onDateChange(date || null)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="text-sm transition-colors text-studiefy-black/70 hover:text-studiefy-black"
        >
          {date ? format(new Date(date), "dd/MM", { locale: ptBR }) : "Sem data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface NotesEditorWithControlsProps {
  notes: string | undefined
  onSave: (notes: string) => Promise<void>
  date: string | null
  onDateChange: (date: Date | null) => Promise<void>
  priority: PriorityLevel
  onPriorityChange: (priority: PriorityLevel) => Promise<void>
  onDelete: () => Promise<void>
  placeholder?: string
  className?: string
}

export function NotesEditorWithControls({
  notes = "",
  onSave,
  date,
  onDateChange,
  priority,
  onPriorityChange,
  onDelete,
  placeholder,
  className = "",
}: NotesEditorWithControlsProps) {
  const [value, setValue] = React.useState(notes || "")

  // Atualiza o valor quando as notas mudarem externamente
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (value !== notes) {
      debouncedSave(value)
    }

    return () => {
      debouncedSave.cancel()
    }
  }, [value, notes, debouncedSave])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Anotações</h2>
        <div className="flex items-center gap-2">
          <DateText
            date={date}
            onDateChange={onDateChange}
          />
          <PrioritySelector
            priority={priority}
            onPriorityChange={onPriorityChange}
          />
          <DeleteContentDialog onConfirm={onDelete} />
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Anote aqui seus pensamentos, ideias e observações sobre este conteúdo..."}
        className="flex-1 min-h-[300px] resize-none p-4 text-base bg-white rounded-lg border-0 focus-visible:ring-blue-500"
      />
      <p className="text-xs text-muted-foreground mt-3 text-right">
        Salvamento automático ativo
      </p>
    </div>
  )
}
