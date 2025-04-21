"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Loader2, CreditCard, Users, BarChart, Settings } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const [isAuthorized, setIsAuthorized] = useState(false);

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
        setIsAuthorized(true);
      }
    }
  }, [profile, profileLoading]);

  if (profileLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao painel administrativo do Studiefy. Aqui você pode gerenciar assinaturas, usuários e configurações do sistema.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/subscriptions" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gerencie assinaturas de usuários, sincronize com o Stripe e verifique status de pagamentos.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-start">Gerenciar assinaturas</Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/admin/users" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize e gerencie contas de usuários, perfis e informações de acesso.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-start">Gerenciar usuários</Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/admin/analytics" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize estatísticas de uso, conversões e métricas importantes do aplicativo.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-start">Ver analytics</Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/admin/settings" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Configure parâmetros do sistema, preços de assinaturas e opções gerais.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-start">Editar configurações</Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  );
}
