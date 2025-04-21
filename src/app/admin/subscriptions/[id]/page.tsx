"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '@/types/subscription';

type SubscriptionDetails = Subscription & {
  profiles: {
    email: string;
    full_name: string;
  };
  stripe_data: any;
  logs: Array<{
    id: string;
    user_id: string;
    old_plan: string;
    new_plan: string;
    old_status: string;
    new_status: string;
    changed_at: string;
    reason: string;
  }>;
};

export default function SubscriptionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Verificar se o usuário é administrador
  useEffect(() => {
    if (!profileLoading && profile) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (!adminEmail || !adminEmail.split(',').includes(profile.email)) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para acessar esta página.',
          variant: 'destructive',
        });
        router.push('/dashboard');
      } else {
        fetchSubscriptionDetails();
      }
    }
  }, [profile, profileLoading, params.id]);

  // Buscar detalhes da assinatura
  const fetchSubscriptionDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/subscriptions/${params.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar detalhes da assinatura');
      }
      
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error: any) {
      console.error('Erro ao buscar detalhes da assinatura:', error);
      toast({
        title: 'Erro ao buscar detalhes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar com o Stripe
  const syncWithStripe = async () => {
    if (!subscription?.stripe_subscription_id) {
      toast({
        title: 'Erro',
        description: 'Esta assinatura não possui ID do Stripe para sincronização.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSyncing(true);
    try {
      const response = await fetch('/api/subscriptions/sync-with-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao sincronizar com o Stripe');
      }

      toast({
        title: 'Sincronização concluída',
        description: 'Assinatura sincronizada com sucesso!',
      });

      // Atualizar os detalhes
      fetchSubscriptionDetails();
    } catch (error: any) {
      console.error('Erro ao sincronizar com o Stripe:', error);
      toast({
        title: 'Erro ao sincronizar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Renderizar badge de status
  const renderStatusBadge = (status: SubscriptionStatus, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd && status === SubscriptionStatus.ACTIVE) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Cancelamento Agendado</Badge>;
    }

    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Ativa</Badge>;
      case SubscriptionStatus.TRIALING:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Trial</Badge>;
      case SubscriptionStatus.CANCELED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelada</Badge>;
      case SubscriptionStatus.EXPIRED:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Renderizar badge de plano
  const renderPlanBadge = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.PREMIUM:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Premium</Badge>;
      case SubscriptionPlan.FREE:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Gratuito</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  if (profileLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin/subscriptions')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Assinatura</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Assinatura não encontrada</h2>
            <p className="text-muted-foreground mb-6">Não foi possível encontrar os detalhes desta assinatura.</p>
            <Button onClick={() => router.push('/admin/subscriptions')}>
              Voltar para lista de assinaturas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push('/admin/subscriptions')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalhes da Assinatura</h1>
            <p className="text-muted-foreground">ID: {subscription.id}</p>
          </div>
        </div>
        
        {subscription.stripe_subscription_id && (
          <Button 
            onClick={syncWithStripe} 
            disabled={isSyncing}
            className="self-start sm:self-auto"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sincronizar com Stripe
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Assinatura</CardTitle>
            <CardDescription>
              Detalhes completos sobre esta assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="stripe">Dados do Stripe</TabsTrigger>
                <TabsTrigger value="logs">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <div>{renderStatusBadge(subscription.status, subscription.cancel_at_period_end)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Plano</h3>
                      <div>{renderPlanBadge(subscription.plan)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Período</h3>
                      <div>{subscription.period || 'N/A'}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Cancelamento ao final do período</h3>
                      <div>
                        {subscription.cancel_at_period_end ? (
                          <span className="flex items-center text-yellow-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Sim
                          </span>
                        ) : (
                          <span className="flex items-center text-muted-foreground">
                            <XCircle className="h-4 w-4 mr-1" />
                            Não
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Início do período atual</h3>
                      <div>{formatDate(subscription.current_period_start)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Fim do período atual</h3>
                      <div>{formatDate(subscription.current_period_end)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Criado em</h3>
                      <div>{formatDate(subscription.created_at)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Atualizado em</h3>
                      <div>{formatDate(subscription.updated_at)}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ID do Cliente no Stripe</h3>
                      <div className="font-mono text-sm">{subscription.stripe_customer_id || 'N/A'}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ID da Assinatura no Stripe</h3>
                      <div className="font-mono text-sm">{subscription.stripe_subscription_id || 'N/A'}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ID do Preço no Stripe</h3>
                      <div className="font-mono text-sm">{subscription.stripe_price_id || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stripe">
                {subscription.stripe_data ? (
                  subscription.stripe_data.error ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                      <h3 className="text-lg font-medium mb-1">Erro ao buscar dados do Stripe</h3>
                      <p className="text-sm text-muted-foreground">{subscription.stripe_data.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Status no Stripe</h3>
                          <div>{subscription.stripe_data.status}</div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Cancelamento ao final do período</h3>
                          <div>
                            {subscription.stripe_data.cancel_at_period_end ? (
                              <span className="flex items-center text-yellow-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Sim
                              </span>
                            ) : (
                              <span className="flex items-center text-muted-foreground">
                                <XCircle className="h-4 w-4 mr-1" />
                                Não
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Início do período atual (Stripe)</h3>
                          <div>{formatDate(subscription.stripe_data.current_period_start)}</div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Fim do período atual (Stripe)</h3>
                          <div>{formatDate(subscription.stripe_data.current_period_end)}</div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de cancelamento</h3>
                          <div>{formatDate(subscription.stripe_data.cancel_at)}</div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Cancelado em</h3>
                          <div>{formatDate(subscription.stripe_data.canceled_at)}</div>
                        </div>
                      </div>
                      
                      {subscription.stripe_data.items && subscription.stripe_data.items.length > 0 && (
                        <>
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Itens da assinatura</h3>
                            <div className="space-y-2">
                              {subscription.stripe_data.items.map((item: any, index: number) => (
                                <div key={item.id} className="p-2 bg-muted rounded-md">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-xs text-muted-foreground">ID do Item:</span>
                                      <div className="font-mono text-sm truncate">{item.id}</div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">ID do Preço:</span>
                                      <div className="font-mono text-sm truncate">{item.price}</div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">ID do Produto:</span>
                                      <div className="font-mono text-sm truncate">{item.product}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">Sem dados do Stripe</h3>
                    <p className="text-sm text-muted-foreground">Esta assinatura não possui dados do Stripe disponíveis.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="logs">
                {subscription.logs && subscription.logs.length > 0 ? (
                  <div className="space-y-4">
                    {subscription.logs.map((log) => (
                      <div key={log.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">
                            {log.old_plan} ({log.old_status}) → {log.new_plan} ({log.new_status})
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(log.changed_at)}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Motivo: </span>
                          {log.reason || 'Não especificado'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">Sem histórico</h3>
                    <p className="text-sm text-muted-foreground">Não há registros de alterações para esta assinatura.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              Detalhes do usuário associado a esta assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Nome</h3>
                <div className="font-medium">{subscription.profiles?.full_name || 'N/A'}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <div>{subscription.profiles?.email || 'N/A'}</div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">ID do Usuário</h3>
                <div className="font-mono text-sm break-all">{subscription.user_id}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">ID do Perfil</h3>
                <div className="font-mono text-sm break-all">{subscription.profile_id || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push(`/admin/users/${subscription.user_id}`)}
            >
              Ver perfil completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
