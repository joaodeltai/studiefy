'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//logo_sfy_transp.webp"
                alt="Studiefy Logo"
                width={32}
                height={32}
                className="w-8 h-8"
                unoptimized
              />
              <span className="text-xl font-bold">Studiefy</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Sua plataforma completa de restreamento de estudos. 
              Transformando a maneira como você se prepara para seu futuro.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/planos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/questoes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Banco de Questões
                </Link>
              </li>
              <li>
                <Link href="/materiais" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Materiais de Estudo
                </Link>
              </li>
              <li>
                <Link href="/simulados" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Simulados
                </Link>
              </li>
              <li>
                <Link href="/mentoria" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mentoria
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato e Redes Sociais */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Email: contato@studiefy.pro
              </p>
              <p className="text-sm text-muted-foreground">
                WhatsApp: (51) 99124-8817
              </p>
              <div className="flex space-x-4 mt-4">
                <Link href="https://instagram.com/estudeassimm" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </Link>
                <Link href="https://facebook.com/studiefy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </Link>
                <Link href="https://linkedin.com/company/studiefy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Studiefy. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <p className="text-sm text-muted-foreground">
              Feito com ❤️ em Porto Alegre - RS
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
