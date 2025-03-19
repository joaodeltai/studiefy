'use client'

import { useState, useEffect } from 'react'
import { useOnboardingContext } from './onboarding-provider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronDown, 
  ChevronUp, 
  X
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const onboardingSteps = [
  {
    id: 'created_subject',
    title: 'Criar primeira matéria',
    description: 'Crie sua primeira matéria para começar a organizar seus estudos',
    href: '/dashboard/subjects',
  },
  {
    id: 'created_content',
    title: 'Adicionar um conteúdo',
    description: 'Adicione um conteúdo dentro da sua matéria',
    href: '/dashboard/subjects',
  },
  {
    id: 'created_event',
    title: 'Criar um evento de estudo',
    description: 'Registre uma prova, simulado ou trabalho',
    href: '/dashboard/assessments',
  },
  {
    id: 'added_grade',
    title: 'Registrar uma nota',
    description: 'Adicione uma nota ao seu primeiro evento',
  },
  {
    id: 'added_error_entry',
    title: 'Adicionar ao caderno de erros',
    description: 'Registre uma questão no caderno de erros',
  },
  {
    id: 'visited_review',
    title: 'Visitar a página de revisão',
    description: 'Conheça a página de revisão para estudar seus erros',
    href: '/dashboard/review',
  },
  {
    id: 'configured_event_source',
    title: 'Configurar origem de eventos',
    description: 'Personalize as origens dos seus eventos de estudo',
    href: '/dashboard/settings',
  },
  {
    id: 'visited_grades',
    title: 'Verificar estatísticas de notas',
    description: 'Acompanhe seu progresso através das estatísticas',
    href: '/dashboard/grades',
  },
]

export function OnboardingChecklist() {
  const { progress, loading, minimized, toggleMinimized, markStepCompleted, unmarkStep } = useOnboardingContext()
  const pathname = usePathname()
  const [completedCount, setCompletedCount] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)

  // Calcular progresso
  useEffect(() => {
    if (!progress) return

    let count = 0
    let total = onboardingSteps.length

    for (const step of onboardingSteps) {
      if (progress[step.id as keyof typeof progress] === true) {
        count++
      }
    }

    setCompletedCount(count)
    setProgressPercentage(Math.round((count / total) * 100))
  }, [progress])

  // Função para atualizar o estado de um passo quando o usuário clica no checkbox
  const handleCheckboxChange = (stepId: string, checked: boolean) => {
    if (checked) {
      markStepCompleted(stepId as keyof typeof progress)
    } else {
      unmarkStep(stepId as keyof typeof progress)
    }
  }

  // Se o onboarding estiver carregando, não mostrar nada
  if (!progress || loading) {
    return null
  }

  // Se o onboarding foi concluído (todos os passos), não mostrar nada
  if (progress.is_completed) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-[100] bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ease-in-out',
        minimized ? 'w-64' : 'w-80',
        minimized ? 'h-16' : 'max-h-[calc(100vh-8rem)]'
      )}
      style={{
        marginLeft: typeof window !== 'undefined' && window.innerWidth > 768 ? '18rem' : '0',
      }}
    >
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-sm">Primeiros passos</h3>
          <div className="text-xs text-gray-500">
            {completedCount}/{onboardingSteps.length}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleMinimized}
          >
            {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => dismissOnboarding()}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fechar onboarding</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="px-4 py-2">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Lista de passos */}
      {!minimized && (
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-16rem)]">
          <ul className="space-y-4">
            {onboardingSteps.map((step) => {
              const isCompleted = progress[step.id as keyof typeof progress] === true

              return (
                <li
                  key={step.id}
                  className={cn(
                    'flex items-start space-x-3 p-2 rounded-md transition-colors',
                    isCompleted ? 'bg-green-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <Checkbox 
                      id={`checkbox-${step.id}`}
                      checked={isCompleted}
                      onCheckedChange={(checked) => handleCheckboxChange(step.id, checked === true)}
                      className={isCompleted ? 'text-green-500 border-green-500' : ''}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor={`checkbox-${step.id}`}
                        className={cn(
                          'font-medium text-sm cursor-pointer',
                          isCompleted ? 'text-green-700' : 'text-gray-700'
                        )}
                      >
                        {step.title}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    
                    {!isCompleted && step.href && (
                      <div className="mt-2">
                        <Link href={step.href}>
                          <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                            Ir para {step.title.toLowerCase()}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
