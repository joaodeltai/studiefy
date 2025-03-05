"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Sparkles, Star, BookOpen, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UpgradePremiumDialogProps {
  /**
   * Modo de abertura do dialog
   * - "trigger": Fornece um trigger para abrir o dialog (botão ou qualquer elemento)
   * - "controlled": O dialog é controlado externamente por isOpen/onOpenChange
   */
  mode?: "trigger" | "controlled";
  
  /**
   * Componente trigger para abrir o dialog
   * Só é necessário quando mode="trigger"
   */
  trigger?: React.ReactNode;
  
  /**
   * Se o dialog está aberto
   * Só é necessário quando mode="controlled"
   */
  isOpen?: boolean;
  
  /**
   * Callback chamado quando o estado do dialog muda
   * Só é necessário quando mode="controlled"
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * Título personalizado para o dialog
   * Se não for fornecido, será usado o título padrão
   */
  title?: string;
  
  /**
   * Descrição personalizada para o dialog
   * Se não for fornecido, será usada a descrição padrão
   */
  description?: string;
  
  /**
   * Recurso específico que está sendo limitado
   * Exemplo: 'matérias', 'conteúdos', etc.
   */
  featureName?: string;
  
  /**
   * Classe CSS adicional para o conteúdo do dialog
   */
  className?: string;
}

/**
 * Dialog para incentivo de upgrade para o plano Premium
 * Pode ser usado como uma trigger direta ou controlado por estado externo
 */
export function UpgradePremiumDialog({
  mode = "trigger",
  trigger,
  isOpen,
  onOpenChange,
  title,
  description,
  featureName,
  className,
}: UpgradePremiumDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { createCheckoutSession } = useSubscription();
  
  // Título padrão baseado no recurso especificado
  const defaultTitle = featureName 
    ? `Desbloqueie ${featureName} ilimitados!`
    : "Desbloqueie todos os recursos do Studiefy!";
  
  // Descrição padrão baseada no recurso
  const defaultDescription = featureName
    ? `Atualize para o plano Premium e tenha acesso a ${featureName} ilimitados e muito mais.`
    : "Atualize para o plano Premium e tenha acesso a todos os recursos do Studiefy sem limitações.";
  
  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      
      // Se temos a função de checkout, usamos ela
      if (createCheckoutSession) {
        const checkoutUrl = await createCheckoutSession(process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM!);
        
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
      }
      
      // Fallback: navegar para a página de assinatura
      router.push("/dashboard/subscription");
      
      // Se estamos no modo controlado, fechar o dialog
      if (mode === "controlled" && onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erro ao processar upgrade:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Conteúdo interno do dialog
  const dialogContent = (
    <DialogContent className={cn("sm:max-w-[600px]", className)}>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          {title || defaultTitle}
        </DialogTitle>
        <DialogDescription className="text-base">
          {description || defaultDescription}
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        <div className="mb-6">
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white mb-2">
            PLANO PREMIUM
          </Badge>
          <h3 className="text-xl font-semibold mb-2">R$ 19,90/mês</h3>
          <p className="text-sm text-muted-foreground">
            Cancele a qualquer momento
          </p>
        </div>
        
        <h4 className="font-medium mb-2">O plano Premium inclui:</h4>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Matérias ilimitadas</span>
              <p className="text-sm text-muted-foreground">
                Crie quantas matérias quiser
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Conteúdos ilimitados</span>
              <p className="text-sm text-muted-foreground">
                Adicione quantos conteúdos precisar
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Caderno de erros completo</span>
              <p className="text-sm text-muted-foreground">
                Nunca mais cometa o mesmo erro
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Página de Notas</span>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu desempenho em todas as avaliações
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Recursos exclusivos</span>
              <p className="text-sm text-muted-foreground">
                Acesso a funcionalidades avançadas
              </p>
            </div>
          </li>
        </ul>
        
        <div className="flex flex-wrap justify-center gap-3 px-2 py-3 bg-gray-50 rounded-lg border mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-700">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span>Use em todos os dispositivos</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700">
            <BookOpen className="h-3.5 w-3.5 text-amber-500" />
            <span>Sem limite de uso</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700">
            <Gauge className="h-3.5 w-3.5 text-amber-500" />
            <span>Desempenho otimizado</span>
          </div>
        </div>
      </div>
      
      <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={() => {
            if (mode === "controlled" && onOpenChange) {
              onOpenChange(false);
            }
          }}
        >
          Continuar no plano Free
        </Button>
        <Button 
          onClick={handleUpgrade}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Assinar Premium
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
  
  // Renderização condicional baseada no modo
  if (mode === "controlled") {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
