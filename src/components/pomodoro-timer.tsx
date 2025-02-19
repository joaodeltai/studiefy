"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PomodoroTimerProps {
  isOpen: boolean
  onClose: () => void
  title: string
}

export function PomodoroTimer({ isOpen, onClose, title }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(45 * 60) // 45 minutes in seconds
  const [isRunning, setIsRunning] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  React.useEffect(() => {
    if (!isOpen) {
      setTimeLeft(45 * 60)
      setIsRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isOpen])

  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            clearInterval(intervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const toggleTimer = () => {
    setIsRunning((prev) => !prev)
  }

  const resetTimer = () => {
    setTimeLeft(45 * 60)
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      if (isRunning) {
        const confirm = window.confirm("O timer está rodando. Deseja realmente sair?")
        if (!confirm) return
      }
      onClose()
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-8 py-8">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full border-4 border-studiefy-black/10" />
            <div 
              className="absolute inset-0 rounded-full border-4 border-blue-500 transition-all duration-1000"
              style={{
                clipPath: `polygon(50% 50%, -50% -50%, ${timeLeft / (45 * 60) * 200}% -50%)`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleTimer}
              className="w-32"
            >
              {isRunning ? "Pausar" : "Começar"}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={resetTimer}
              className="w-32"
            >
              Reiniciar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
