"use client"

import { ErrorNotebook } from "@/components/error-notebook"
import { PremiumGate } from "@/components/premium-gate"
import { ErrorEntry } from "@/hooks/useEvents"
import { Subject } from "@/hooks/useSubjects"
import { SubjectCategory } from "@/hooks/useSubjectCategories"
import { EventSource } from "@/hooks/useEventSources"
import { ReactElement, useState, useEffect } from "react"
import { CheckCircle, PenSquare, Brain, BookOpen } from "lucide-react"
import { useSubscription } from "@/hooks/useSubscription"
import { SubscriptionPlan, SubscriptionStatus } from "@/types/subscription"

interface PremiumErrorNotebookProps {
  eventId: string
  errorEntries: ErrorEntry[]
  subjects: Subject[]
  categories: SubjectCategory[]
  eventSources?: EventSource[]
  isQuestionType: boolean
  isGeneralEvent?: boolean
  onAddEntry: (
    question: string, 
    subjectId?: string, 
    categoryId?: string, 
    sourceId?: string, 
    difficulty?: string,
    notes?: string
  ) => Promise<void>
  onUpdateEntry: (
    errorEntryId: string, 
    updates: { 
      question?: string; 
      subject_id?: string; 
      category_id?: string; 
      source_id?: string;
      difficulty?: string;
      notes?: string;
    }
  ) => Promise<void>
  onDeleteEntry: (errorEntryId: string) => Promise<void>
}

/**
 * Componente que envolve o ErrorNotebook com uma restrição premium.
 * Mostra uma versão desfocada com um banner de aviso para usuários free.
 */
export function PremiumErrorNotebook(props: PremiumErrorNotebookProps): ReactElement {
  const { subscription, isPremium, isLoading } = useSubscription();
  const [isUserPremium, setIsUserPremium] = useState(false);
  
  // Verificação adicional para garantir que o status premium seja correto
  useEffect(() => {
    if (!isLoading) {
      const premium = Boolean(
        subscription && 
        subscription.plan === SubscriptionPlan.PREMIUM && 
        (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIALING)
      );
      setIsUserPremium(premium);
    }
  }, [isLoading, subscription]);

  const customMessage = `
    O Caderno de Erros é uma funcionalidade premium que permite:
    
    • Registrar questões que você errou
    • Organizar por matéria, categoria e dificuldade
    • Adicionar notas e observações para revisão
    • Acompanhar seu progresso e evitar erros futuros
  `;

  // Para usuários premium, apenas renderiza o ErrorNotebook diretamente
  if (isUserPremium) {
    return <ErrorNotebook {...props} />;
  }

  // Para usuários free, mostra o gate premium
  return (
    <div className="relative">
      <PremiumGate 
        message={customMessage}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-background/80 backdrop-blur-[2px] rounded-lg"
      >
        <div className="flex flex-wrap justify-center gap-3 mb-4 max-w-md">
          <div className="flex items-center gap-1 text-sm">
            <PenSquare className="h-4 w-4 text-emerald-500" />
            <span>Registre erros</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Organize por matéria</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Brain className="h-4 w-4 text-emerald-500" />
            <span>Adicione notas</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span>Revise e aprenda</span>
          </div>
        </div>
      </PremiumGate>

      {/* O caderno de erros original é renderizado normalmente, mas ficará atrás do banner para usuários free */}
      <ErrorNotebook {...props} />
    </div>
  );
}
