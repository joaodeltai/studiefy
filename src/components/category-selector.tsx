"use client"

import { useState, useEffect } from "react"
import { useSubjectCategories } from "@/hooks/useSubjectCategories"
import { Loader2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface CategorySelectorProps {
  subjectId: string
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  disabled?: boolean
  className?: string
}

export function CategorySelector({
  subjectId,
  selectedCategoryId,
  onCategoryChange,
  disabled = false,
  className,
}: CategorySelectorProps) {
  const { categories, loading } = useSubjectCategories(subjectId)
  const [open, setOpen] = useState(false)

  // Reset selected category when subject changes
  useEffect(() => {
    onCategoryChange(null)
  }, [subjectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-8 w-8">
        <Loader2 className="h-4 w-4 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  // Find the selected category to determine icon color
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              selectedCategoryId ? "text-blue-500" : "text-studiefy-black/70"
            )}
            disabled={disabled || categories.length === 0}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Buscar categoria..." />
            <CommandList>
              <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
              <CommandGroup>
                <CommandItem 
                  onSelect={() => {
                    onCategoryChange(null)
                    setOpen(false)
                  }}
                  className={!selectedCategoryId ? "bg-accent" : ""}
                >
                  <span>Sem categoria</span>
                </CommandItem>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      onCategoryChange(category.id)
                      setOpen(false)
                    }}
                    className={selectedCategoryId === category.id ? "bg-accent" : ""}
                  >
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
