import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrialBannerProps {
  isTrialing: boolean;
  daysRemaining: number | null;
  isExpired: boolean;
}

/**
 * Componente que exibe um banner informativo sobre o status do período de teste gratuito
 */
export function TrialBanner({ isTrialing, daysRemaining, isExpired }: TrialBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  // Verifica se o banner foi fechado anteriormente
  useEffect(() => {
    const bannerClosed = localStorage.getItem('trialBannerClosed');
    if (bannerClosed) {
      setIsVisible(false);
    }
  }, []);

  // Se o banner não estiver visível, não exibe nada
  if (!isVisible) {
    return null;
  }

  // Se não estiver em período de teste e não tiver expirado, não exibe o banner
  if (!isTrialing && !isExpired) {
    return null;
  }

  // Navega para a página de assinatura
  const handleUpgradeClick = () => {
    router.push('/dashboard/subscription');
  };

  // Fecha o banner e salva a preferência no localStorage
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('trialBannerClosed', 'true');
  };

  return (
    <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-2 h-6 w-6 rounded-full hover:bg-gray-200/50 z-10" 
        onClick={handleClose}
        aria-label="Fechar banner"
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isTrialing && daysRemaining && daysRemaining > 0 ? (
              <>
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium text-foreground">
                    Seu período de teste termina em{' '}
                    <Badge variant="outline" className="ml-1 font-semibold bg-blue-500/10 text-blue-600">
                      {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aproveite todos os recursos premium durante este período!
                  </p>
                </div>
              </>
            ) : isTrialing && daysRemaining && daysRemaining <= 0 ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-medium text-foreground">
                    Seu período de teste termina hoje!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assine agora para continuar aproveitando todos os recursos premium.
                  </p>
                </div>
              </>
            ) : isExpired ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-medium text-foreground">
                    Seu período de teste gratuito expirou
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assine agora para recuperar o acesso aos recursos premium.
                  </p>
                </div>
              </>
            ) : null}
          </div>
          <Button 
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
          >
            Assinar Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
