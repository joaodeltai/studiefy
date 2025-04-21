"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '@/types/subscription';
import { useProfile } from '@/hooks/useProfile';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  type ExtendedSubscription = Subscription & {
    email?: string;
    full_name?: string;
  };

  const [subscriptions, setSubscriptions] = useState<ExtendedSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<ExtendedSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

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
        // Inicializar com array vazio para evitar erro de undefined
        setFilteredSubscriptions([]);
        fetchSubscriptions();
      }
    }
  }, [profile, profileLoading]);

  // Buscar todas as assinaturas
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      console.log('Iniciando busca de todas as assinaturas diretamente do Supabase...');
      
      // Buscar todas as assinaturas diretamente do Supabase
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Erro na consulta de assinaturas:', subscriptionsError);
        throw new Error(`Erro ao buscar assinaturas: ${subscriptionsError.message}`);
      }
      
      console.log(`Encontradas ${subscriptionsData?.length || 0} assinaturas no banco de dados`);
      
      if (!subscriptionsData || subscriptionsData.length === 0) {
        console.warn('Nenhuma assinatura encontrada no banco de dados');
        setSubscriptions([]);
        setFilteredSubscriptions([]);
        return;
      }

      // Agora vamos buscar todos os perfis de uma vez para melhorar a performance
      // Buscar todos os perfis sem filtro para garantir que tenhamos todos os dados
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
      }
      
      // Criar um mapa de perfis para facilitar o acesso
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }
      
      console.log(`Encontrados ${profilesMap.size} perfis no banco de dados`);

      // Combinar assinaturas com perfis
      const formattedData = subscriptionsData.map((sub: Subscription) => {
        if (!sub.user_id) {
          return {
            ...sub,
            email: 'Sem usuário',
            full_name: 'Usuário desconhecido',
          } as ExtendedSubscription;
        }

        const profile = profilesMap.get(sub.user_id);
        
        if (!profile) {
          // Se não encontrou o perfil, buscar informações do auth.users se possível
          return {
            ...sub,
            email: `ID: ${sub.user_id.substring(0, 8)}...`,
            full_name: 'Perfil não encontrado',
          } as ExtendedSubscription;
        }

        return {
          ...sub,
          email: profile.email || `ID: ${sub.user_id.substring(0, 8)}...`,
          full_name: profile.full_name || profile.name || 'Sem nome',
        } as ExtendedSubscription;
      });
      
      // Log detalhado para depuração
      console.log('Amostra de assinaturas formatadas:');
      console.table(formattedData.slice(0, 3).map(s => ({
        id: s.id,
        user_id: s.user_id,
        email: s.email || 'N/A',
        plano: s.plan,
        status: s.status
      })));

      console.log('Total de assinaturas processadas:', formattedData.length);
      
      // Atualizar o estado com as assinaturas formatadas
      setSubscriptions(formattedData);
      
      // Aplicar o filtro atual
      filterByTab(selectedTab, formattedData);
      
    } catch (error: any) {
      console.error('Erro ao buscar assinaturas:', error);
      toast({
        title: 'Erro ao buscar assinaturas',
        description: error.message || 'Ocorreu um erro ao buscar as assinaturas',
        variant: 'destructive',
      });
      // Definir arrays vazios para evitar erros de renderização
      setSubscriptions([]);
      setFilteredSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar uma assinatura com o Stripe
  const syncWithStripe = async (subscriptionId: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/subscriptions/sync-with-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao sincronizar com o Stripe');
      }

      toast({
        title: 'Sincronização concluída',
        description: 'Assinatura sincronizada com sucesso!',
      });

      // Atualizar a lista de assinaturas
      fetchSubscriptions();
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

  // Filtrar assinaturas com base no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      filterByTab(selectedTab, subscriptions);
    } else {
      const filtered = subscriptions.filter((sub) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          sub.email?.toLowerCase().includes(searchLower) ||
          sub.full_name?.toLowerCase().includes(searchLower) ||
          sub.stripe_customer_id?.toLowerCase().includes(searchLower) ||
          sub.stripe_subscription_id?.toLowerCase().includes(searchLower) ||
          sub.user_id?.toLowerCase().includes(searchLower)
        );
      });
      filterByTab(selectedTab, filtered);
    }
  }, [searchTerm, subscriptions, selectedTab]);

  // Filtrar por tab (status)
  const filterByTab = (tab: string, subs: Subscription[]) => {
    console.log(`Filtrando por tab: ${tab}, total de assinaturas: ${subs?.length || 0}`);
    
    // Verificar se a lista de assinaturas é válida
    if (!subs || !Array.isArray(subs)) {
      console.warn('Lista de assinaturas inválida:', subs);
      setFilteredSubscriptions([]);
      return;
    }
    
    // Se a lista estiver vazia, não há nada para filtrar
    if (subs.length === 0) {
      console.warn('Lista de assinaturas vazia');
      setFilteredSubscriptions([]);
      return;
    }
    
    // Garantir que todas as assinaturas tenham valores válidos
    const validSubs = subs.filter(sub => sub !== null && sub !== undefined);
    
    console.log(`Assinaturas válidas após filtragem inicial: ${validSubs.length}`);
    
    let result: ExtendedSubscription[] = [];
    
    try {
      // Log detalhado para depuração
      if (validSubs.length > 0) {
        console.log('Amostra de assinaturas válidas:');
        console.table(validSubs.slice(0, 3).map((s: ExtendedSubscription) => ({
          id: s.id,
          user_id: s.user_id,
          email: (s as ExtendedSubscription).email || 'N/A',
          plano: s.plan,
          status: s.status
        })));
      }
      
      switch (tab) {
        case 'active':
          result = validSubs.filter(
            (sub) => sub.status === 'active' && !sub.cancel_at_period_end
          );
          console.log(`Assinaturas ativas encontradas: ${result.length}`);
          break;
          
        case 'premium':
          result = validSubs.filter(
            (sub) => sub.plan === 'premium'
          );
          console.log(`Assinaturas premium encontradas: ${result.length}`);
          break;
          
        case 'canceled':
          result = validSubs.filter(
            (sub) => sub.status === 'canceled' || sub.cancel_at_period_end
          );
          console.log(`Assinaturas canceladas encontradas: ${result.length}`);
          break;
          
        case 'expired':
          result = validSubs.filter(
            (sub) => sub.status === 'expired'
          );
          console.log(`Assinaturas expiradas encontradas: ${result.length}`);
          break;
          
        default: // 'all'
          // Para a tab 'all', mostrar TODAS as assinaturas válidas sem filtro adicional
          result = [...validSubs];
          console.log(`Mostrando todas as ${result.length} assinaturas`);
      }
      
      // Log para confirmação
      console.log(`Filtragem concluída com sucesso. Exibindo ${result.length} assinaturas.`);
      
    } catch (error) {
      console.error('Erro durante a filtragem por tab:', error);
      console.error(error);
      // Em caso de erro, mostrar todas as assinaturas válidas
      result = validSubs;
    }
    
    // Atualizar o estado com os resultados filtrados
    setFilteredSubscriptions(result);
    
    // Verificar se os filteredSubscriptions foram atualizados corretamente
    setTimeout(() => {
      console.log(`Estado filteredSubscriptions atualizado: ${filteredSubscriptions.length} assinaturas`);
    }, 0);
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

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Assinaturas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as assinaturas dos usuários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email, nome ou ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={fetchSubscriptions}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar
              </Button>
            </div>

            <Tabs defaultValue="all" onValueChange={(value) => setSelectedTab(value)}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="active">Ativas</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
                <TabsTrigger value="canceled">Canceladas</TabsTrigger>
                <TabsTrigger value="expired">Expiradas</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {renderSubscriptionsTable()}
              </TabsContent>
              <TabsContent value="active" className="mt-4">
                {renderSubscriptionsTable()}
              </TabsContent>
              <TabsContent value="premium" className="mt-4">
                {renderSubscriptionsTable()}
              </TabsContent>
              <TabsContent value="canceled" className="mt-4">
                {renderSubscriptionsTable()}
              </TabsContent>
              <TabsContent value="expired" className="mt-4">
                {renderSubscriptionsTable()}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderSubscriptionsTable() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando assinaturas...</span>
        </div>
      );
    }

    if (filteredSubscriptions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Nenhuma assinatura encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm ? 'Tente ajustar os critérios de busca.' : 'Não há assinaturas nesta categoria.'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Lista de assinaturas ({filteredSubscriptions.length})</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Término</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{sub.full_name}</div>
                    <div className="text-sm text-muted-foreground">{sub.email}</div>
                    {sub.stripe_customer_id && (
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                        ID: {sub.stripe_customer_id}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{renderPlanBadge(sub.plan)}</TableCell>
                <TableCell>{renderStatusBadge(sub.status, sub.cancel_at_period_end)}</TableCell>
                <TableCell>{formatDate(sub.current_period_start)}</TableCell>
                <TableCell>{formatDate(sub.current_period_end)}</TableCell>
                <TableCell>{formatDate(sub.updated_at)}</TableCell>
                <TableCell className="text-right">
                  {sub.stripe_subscription_id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncWithStripe(sub.stripe_subscription_id!)}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Sincronizar
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem ID do Stripe</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
