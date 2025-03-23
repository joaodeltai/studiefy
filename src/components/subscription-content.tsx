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

export function SubscriptionContent() {
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
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-studiefy-black/10">
      <h2 className="text-xl font-semibold mb-6">Planos de Assinatura</h2>

      {/* Conteúdo */}
      {isPremium && !isTrialing && (
        <div className="mb-8 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
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
        <div className="mb-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
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
        <div className="mb-8 p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                Período de Teste Expirado
                <Badge variant="outline" className="ml-2 border-red-500 text-red-500">Expirado</Badge>
              </h2>
              <p className="text-muted-foreground mt-1">
                Seu período de teste gratuito terminou. Assine agora para continuar acessando os recursos premium.
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

      {/* Planos de Assinatura */}
      {!isPremium && (
        <div className="space-y-6">
          <Tabs defaultValue="monthly" className="w-full" onValueChange={(value) => setSelectedPeriod(value === "monthly" ? SubscriptionPeriod.MONTHLY : SubscriptionPeriod.ANNUAL)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="annual">Anual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="space-y-4">
              <Card className="border-2 border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Plano Premium</span>
                    <Badge>Mais Popular</Badge>
                  </CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">R$ 19,90</span>
                    <span className="text-muted-foreground ml-1">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Acesso a todas as funcionalidades premium</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Sem limites de uso</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Atualizações constantes</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                    onClick={() => handleSubscribe(PREMIUM_MONTHLY_PRICE_ID || '')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="annual" className="space-y-4">
              <Card className="border-2 border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Plano Premium Anual</span>
                    <Badge>Melhor Valor</Badge>
                  </CardTitle>
                  <div className="flex flex-col">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">R$ 199,90</span>
                      <span className="text-muted-foreground ml-1">/ano</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium mt-1">Economize R$ 39,80 (2 meses grátis)</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Acesso a todas as funcionalidades premium</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Sem limites de uso</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Atualizações constantes</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Suporte prioritário</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span className="font-medium">Economia de 2 meses no valor anual</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                    onClick={() => handleSubscribe(PREMIUM_ANNUAL_PRICE_ID || '')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Pagamento seguro processado pelo Stripe. Cancele a qualquer momento.</p>
          </div>
        </div>
      )}
    </div>
  );
}
