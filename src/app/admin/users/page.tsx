"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Loader2, RefreshCw, Search, AlertCircle, UserPlus, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

interface User {
  id: string;
  user_id: string;
  email: string;
  name: string;
  full_name?: string;
  username: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  role?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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
        setFilteredUsers([]);
        fetchUsers();
      }
    }
  }, [profile, profileLoading]);

  // Buscar todos os usuários
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Iniciando busca de todos os perfis...');
      
      // Buscar todos os perfis diretamente do Supabase
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Erro na consulta de perfis:', profilesError);
        throw new Error(`Erro ao buscar perfis: ${profilesError.message}`);
      }
      
      console.log(`Encontrados ${profilesData?.length || 0} perfis no banco de dados`);
      
      if (!profilesData || profilesData.length === 0) {
        console.warn('Nenhum perfil encontrado no banco de dados');
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      // Log detalhado para depuração
      console.log('Amostra de perfis encontrados:');
      console.table(profilesData.slice(0, 3).map(p => ({
        id: p.user_id,
        email: p.email || 'N/A',
        name: p.full_name || p.name || 'N/A',
        role: p.role || 'user'
      })));

      // Formatar os dados para exibição
      const formattedData = profilesData.map((profile) => {
        return {
          id: profile.user_id || profile.id || '',
          user_id: profile.user_id || '',
          email: profile.email || 'Sem email',
          name: profile.full_name || profile.name || 'Sem nome',
          full_name: profile.full_name || profile.name || 'Sem nome',
          username: profile.username || '',
          avatar_url: profile.avatar_url || '',
          role: profile.role || 'user',
          status: profile.status || 'active',
          subscription_plan: profile.subscription_plan || 'free',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      });

      console.log('Total de perfis processados:', formattedData.length);
      
      // Atualizar o estado com os dados formatados
      setUsers(formattedData);
      
      // Aplicar filtragem inicial por tab
      filterByTab(selectedTab, formattedData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários. Tente novamente mais tarde.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Filtrar usuários com base no termo de busca
  useEffect(() => {
    console.log(`Executando filtro de busca. Termo: '${searchTerm}', Total de usuários: ${users.length}, Tab: ${selectedTab}`);
    
    if (!users.length) {
      console.log('Array de usuários vazio, não há o que filtrar');
      setFilteredUsers([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      console.log('Termo de busca vazio, aplicando apenas filtro por tab');
      filterByTab(selectedTab, users);
    } else {
      console.log(`Filtrando por termo de busca: '${searchTerm}'`);
      const filtered = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
          (user.username && user.username.toLowerCase().includes(searchLower)) ||
          (user.user_id && user.user_id.toLowerCase().includes(searchLower))
        );
      });
      console.log(`Encontrados ${filtered.length} usuários correspondentes ao termo de busca`);
      filterByTab(selectedTab, filtered);
    }
  }, [searchTerm, users, selectedTab]);

  // Filtrar por tab
  const filterByTab = (tab: string, users: User[]) => {
    console.log(`Filtrando por tab: ${tab}, total de usuários: ${users?.length || 0}`);
    
    // Verificar se a lista de usuários é válida
    if (!users || !Array.isArray(users)) {
      console.warn('Lista de usuários inválida:', users);
      setFilteredUsers([]);
      return;
    }
    
    // Se a lista estiver vazia, não há nada para filtrar
    if (users.length === 0) {
      console.warn('Lista de usuários vazia');
      setFilteredUsers([]);
      return;
    }
    
    // Garantir que todos os usuários tenham valores válidos
    const validUsers = users.filter(user => user !== null && user !== undefined);
    
    console.log(`Usuários válidos após filtragem inicial: ${validUsers.length}`);
    
    let result: User[] = [];
    
    try {
      // Log detalhado para depuração
      if (validUsers.length > 0) {
        console.log('Amostra de usuários válidos:');
        console.table(validUsers.slice(0, 3).map(u => ({
          id: u.id,
          email: u.email || 'N/A',
          name: u.name || 'N/A',
          role: u.role || 'user'
        })));
      }
      
      switch (tab) {
        case 'admin':
          result = validUsers.filter(
            (user) => user.role === 'admin'
          );
          console.log(`Administradores encontrados: ${result.length}`);
          break;
          
        case 'user':
          result = validUsers.filter(
            (user) => user.role === 'user'
          );
          console.log(`Usuários comuns encontrados: ${result.length}`);
          break;
          
        case 'active':
          result = validUsers.filter(
            (user) => user.status === 'active'
          );
          console.log(`Usuários ativos encontrados: ${result.length}`);
          break;
          
        case 'inactive':
          result = validUsers.filter(
            (user) => user.status === 'inactive'
          );
          console.log(`Usuários inativos encontrados: ${result.length}`);
          break;
          
        default: // 'all'
          // Para a tab 'all', mostrar TODOS os usuários válidos sem filtro adicional
          result = [...validUsers];
          console.log(`Mostrando todos os ${result.length} usuários`);
      }
      
      // Log para confirmação
      console.log(`Filtragem concluída com sucesso. Exibindo ${result.length} usuários.`);
      
    } catch (error) {
      console.error('Erro durante a filtragem por tab:', error);
      console.error(error);
      // Em caso de erro, mostrar todos os usuários válidos
      result = validUsers;
    }
    
    // Atualizar o estado com os resultados filtrados
    setFilteredUsers(result);
    
    // Verificar se os filteredUsers foram atualizados corretamente
    setTimeout(() => {
      console.log(`Estado filteredUsers atualizado: ${filteredUsers.length} usuários`);
    }, 0);
  };

  // Formatar data para exibição
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Renderizar badge de plano
  const renderPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Premium</Badge>;
      case 'free':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Gratuito</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  // Renderizar badge de role
  const renderRoleBadge = (role: string | undefined, email: string) => {
    const isAdmin = role === 'admin' || email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    
    if (isAdmin) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Administrador</Badge>;
    }
    
    return <Badge variant="outline" className="bg-gray-100 text-gray-800">Usuário</Badge>;
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários cadastrados na plataforma.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/users/new')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou username..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={fetchUsers}
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

            <Tabs defaultValue="all" onValueChange={(value) => {
              console.log(`Tab selecionada alterada para: ${value}`);
              setSelectedTab(value);
              if (users.length > 0) {
                // Aplicar o filtro quando o tab mudar
                if (searchTerm.trim() === '') {
                  filterByTab(value, users);
                } else {
                  // Aplicar busca + filtro por tab
                  const searchFiltered = users.filter((user) => {
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      (user.email && user.email.toLowerCase().includes(searchLower)) ||
                      (user.name && user.name.toLowerCase().includes(searchLower)) ||
                      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
                      (user.username && user.username.toLowerCase().includes(searchLower)) ||
                      (user.user_id && user.user_id.toLowerCase().includes(searchLower))
                    );
                  });
                  filterByTab(value, searchFiltered);
                }
              }
            }}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
                <TabsTrigger value="all">Todos ({users.length})</TabsTrigger>
                <TabsTrigger value="premium">Premium ({users.filter(u => u.subscription_plan === 'premium').length})</TabsTrigger>
                <TabsTrigger value="free">Gratuitos ({users.filter(u => u.subscription_plan === 'free').length})</TabsTrigger>
                <TabsTrigger value="admin">Administradores ({users.filter(u => u.role === 'admin' || (u.email && process.env.NEXT_PUBLIC_ADMIN_EMAIL?.split(',').includes(u.email))).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {renderUsersTable()}
              </TabsContent>
              <TabsContent value="premium" className="mt-4">
                {renderUsersTable()}
              </TabsContent>
              <TabsContent value="free" className="mt-4">
                {renderUsersTable()}
              </TabsContent>
              <TabsContent value="admin" className="mt-4">
                {renderUsersTable()}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderUsersTable() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando usuários...</span>
        </div>
      );
    }

    // Verificar se há usuários filtrados para exibir
    console.log(`Renderizando tabela com ${filteredUsers.length} usuários filtrados`);
    
    // Verificar se há usuários no estado geral
    console.log(`Total de usuários no estado: ${users.length}`);
    
    // Se não houver usuários filtrados mas houver usuários no estado geral,
    // isso pode indicar um problema na filtragem
    if ((!filteredUsers || filteredUsers.length === 0) && users.length > 0) {
      console.log('Detectado problema: há usuários no estado mas nenhum na lista filtrada');
      // Forçar a exibição de todos os usuários
      setTimeout(() => filterByTab('all', users), 0);
    }
    
    if (!filteredUsers || filteredUsers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm ? 'Tente ajustar os critérios de busca.' : 'Não há usuários nesta categoria.'}
          </p>
          {users.length > 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                console.log('Forçando atualização de todos os usuários...');
                filterByTab('all', users);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Mostrar todos os usuários
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Lista de usuários ({filteredUsers.length})</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead>Último login</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow key={user.id || `user-${index}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name || 'Avatar'} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold">
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.name || user.full_name || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.username ? `@${user.username}` : 'Sem username'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email || 'Sem email'}</span>
                  </div>
                </TableCell>
                <TableCell>{renderPlanBadge(user.subscription_plan)}</TableCell>
                <TableCell>{renderRoleBadge(user.role, user.email)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/users/${user.user_id || user.id}`)}
                  >
                    Ver detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
