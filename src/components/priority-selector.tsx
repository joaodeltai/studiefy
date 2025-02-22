"use client"

import * as React from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PriorityLevel } from "@/hooks/useContents"

interface PrioritySelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  priority: PriorityLevel | null
  onPriorityChange?: (priority: PriorityLevel | null) => void
  disabled?: boolean
}

const priorityColors = {
  'Alta': 'fill-red-500 text-red-500',
  'Média': 'fill-yellow-500 text-yellow-500',
  'Baixa': 'fill-blue-500 text-blue-500',
  null: 'fill-none text-studiefy-gray hover:text-studiefy-gray/80'
} as const

export function PrioritySelector({ priority, onPriorityChange, disabled = false, className }: PrioritySelectorProps) {
  const handlePriorityChange = (newPriority: PriorityLevel | null) => {
    if (!disabled && onPriorityChange) {
      onPriorityChange(newPriority)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            disabled={disabled}
          >
            <Flag className={cn(
              "h-4 w-4 transition-colors",
              priorityColors[priority || null],
              disabled && "opacity-50"
            )} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handlePriorityChange('Alta')}>
            <Flag className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
            <span>Alta</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePriorityChange('Média')}>
            <Flag className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span>Média</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePriorityChange('Baixa')}>
            <Flag className="mr-2 h-4 w-4 fill-blue-500 text-blue-500" />
            <span>Baixa</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePriorityChange(null)}>
            <Flag className="mr-2 h-4 w-4 text-studiefy-gray" />
            <span>Sem prioridade</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
