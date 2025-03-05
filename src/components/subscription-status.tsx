'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';

export function SubscriptionStatus() {
  const { subscription, isLoading, isPremium, willCancel } = useSubscription();
  const [isVisible, setIsVisible] = useState(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    // Verifica se o usuário já fechou o card antes (usando localStorage)
    const cardClosed = localStorage.getItem('subscription-card-closed');
    if (cardClosed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('subscription-card-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando informações da assinatura...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      Plano {isPremium ? 'Premium' : 'Gratuito'}
                    </h3>
                    <Badge className={isPremium ? 'bg-green-500' : 'bg-blue-500'}>
                      {isPremium ? 'Ativo' : 'Básico'}
                    </Badge>
                    {willCancel && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                        Cancelamento agendado
                      </Badge>
                    )}
                  </div>
                  {isPremium && subscription?.current_period_end && (
                    <p className="text-sm text-muted-foreground">
                      {willCancel ? (
                        <span className="flex items-center text-yellow-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Acesso Premium até: {formatDate(subscription.current_period_end)}
                        </span>
                      ) : (
                        <>Próxima renovação: {formatDate(subscription.current_period_end)}</>
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/subscription">
                {isPremium ? 'Gerenciar Assinatura' : 'Fazer Upgrade'}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <span className="sr-only">Fechar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
