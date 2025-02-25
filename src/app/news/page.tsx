'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Footer from "@/components/global/Footer";

export default function Newsletter() {
  const [email, setEmail] = React.useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Redirecionando para a página principal do Substack
    window.location.href = 'https://studiefy.substack.com';
  };

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

      {/* Hero Section */}
      <main className="flex-1 flex items-center relative py-16">
        <div className="container mx-auto px-4 flex flex-col items-center gap-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
            Conquiste sua vaga em medicina com um estudo organizado e eficiente
          </h1>

          <h2 className="text-xl md:text-2xl text-foreground/70 max-w-2xl">
            Chega de planilhas confusas. Tenha total clareza do seu progresso e saiba exatamente o que estudar.
          </h2>

          {/* Newsletter signup */}
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <div className="flex w-full items-center space-x-2">
              <Input 
                type="email" 
                placeholder="Seu melhor email"
                className="bg-background border-foreground/20 focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={handleSubscribe}
                className="bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors"
              >
                Inscrever-se
              </Button>
            </div>
            <p className="text-sm font-light text-foreground/70 w-full">
              Joga teu e-mail aqui e ganha técnicas de estudo grátis toda semana. Mais fácil que acertar uma questão de marcar!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
