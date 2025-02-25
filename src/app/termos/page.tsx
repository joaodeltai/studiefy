'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Footer from "@/components/global/Footer";

export default function TermsOfUse() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-background py-2 px-4 flex mt-2 items-center">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:text-primary transition-colors">
            Studiefy
            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-[length:200%_100%] animate-shimmer rounded-full font-medium text-background">
              Beta
            </span>
          </Link>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => router.push('/dashboard')} 
                className="bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors">
                Meu Progresso
              </Button>
            ) : (
              <div className="flex gap-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="hover:text-primary transition-colors">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors">
                    Registrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold mb-8 text-[#444444]">Termos de Uso</h2>
        
        <div className="space-y-6 text-[#444444]">
          <p>
            Ao acessar ao site Studiefy, concorda em cumprir estes termos de uso, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">1. Licença de Uso</h3>
          <p>
            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Studiefy, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>modificar ou copiar os materiais;</li>
            <li>usar os materiais para qualquer finalidade comercial ou para exibição pública;</li>
            <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Studiefy;</li>
            <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais;</li>
            <li>transferir os materiais para outra pessoa ou 'espelhar' os materiais em qualquer outro servidor.</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-8 mb-4">2. Isenção de responsabilidade</h3>
          <p>
            Os materiais no site da Studiefy são fornecidos 'como estão'. Não oferecemos garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">3. Limitações</h3>
          <p>
            Em nenhum caso o Studiefy ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Studiefy, mesmo que Studiefy ou um representante autorizado da Studiefy tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">4. Precisão dos materiais</h3>
          <p>
            Os materiais exibidos no site da Studiefy podem incluir erros técnicos, tipográficos ou fotográficos. Não garantimos que qualquer material em seu site seja preciso, completo ou atual. A Studiefy pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">5. Links</h3>
          <p>
            O Studiefy não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por Studiefy do site. O uso de qualquer site vinculado é por conta e risco do usuário.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">6. Modificações</h3>
          <p>
            O Studiefy pode revisar estes termos de uso do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de uso.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">7. Lei aplicável</h3>
          <p>
            Estes termos e condições são regidos e interpretados de acordo com as leis do Brasil e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
          </p>

          <p className="mt-8">
            Esta política é efetiva a partir de Fevereiro de 2025.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
