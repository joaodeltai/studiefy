'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'
import { cn } from "@/lib/utils"

type NewsItem = {
  id: string
  title: string
  date: string
  imageUrl: string
  points: string[]
}

type InDevelopmentItem = {
  id: string
  title: string
  points: string[]
}

// Dados de exemplo para novidades
const newsItems: NewsItem[] = [
  {
    id: '0',
    title: 'Flashcards com Repetição Espaçada',
    date: '31/03/2025',
    imageUrl: 'https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//malha.webp',
    points: [
      'Sistema de flashcards com algoritmo FSRS para repetição espaçada',
      'Crie decks personalizados para cada matéria',
      'Visualize seu progresso com mapa de calor de atividades',
      'Acompanhe sua sequência de estudos diariamente'
    ]
  },
  {
    id: '1',
    title: 'Eventos Gerais',
    date: '30/03/2025',
    imageUrl: 'https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//malha.webp',
    points: [
      'Agora você pode criar eventos sem associação a uma matéria específica',
      'Visualize todos os seus eventos gerais na aba de Avaliações',
      'Acesse detalhes completos de eventos gerais com todas as funcionalidades'
    ]
  },
  {
    id: '2',
    title: 'Caderno de Erros Aprimorado',
    date: '25/03/2025',
    imageUrl: 'https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//malha.webp',
    points: [
      'Adicione origem aos seus erros para melhor organização',
      'Classifique a dificuldade das questões (Fácil, Média, Difícil, Muito Difícil)',
      'Faça anotações específicas para cada erro'
    ]
  },
  {
    id: '3',
    title: 'Página de Notas',
    date: '20/03/2025',
    imageUrl: 'https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//malha.webp',
    points: [
      'Nova aba "Notas" no menu lateral para visualizar todas as suas notas',
      'Estatísticas de desempenho com médias e evolução',
      'Filtros por matéria e data para análise detalhada'
    ]
  }
]

// Dados de exemplo para recursos em desenvolvimento
const inDevelopmentItems: InDevelopmentItem[] = [
  {
    id: '1',
    title: 'Plano de Estudos',
    points: [
      'Crie planos de estudos personalizados',
      'Defina metas diárias, semanais e mensais',
      'Acompanhe seu progresso com estatísticas detalhadas'
    ]
  },
  {
    id: '2',
    title: 'Integração com IA',
    points: [
      'Assistente de estudos inteligente',
      'Recomendações personalizadas de conteúdos',
      'Análise de desempenho com insights'
    ]
  },
  {
    id: '3',
    title: 'Aplicativo Mobile',
    points: [
      'Versão nativa para Android e iOS',
      'Notificações para lembretes de estudo',
      'Modo offline para estudar em qualquer lugar'
    ]
  }
]

export function NewsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [activeTab, setActiveTab] = useState('novidades')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-[600px] max-h-[80vh] bg-[#282828] text-[#F5F3F5] border-none",
          "overflow-y-auto scrollbar-hide"
        )}
      >
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-[#F5F3F5]">Atualizações do Studiefy</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="novidades" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#373737]">
            <TabsTrigger value="novidades" className="data-[state=active]:bg-[#282828] data-[state=active]:text-[#F5F3F5] text-[#F5F3F5]/70">Novidades</TabsTrigger>
            <TabsTrigger value="desenvolvimento" className="data-[state=active]:bg-[#282828] data-[state=active]:text-[#F5F3F5] text-[#F5F3F5]/70">Em desenvolvimento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="novidades" className="space-y-6">
            {newsItems.map((item) => (
              <div key={item.id} className="bg-[#373737] rounded-lg overflow-hidden shadow-sm border-none">
                {item.imageUrl && (
                  <div className="relative w-full h-32">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="w-full"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#F5F3F5]">{item.title}</h3>
                      {item.id === '0' && (
                        <Badge variant="outline" className="bg-blue-500 text-white border-none text-xs py-0 h-5">
                          BETA
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-[#F5F3F5]/70">{item.date}</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {item.points.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-[#F5F3F5] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        <span className="text-[#F5F3F5]">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="desenvolvimento" className="space-y-6">
            {inDevelopmentItems.map((item) => (
              <div key={item.id} className="bg-[#373737] rounded-lg overflow-hidden shadow-sm border-none p-4">
                <h3 className="text-lg font-semibold mb-3 text-[#F5F3F5]">{item.title}</h3>
                
                <ul className="space-y-2">
                  {item.points.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-[#F5F3F5] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      <span className="text-[#F5F3F5]">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
