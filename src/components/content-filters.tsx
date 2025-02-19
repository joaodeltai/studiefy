"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Tag, Flag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PriorityLevel } from "@/hooks/useContents"
import { cn } from "@/lib/utils"

interface ContentFiltersProps {
  startDate: Date | null
  endDate: Date | null
  priority: PriorityLevel | 'all'
  selectedTags: string[]
  availableTags: string[]
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onPriorityChange: (priority: PriorityLevel | 'all') => void
  onTagsChange: (tags: string[]) => void
  onClearFilters: () => void
}

const priorityOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Média', label: 'Média' },
  { value: 'Baixa', label: 'Baixa' },
  { value: 'null', label: 'Sem prioridade' },
]

export function ContentFilters({
  startDate,
  endDate,
  priority,
  selectedTags,
  availableTags,
  onStartDateChange,
  onEndDateChange,
  onPriorityChange,
  onTagsChange,
  onClearFilters,
}: ContentFiltersProps) {
  const hasActiveFilters = startDate || endDate || priority !== 'all' || selectedTags.length > 0

  return (
    <div className="flex items-stretch justify-between">
      {/* Desktop View */}
      <div className="hidden md:flex flex-1 items-stretch divide-x divide-studiefy-black/10">
        <div className="flex items-center gap-2 flex-1 px-4">
          <CalendarIcon className="h-4 w-4 text-studiefy-gray shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 font-normal flex-1 min-w-0",
                    startDate ? "text-blue-500" : "text-studiefy-gray"
                  )}
                >
                  {startDate ? format(startDate, "dd/MM", { locale: ptBR }) : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={onStartDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <span className="text-studiefy-gray shrink-0">até</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 font-normal flex-1 min-w-0",
                    endDate ? "text-blue-500" : "text-studiefy-gray"
                  )}
                >
                  {endDate ? format(endDate, "dd/MM", { locale: ptBR }) : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={onEndDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 px-4">
          <Flag className="h-4 w-4 text-studiefy-gray shrink-0" />
          <Select
            value={priority}
            onValueChange={(value) => onPriorityChange(value as PriorityLevel | 'all')}
          >
            <SelectTrigger className="h-8 border-none bg-transparent flex-1">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 px-4">
          <Tag className="h-4 w-4 text-studiefy-gray shrink-0" />
          <Select
            value={selectedTags.length === 0 ? "all" : selectedTags[0]}
            onValueChange={(value) => onTagsChange(value === "all" ? [] : [value])}
          >
            <SelectTrigger className="h-8 border-none bg-transparent flex-1">
              <SelectValue placeholder="Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  #{tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                (startDate || endDate) && "text-blue-500"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Data inicial</div>
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={onStartDateChange}
                  locale={ptBR}
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Data final</div>
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={onEndDateChange}
                  locale={ptBR}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                priority !== 'all' && "text-blue-500"
              )}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="center">
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onPriorityChange(option.value as PriorityLevel | 'all')}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                selectedTags.length > 0 && "text-blue-500"
              )}
            >
              <Tag className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => onTagsChange([])}
              >
                Todas as tags
              </Button>
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onTagsChange([tag])}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-studiefy-gray hover:text-studiefy-black"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Desktop Clear Button */}
      {hasActiveFilters && (
        <div className="hidden md:flex items-center px-2 border-l border-studiefy-black/10">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-studiefy-gray hover:text-studiefy-black"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
