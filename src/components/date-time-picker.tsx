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
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
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

  return (
    <div className="flex flex-row gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant={"outline"}
            className={cn(
              "flex-1 sm:flex-none sm:w-[240px] justify-start text-left font-normal",
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
        </DialogTrigger>
        <DialogContent className="p-0 sm:max-w-[425px]">
          <DialogTitle className="p-4 pb-0">Selecione uma data</DialogTitle>
          <div className="px-4 pb-4 pt-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              locale={ptBR}
              className="mx-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
      <Input
        type="time"
        value={selectedTime}
        onChange={handleTimeChange}
        className="w-24 sm:w-[120px]"
      />
    </div>
  )
}
