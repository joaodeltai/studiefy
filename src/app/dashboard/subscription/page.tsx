'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionPeriod } from '@/types/subscription';
import { PREMIUM_MONTHLY_PRICE_ID, PREMIUM_ANNUAL_PRICE_ID } from '@/lib/stripe-client';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>(SubscriptionPeriod.MONTHLY);
  const { subscription, isPremium, willCancel, isCanceling, createCheckoutSession, cancelSubscription } = useSubscription();
  const { isTrialing, daysRemaining, isExpired } = useTrialStatus();

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
    try {
      setIsLoading(true);
      await cancelSubscription();
      toast.success('Sua assinatura foi cancelada com sucesso');
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      toast.error(error.message || 'Ocorreu um erro ao cancelar sua assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar o preço atual com base no período selecionado
  const currentPriceId = selectedPeriod === SubscriptionPeriod.MONTHLY 
    ? PREMIUM_MONTHLY_PRICE_ID 
    : PREMIUM_ANNUAL_PRICE_ID;

  // Determinar o preço a ser exibido com base no período
  const premiumPrice = selectedPeriod === SubscriptionPeriod.MONTHLY 
    ? 'R$ 19,90' 
    : 'R$ 199,90';
  
  // Calcular a economia no plano anual (2 meses grátis)
  const annualSavings = selectedPeriod === SubscriptionPeriod.ANNUAL 
    ? 'Economize R$ 39,80 (2 meses grátis)' 
    : '';

  return (
    <div className="h-full p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center mb-6 md:pl-12">
        <h1 className="text-2xl font-bold">Planos de Assinatura</h1>
      </div>

      {/* Conteúdo */}
      {isPremium && !isTrialing && (
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
              {subscription?.period && (
                <p className="text-sm text-muted-foreground mt-1">
                  Tipo de assinatura: {subscription.period === 'monthly' ? 'Mensal' : 'Anual'}
                </p>
              )}
              {willCancel && (
                <p className="text-sm text-yellow-600 mt-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Sua assinatura será cancelada em {formatDate(subscription?.current_period_end || '')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {isPremium && !willCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Cancelar Assinatura</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ao cancelar sua assinatura, você perderá acesso aos recursos premium ao final do período atual.
                        Você não será reembolsado pelo tempo restante do período atual.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isCanceling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Sim, cancelar assinatura'
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

      {/* Seção de Trial */}
      {isTrialing && daysRemaining !== null && (
        <div className="max-w-4xl mx-auto mb-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                Período de Teste Gratuito
                <Badge className="ml-2 bg-blue-500">
                  {daysRemaining > 0 ? 'Ativo' : 'Expira hoje'}
                </Badge>
              </h2>
              <p className="text-muted-foreground mt-1">
                Você está utilizando o plano Premium gratuitamente por 15 dias.
              </p>
              <p className="text-sm text-blue-600 mt-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {daysRemaining > 0 
                  ? `Seu período de teste termina em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`
                  : 'Seu período de teste termina hoje!'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSubscribe(currentPriceId || '')} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Assinar Premium Agora'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Trial Expirado */}
      {isExpired && (
        <div className="max-w-4xl mx-auto mb-8 p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                Período de Teste Expirado
                <Badge className="ml-2 bg-amber-500">Expirado</Badge>
              </h2>
              <p className="text-muted-foreground mt-1">
                Seu período de teste gratuito terminou. Assine o plano Premium para continuar aproveitando todos os recursos.
              </p>
              <p className="text-sm text-amber-600 mt-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Você está utilizando o plano gratuito com recursos limitados.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSubscribe(currentPriceId || '')} 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Recuperar Acesso Premium'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Seletor de Período */}
      <div className="max-w-4xl mx-auto mb-6">
        <Tabs 
          defaultValue={SubscriptionPeriod.MONTHLY} 
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value as SubscriptionPeriod)}
          className="w-full"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value={SubscriptionPeriod.MONTHLY}>Mensal</TabsTrigger>
              <TabsTrigger value={SubscriptionPeriod.ANNUAL}>Anual</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Plano Gratuito */}
        <Card className="border-2 border-muted">
          <CardHeader>
            <CardTitle>Plano Gratuito</CardTitle>
            <CardDescription>Acesso básico à plataforma</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">R$ 0</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Acesso a materiais básicos</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Limite de 5 questões por dia</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Recursos básicos de estudo</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Plano Atual
            </Button>
          </CardFooter>
        </Card>

        {/* Plano Premium */}
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader>
            <CardTitle>Plano Premium</CardTitle>
            <CardDescription>Acesso completo a todos os recursos</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">{premiumPrice}</span>
              <span className="text-muted-foreground">/{selectedPeriod === SubscriptionPeriod.MONTHLY ? 'mês' : 'ano'}</span>
              {annualSavings && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                  {annualSavings}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Acesso a todos os materiais e cursos</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Questões ilimitadas</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Recursos avançados de estudo</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Revisão Inteligente</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Atualizações exclusivas</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => handleSubscribe(currentPriceId || '')}
              disabled={isLoading || (isPremium && !willCancel)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : isPremium && !willCancel ? (
                'Plano Atual'
              ) : isPremium && willCancel ? (
                'Renovar Assinatura'
              ) : (
                'Assinar Agora'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
