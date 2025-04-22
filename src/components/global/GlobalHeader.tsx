'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from 'next/navigation'
import { MessageSquareHeart, Info, Plus, Medal, Flame } from 'lucide-react'
import { cn } from "@/lib/utils"
import { usePageTitle } from "@/contexts/PageTitleContext"
import { AddEventDialog } from "@/components/add-event-dialog"
import { AddSubjectDialog } from '@/components/add-subject-dialog'
import { useSubjects } from '@/hooks/useSubjects'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useAllEvents } from '@/hooks/useAllEvents'
import { useStreak } from "@/hooks/useStreak"
import Link from 'next/link'
import { NewsDialog } from '@/components/news-dialog'
import Image from 'next/image'

function getInitials(name: string): string {
  if (!name) return ''
  
  return name
    .split(' ')
    .map(word => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Funções para cálculo de XP
const getXPForLevel = (level: number) => level * 10
const getTotalXPForLevel = (level: number) => {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i)
  }
  return total
}

export function GlobalHeader({ isSidebarCollapsed }: { isSidebarCollapsed?: boolean }) {
  const { profile } = useProfile()
  const { pageTitle, titleElement, titleActions } = usePageTitle()
  const pathname = usePathname()
  const { streak, loading: loadingStreak } = useStreak()
  const [showInfo, setShowInfo] = useState(false)
  const [showSubjectContentInfo, setShowSubjectContentInfo] = useState(false)
  const [showFlashcardsInfo, setShowFlashcardsInfo] = useState(false)
  const [showNewsDialog, setShowNewsDialog] = useState(false)
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const btnInfoRef = useRef<HTMLButtonElement>(null)
  const subjectContentInfoRef = useRef<HTMLDivElement>(null)
  const btnSubjectContentInfoRef = useRef<HTMLButtonElement>(null)
  const flashcardsInfoRef = useRef<HTMLDivElement>(null)
  const btnFlashcardsInfoRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const { addEvent } = useAllEvents()
  const { addSubject } = useSubjects()
  
  // Verificar se estamos na página principal do dashboard (progresso)
  const isDashboardMainPage = pathname === '/dashboard'
  
  // Verificar se estamos na página de matérias
  const isSubjectsPage = pathname === '/dashboard/subjects'
  
  // Verificar se estamos na página de conteúdos de uma matéria
  const isSubjectContentPage = pathname.startsWith('/dashboard/subjects/') && pathname.split('/').length === 4
  
  // Verificar se estamos na página de avaliações
  const isAssessmentsPage = pathname === '/dashboard/assessments'
  
  // Verificar se estamos na página de eventos
  const isEventPage = pathname.includes('/events/') && pathname.split('/').length === 6
  
  // Verificar se estamos na página de flashcards
  const isFlashcardsPage = pathname === '/dashboard/flashcards'
  
  // Verificar se estamos na página de um deck específico
  const isFlashcardDeckPage = pathname.includes('/dashboard/flashcards/') && 
    pathname.split('/').length === 4 && 
    !pathname.includes('/study')
  
  // Verificar se estamos na página de flashcards
  const isFlashcardsPageOrDeck = isFlashcardsPage || isFlashcardDeckPage
  
  // Extrair o ID da matéria da URL, se estivermos na página de conteúdos
  const subjectId = isSubjectContentPage ? pathname.split('/')[3] : undefined
  
  const userInitials = profile?.name ? getInitials(profile.name) : '?'
  
  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Verificar se o clique foi fora do popover de informações
      if (
        showInfo && 
        infoRef.current && 
        btnInfoRef.current && 
        !infoRef.current.contains(event.target as Node) && 
        !btnInfoRef.current.contains(event.target as Node)
      ) {
        setShowInfo(false)
      }
      
      // Verificar se o clique foi fora do popover de informações de conteúdo
      if (
        showSubjectContentInfo && 
        subjectContentInfoRef.current && 
        btnSubjectContentInfoRef.current && 
        !subjectContentInfoRef.current.contains(event.target as Node) && 
        !btnSubjectContentInfoRef.current.contains(event.target as Node)
      ) {
        setShowSubjectContentInfo(false)
      }
      
      // Verificar se o clique foi fora do popover de informações de flashcards
      if (
        showFlashcardsInfo && 
        flashcardsInfoRef.current && 
        btnFlashcardsInfoRef.current && 
        !flashcardsInfoRef.current.contains(event.target as Node) && 
        !btnFlashcardsInfoRef.current.contains(event.target as Node)
      ) {
        setShowFlashcardsInfo(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showInfo, showSubjectContentInfo, showFlashcardsInfo])
  
  return (
    <header className="bg-white h-20 px-8 flex items-center fixed top-0 right-0 left-[80px] z-50">
      {/* Espaço vazio à esquerda */}
      <div className="flex-1"></div>
      
      {/* Retângulo central flutuante */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bg-black text-white rounded-full px-6 py-2 shadow-md flex items-center justify-center">
        {/* Página principal do dashboard - mostra apenas nível, ofensiva e novidades */}
        {isDashboardMainPage && (
          <div className="flex items-center gap-4">
            {/* Nível do usuário */}
            <div className="flex items-center gap-1">
              <Medal className="h-4 w-4" />
              <span className="text-sm font-medium">Nível {profile?.level || 1}</span>
            </div>
            
            {/* Ofensiva */}
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{streak?.streak || 0} dias</span>
            </div>
            

          </div>
        )}
        
        {/* Título da página */}
        {pageTitle && !isDashboardMainPage && (
          <div className="flex items-center">
            {/* Botão de ação do título (como voltar) - exceto para a página de flashcards */}
            {titleActions && !isFlashcardsPageOrDeck && titleActions}
            
            <h1 className="text-xl font-semibold ml-2">
              {titleElement || pageTitle}
              
              {/* Ícone de informação para a página de flashcards */}
              {isFlashcardsPage && (
                <div className="relative inline-block ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-white/20"
                    onClick={() => setShowFlashcardsInfo(!showFlashcardsInfo)}
                    ref={btnFlashcardsInfoRef}
                  >
                    <Info className="h-4 w-4 text-white hover:text-white/80" />
                    <span className="sr-only">Informações sobre Flashcards</span>
                  </Button>
                  
                  {showFlashcardsInfo && (
                    <div 
                      ref={flashcardsInfoRef}
                      className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg z-50 w-72 text-black"
                    >
                      <h3 className="font-semibold mb-2">Sobre os Flashcards</h3>
                      <p className="text-sm text-studiefy-black/70 mb-2">
                        Flashcards são cartões de estudo que ajudam na memorização através da repetição espaçada.
                      </p>
                      <h4 className="font-medium mt-3 mb-1">Como usar:</h4>
                      <ul className="text-sm text-studiefy-black/70 list-disc pl-5 space-y-1">
                        <li>Crie decks para organizar seus flashcards por assunto</li>
                        <li>Adicione cartões com perguntas e respostas</li>
                        <li>Estude regularmente para fixar o conteúdo</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Ícone de informação para a página de conteúdos de uma matéria */}
              {isSubjectContentPage && (
                <div className="relative inline-block ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-white/20"
                    onClick={() => setShowSubjectContentInfo(!showSubjectContentInfo)}
                    ref={btnSubjectContentInfoRef}
                  >
                    <Info className="h-4 w-4 text-white hover:text-white/80" />
                    <span className="sr-only">Informações sobre Conteúdos</span>
                  </Button>
                  
                  {showSubjectContentInfo && (
                    <div 
                      ref={subjectContentInfoRef}
                      className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg z-50 w-72 text-black"
                    >
                      <h3 className="font-semibold mb-2">Sobre os Conteúdos</h3>
                      <p className="text-sm text-studiefy-black/70 mb-2">
                        Conteúdos são os assuntos que você está estudando em cada matéria.
                      </p>
                      <h4 className="font-medium mt-3 mb-1">Como usar:</h4>
                      <ul className="text-sm text-studiefy-black/70 list-disc pl-5 space-y-1">
                        <li>Adicione conteúdos para cada matéria</li>
                        <li>Vincule eventos (provas, trabalhos) aos conteúdos</li>
                        <li>Acompanhe seu progresso em cada conteúdo</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </h1>
          </div>
        )}
        
        {/* Botões de ação dentro do retângulo */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Botão de adicionar evento - apenas na página de conteúdos de uma matéria */}
          {isSubjectContentPage && subjectId && (
            <AddEventDialog 
              subjectId={subjectId}
              showSubjectSelector={false}
              onAddEvent={async (title, type, date, subjectId) => {
                try {
                  await addEvent(title, type, date, subjectId);
                  toast.success("Evento adicionado com sucesso");
                  router.refresh();
                } catch (error: any) {
                  if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
                    toast.error("Erro ao adicionar evento");
                  }
                  throw error;
                }
              }}
            />
          )}
          
          {/* Botão de adicionar evento - apenas na página de avaliações */}
          {isAssessmentsPage && (
            <AddEventDialog 
              showSubjectSelector={true}
              onAddEvent={async (title, type, date, subjectId) => {
                try {
                  await addEvent(title, type, date, subjectId);
                  toast.success("Evento adicionado com sucesso");
                  router.refresh();
                } catch (error: any) {
                  if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
                    toast.error("Erro ao adicionar evento");
                  }
                  throw error;
                }
              }}
            />
          )}
          
          {/* Botão de adicionar matéria - apenas na página de matérias */}
          {isSubjectsPage && (
            <Button
              variant="ghost"
              className="gap-2 text-white hover:bg-white/20"
              onClick={() => setShowAddSubjectDialog(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Matéria</span>
            </Button>
          )}
          

        </div>
      </div>
      
      {/* Elementos fora do retângulo (lado direito) */}
      <div className="flex items-center space-x-3">
        {/* Botão de Novidades */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowNewsDialog(true)}
          className="flex items-center justify-center hover:bg-white/20 text-white"
        >
          <div className="relative h-8 w-8">
            <Image 
              src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//star.webp" 
              alt="Novidades" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </Button>
        
        {/* Ícone de Feedback e Suporte */}
        <Button 
          variant="ghost" 
          size="icon"
          asChild
          className="hover:bg-white/10 rounded-full h-10 w-10 flex items-center justify-center"
        >
          <Link href="/dashboard/feedback">
            <MessageSquareHeart className="h-24 w-24 text-black" />
          </Link>
        </Button>
        
        {/* Avatar do usuário - link direto para Minha Conta */}
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          className="p-0 hover:bg-studiefy-black/5 rounded-full"
        >
          <Link href="/dashboard/profile">
            <Avatar className="h-12 w-12 shadow-md">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.name || 'Avatar'} />
              ) : (
                <AvatarFallback className="bg-studiefy-black/20 text-studiefy-white text-sm">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
        </Button>
      </div>
      
      {/* Diálogo de Novidades */}
      <NewsDialog open={showNewsDialog} onOpenChange={setShowNewsDialog} />
      
      {/* Diálogo de Adicionar Matéria */}
      <AddSubjectDialog 
        onAddSubject={async (name, color) => {
          try {
            await addSubject(name, color);
            toast.success("Matéria adicionada com sucesso");
            // Atualizar a página para mostrar a nova matéria
            setTimeout(() => {
              router.refresh();
            }, 500);
          } catch (error: any) {
            if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
              toast.error("Erro ao adicionar matéria");
            }
            throw error;
          }
        }}
        isOpenExternal={showAddSubjectDialog}
        onOpenChangeExternal={setShowAddSubjectDialog}
        showTriggerButton={false}
      />
    </header>
  )
}
