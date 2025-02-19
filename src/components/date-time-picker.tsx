"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>("")

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

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: ptBR })
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={selectedTime}
        onChange={handleTimeChange}
        className="w-[120px]"
      />
    </div>
  )
}
