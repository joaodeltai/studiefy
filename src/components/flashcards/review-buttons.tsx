"use client"

import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

interface ReviewButtonsProps {
  onRating: (rating: 1 | 2 | 3 | 4) => void
  disabled?: boolean
}

export function ReviewButtons({ onRating, disabled = false }: ReviewButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Button
        variant="outline"
        className={cn(
          "flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800",
          "focus:ring-red-500 focus:border-red-500"
        )}
        onClick={() => onRating(1)}
        disabled={disabled}
      >
        Esqueci
      </Button>
      
      <Button
        variant="outline"
        className={cn(
          "flex-1 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800",
          "focus:ring-orange-500 focus:border-orange-500"
        )}
        onClick={() => onRating(2)}
        disabled={disabled}
      >
        Difícil
      </Button>
      
      <Button
        variant="outline"
        className={cn(
          "flex-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800",
          "focus:ring-blue-500 focus:border-blue-500"
        )}
        onClick={() => onRating(3)}
        disabled={disabled}
      >
        Bom
      </Button>
      
      <Button
        variant="outline"
        className={cn(
          "flex-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800",
          "focus:ring-green-500 focus:border-green-500"
        )}
        onClick={() => onRating(4)}
        disabled={disabled}
      >
        Fácil
      </Button>
    </div>
  )
}
