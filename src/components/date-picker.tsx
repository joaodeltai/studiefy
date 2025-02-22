"use client"

import * as React from "react"
import { format, isAfter, isBefore, isToday, addDays, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: Date | null
  onDateChange?: (date: Date | null) => void
  disabled?: boolean
}

export function DatePicker({ date, onDateChange, disabled = false, className }: DatePickerProps) {
  const handleSelect = (date: Date | undefined) => {
    if (!disabled && onDateChange) {
      onDateChange(date || null)
    }
  }

  const getDateColor = (date: Date) => {
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)

    if (isBefore(date, today)) {
      return "text-red-500" // Vencido
    }

    if (isBefore(date, tomorrow)) {
      return "text-yellow-500" // Menos de 1 dia
    }

    return "text-blue-500" // Normal
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              date && getDateColor(new Date(date))
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            initialFocus
            disabled={disabled}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
