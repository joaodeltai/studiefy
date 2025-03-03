"use client"

import { useState } from "react"
import { Label } from "./ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
  disabled?: boolean
}

export function ColorPicker({ color, onChange, label = "Clique para selecionar uma cor", disabled = false }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    onChange(newColor)
  }
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="space-y-3">
        <div 
          className={cn(
            "w-full h-12 rounded-md border border-gray-300 flex items-center justify-between p-3 cursor-pointer",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          onClick={() => !disabled && setShowPicker(!showPicker)}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="h-6 w-6 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-600">
              {showPicker ? "Selecione uma cor" : "Selecione uma cor"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {color}
          </div>
        </div>
        
        {showPicker && (
          <div className="p-3 border border-gray-200 rounded-md shadow-sm">
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="w-full h-12 cursor-pointer"
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  )
}
