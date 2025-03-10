"use client"

import { useState, useEffect, useRef } from "react"
import { SubjectCard } from "@/components/subject-card"
import { useSubjects } from "@/hooks/useSubjects"
import { Loader2, PanelLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SubjectsPage() {
  const { subjects, loading } = useSubjects()
  const router = useRouter()
  const [showInfoDesktop, setShowInfoDesktop] = useState(false)
  const [showInfoMobile, setShowInfoMobile] = useState(false)
  const infoDesktopRef = useRef<HTMLDivElement>(null)
  const infoMobileRef = useRef<HTMLDivElement>(null)
  const btnDesktopRef = useRef<HTMLButtonElement>(null)
  const btnMobileRef = useRef<HTMLButtonElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Para desktop
      if (showInfoDesktop && 
          infoDesktopRef.current && 
          btnDesktopRef.current && 
          !infoDesktopRef.current.contains(event.target as Node) &&
          !btnDesktopRef.current.contains(event.target as Node)) {
        setShowInfoDesktop(false)
      }
      
      // Para mobile
      if (showInfoMobile && 
          infoMobileRef.current && 
          btnMobileRef.current && 
          !infoMobileRef.current.contains(event.target as Node) &&
          !btnMobileRef.current.contains(event.target as Node)) {
        setShowInfoMobile(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showInfoDesktop, showInfoMobile])

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="min-h-screen h-full p-4 space-y-4">
      {/* Header para telas médias e grandes */}
      <div className="hidden md:flex items-center md:pl-12">
        <h1 className="text-3xl font-bold text-studiefy-black">
          Matérias
        </h1>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 h-8 w-8 rounded-full hover:bg-studiefy-black/10"
            onClick={() => setShowInfoDesktop(!showInfoDesktop)}
            ref={btnDesktopRef}
          >
            <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
            <span className="sr-only">Informações sobre Matérias</span>
          </Button>
          
          {showInfoDesktop && (
            <div 
              ref={infoDesktopRef}
              className="absolute z-50 top-full left-0 mt-2 w-72 bg-white text-studiefy-black border border-studiefy-black/10 shadow-md p-3 rounded-md text-sm animate-in fade-in-50 duration-200"
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
              }}
            >
              <h3 className="text-base font-medium mb-1.5 text-studiefy-black">Sobre Matérias</h3>
              <p className="text-studiefy-black/80 mb-1.5 leading-snug">
                <strong>Matérias</strong> são as disciplinas que você está estudando. 
                Aqui você visualiza suas matérias cadastradas e o progresso de cada uma.
              </p>
              <p className="font-medium mb-1 mt-2 text-studiefy-black">Como usar:</p>
              <ul className="list-disc list-inside text-studiefy-black/80 leading-snug">
                <li>Clique em uma matéria para acessar seus conteúdos</li>
                <li>Use o menu (três pontos) para editar ou excluir</li>
                <li>Adicione novas matérias em Configurações</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Header para telas pequenas */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2"
          onClick={() => router.push("/dashboard")}
        >
          <PanelLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-studiefy-black">
            Matérias
          </h1>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-1 h-7 w-7 rounded-full hover:bg-studiefy-black/10"
              onClick={() => setShowInfoMobile(!showInfoMobile)}
              ref={btnMobileRef}
            >
              <Info className="h-3.5 w-3.5 text-studiefy-black/70 hover:text-studiefy-black" />
              <span className="sr-only">Informações sobre Matérias</span>
            </Button>
            
            {showInfoMobile && (
              <div 
                ref={infoMobileRef}
                className="absolute z-50 top-full right-0 mt-2 w-64 bg-white text-studiefy-black border border-studiefy-black/10 shadow-md p-3 rounded-md text-sm animate-in fade-in-50 duration-200"
                style={{
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                }}
              >
                <h3 className="text-base font-medium mb-1.5 text-studiefy-black">Sobre Matérias</h3>
                <p className="text-studiefy-black/80 mb-1.5 leading-snug">
                  <strong>Matérias</strong> são as disciplinas que você está estudando. 
                  Aqui você visualiza suas matérias cadastradas e o progresso de cada uma.
                </p>
                <p className="font-medium mb-1 mt-2 text-studiefy-black">Como usar:</p>
                <ul className="list-disc list-inside text-studiefy-black/80 leading-snug">
                  <li>Clique em uma matéria para acessar seus conteúdos</li>
                  <li>Use o menu (três pontos) para editar ou excluir</li>
                  <li>Adicione novas matérias em Configurações</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="w-10"></div> {/* Espaçador para centralizar o título */}
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-studiefy-gray">
          <p>Nenhuma matéria cadastrada</p>
          <p className="text-sm">Adicione matérias na página de Configurações</p>
        </div>
      ) : (
        <div className="px-1 sm:px-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                color={subject.color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
