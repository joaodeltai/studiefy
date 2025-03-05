"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  disabled?: boolean
}

export function DateTimePicker({ date, setDate, disabled = false }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>("")
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Update time when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedTime(format(date, "HH:mm"))
    }
  }, [date])

  // Combine date and time
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime ? selectedTime.split(":") : ["00", "00"]
      selectedDate.setHours(parseInt(hours))
      selectedDate.setMinutes(parseInt(minutes))
      setDate(selectedDate)
      setDialogOpen(false)
    } else {
      setDate(undefined)
    }
  }

  // Update time
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value)
    if (date && e.target.value) {
      const [hours, minutes] = e.target.value.split(":")
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours))
      newDate.setMinutes(parseInt(minutes))
      setDate(newDate)
    }
  }

  // Format for display
  const formattedDate = date
    ? format(date, "PPP", { locale: ptBR })
    : "Selecione uma data"

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex gap-2">
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedDate}
          </Button>
        </DialogTrigger>
        <Input
          type="time"
          value={selectedTime}
          onChange={handleTimeChange}
          className="w-24"
          disabled={disabled}
        />
      </div>
      <DialogContent className="max-h-[95vh] overflow-auto">
        <DialogTitle>Selecione uma data</DialogTitle>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={ptBR}
        />
      </DialogContent>
    </Dialog>
  )
}
