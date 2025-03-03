"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  className,
  disabled = false,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = React.useCallback((item: string) => {
    onChange(selected.filter((i) => i !== item))
  }, [onChange, selected])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selected.length > 0) {
          onChange(selected.slice(0, -1))
        }
      }
      if (e.key === "Escape") {
        input.blur()
      }
    }
  }, [onChange, selected])

  const selectables = options.filter((option) => !selected.includes(option.value))

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible bg-transparent ${className}`}
    >
      <div
        className={`group border border-studiefy-black/10 rounded-md px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-[#c8ff29] ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => {
            const option = options.find((o) => o.value === item)
            return (
              <Badge
                key={item}
                variant="secondary"
                className="bg-studiefy-black/5 hover:bg-studiefy-black/10 text-studiefy-black"
              >
                {option?.label}
                {!disabled && (
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleUnselect(item)}
                  >
                    <X className="h-3 w-3 text-studiefy-black" />
                  </button>
                )}
              </Badge>
            )
          })}
          {!disabled && (
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={selected.length === 0 ? placeholder : ""}
              className="ml-2 bg-transparent outline-none placeholder:text-studiefy-black/50 flex-1"
              disabled={disabled}
            />
          )}
        </div>
      </div>
      <div className="relative">
        {open && selectables.length > 0 && !disabled && (
          <div className="absolute w-full z-10 top-1 rounded-md border bg-white shadow-md">
            <CommandGroup className="h-full overflow-auto max-h-[200px]">
              {selectables.map((option) => {
                return (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={() => {
                      setInputValue("")
                      onChange([...selected, option.value])
                    }}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  )
}
