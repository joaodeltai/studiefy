"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

type Frase = {
  id: number
  autor: string
  frase: string
}

export function DailyQuote() {
  const [frase, setFrase] = useState<Frase | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function carregarFraseDoDia() {
      try {
        setIsLoading(true)
        const response = await fetch('/frases.json')
        const frases: Frase[] = await response.json()
        
        // Seleciona uma frase com base na data atual (muda a cada dia)
        const hoje = new Date()
        const inicioAno = new Date(hoje.getFullYear(), 0, 0)
        const diaDoAno = Math.floor((hoje.getTime() - inicioAno.getTime()) / 86400000)
        const indiceFrase = diaDoAno % frases.length
        
        setFrase(frases[indiceFrase])
      } catch (error) {
        console.error('Erro ao carregar frase do dia:', error)
      } finally {
        setIsLoading(false)
      }
    }

    carregarFraseDoDia()
  }, [])

  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="p-6 text-center text-muted-foreground">
          Carregando frase do dia...
        </CardContent>
      </Card>
    )
  }

  if (!frase) {
    return null
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="text-muted-foreground mb-1">
          <Quote className="h-5 w-5" />
        </div>
        <div className="flex-1 flex items-center justify-center px-2">
          <p className="text-sm sm:text-base text-center italic">
            "{frase.frase}"
          </p>
        </div>
        <div className="text-right mt-1">
          <p className="text-xs text-muted-foreground">
            {frase.autor}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
