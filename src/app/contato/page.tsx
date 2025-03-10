'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/global/Footer";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Contact() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header - Same as main page */}
      <header className="bg-background py-4 px-4 border-b border-foreground/10 mb-0">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:text-primary transition-colors">
            <Image 
              src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//logo_sfy_transp.webp"
              alt="Studiefy Logo"
              width={32}
              height={32}
              className="w-8 h-8"
              unoptimized
            />
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

      {/* Contact Section */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Entre em Contato
              </h1>
              <p className="text-xl mt-2 text-muted-foreground">
                Estamos aqui para responder suas dúvidas
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Telefone</h3>
                  <p className="text-muted-foreground">+91-101202303</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">support@studiefy.com</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Feedback e Sugestões</h3>
              <p className="text-muted-foreground">
                Valorizamos seu feedback importante e estamos trabalhando continuamente para melhorar nossos serviços e ajudá-lo melhor.
              </p>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Fale Conosco</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input
                    id="firstName"
                    placeholder="Seu nome"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Sobrenome
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Seu sobrenome"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  placeholder="Sua mensagem..."
                  className="w-full min-h-[120px]"
                />
              </div>

              <Button type="submit" className="w-full">
                Enviar
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
