'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SubscriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { subscription, isPremium, willCancel, isCanceling, createCheckoutSession, cancelSubscription } = useSubscription();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      setIsLoading(true);
      
      const checkoutUrl = await createCheckoutSession(priceId);
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      console.error('Erro ao assinar:', error);
      toast.error(error.message || 'Ocorreu um erro ao processar sua assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    await cancelSubscription();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Planos de Assinatura</h1>
      
      {isPremium && (
        <div className="max-w-4xl mx-auto mb-8 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                Sua assinatura: Premium
                <Badge className="ml-2 bg-green-500">Ativo</Badge>
                {willCancel && (
                  <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-500">
                    Cancelamento agendado
                  </Badge>
                )}
              </h2>
              <p className="text-muted-foreground mt-1">
                Período atual: {formatDate(subscription?.current_period_start || '')} a {formatDate(subscription?.current_period_end || '')}
              </p>
              {willCancel && (
                <p className="text-sm text-yellow-600 mt-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Sua assinatura será cancelada em {formatDate(subscription?.current_period_end || '')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Voltar ao Dashboard
              </Button>
              
              {isPremium && !willCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Cancelar Assinatura</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar assinatura Premium?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ao cancelar sua assinatura, você continuará tendo acesso ao plano Premium até o final do período atual ({formatDate(subscription?.current_period_end || '')}). 
                        Após essa data, sua conta será convertida para o plano Gratuito.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isCanceling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          'Confirmar Cancelamento'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plano Gratuito */}
        <Card className={`flex flex-col ${subscription?.plan === 'free' ? 'border-green-500' : ''}`}>
          <CardHeader>
            {subscription?.plan === 'free' && !isPremium && (
              <div className="py-1 px-3 bg-green-500 text-white rounded-full text-xs font-medium w-fit mb-2">
                SEU PLANO ATUAL
              </div>
            )}
            <CardTitle className="text-2xl">Plano Gratuito</CardTitle>
            <CardDescription>Acesso básico ao Studiefy</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">R$ 0</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Acesso a 3 matérias</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Até 10 conteúdos por matéria</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Caderno de erros básico</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Acompanhamento de progresso</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_FREE!)}
              disabled={isLoading || subscription?.plan === 'free'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : subscription?.plan === 'free' ? (
                'Plano Atual'
              ) : (
                'Começar Grátis'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Plano Premium */}
        <Card className={`flex flex-col ${isPremium ? 'border-green-500' : 'border-primary'}`}>
          <CardHeader className={`${isPremium ? 'bg-green-500/10' : 'bg-primary/10'} rounded-t-lg`}>
            {isPremium ? (
              <div className="py-1 px-3 bg-green-500 text-white rounded-full text-xs font-medium w-fit mb-2">
                SEU PLANO ATUAL
              </div>
            ) : (
              <div className="py-1 px-3 bg-primary text-primary-foreground rounded-full text-xs font-medium w-fit mb-2">
                RECOMENDADO
              </div>
            )}
            <CardTitle className="text-2xl">Plano Premium</CardTitle>
            <CardDescription>Acesso completo ao Studiefy</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">R$ 19,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Matérias ilimitadas</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Conteúdos ilimitados</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Caderno de erros avançado</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Estatísticas detalhadas</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Acesso a recursos exclusivos</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM!)}
              disabled={isLoading || isPremium}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : isPremium ? (
                'Plano Atual'
              ) : (
                'Assinar Premium'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
