import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Settings, Users, CreditCard, BarChart } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Studiefy - Administração',
  description: 'Painel administrativo do Studiefy',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 items-start flex">
          <aside className="sticky top-0 h-screen w-56 border-r bg-muted/40 hidden md:block">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <div className="flex flex-col gap-4">
                <div className="px-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="flex items-center gap-2 mb-6">
                      <ChevronLeft className="h-4 w-4" />
                      Voltar ao app
                    </Button>
                  </Link>
                  <h2 className="text-lg font-semibold tracking-tight mb-1">Administração</h2>
                  <p className="text-sm text-muted-foreground">Gerencie o Studiefy</p>
                </div>
                <nav className="grid gap-2 px-2">
                  <Link href="/admin/subscriptions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-accent">
                    <CreditCard className="h-4 w-4" />
                    <span>Assinaturas</span>
                  </Link>
                  <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-accent">
                    <Users className="h-4 w-4" />
                    <span>Usuários</span>
                  </Link>
                  <Link href="/admin/analytics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-accent">
                    <BarChart className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                  <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-accent">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </nav>
              </div>
            </ScrollArea>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
