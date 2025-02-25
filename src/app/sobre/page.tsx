'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from "framer-motion";
import Footer from "@/components/global/Footer";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-background py-2 px-4 mb-0 flex mt-2 items-center">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:text-primary transition-colors">
            Studiefy
            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-[length:200%_100%] animate-shimmer rounded-full font-medium text-background">
              Beta
            </span>
          </Link>

          {/* Links */}
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="ghost" className="hover:text-primary transition-colors">Página Inicial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Sobre Nós
          </h1>
          
          <div className="prose prose-lg mx-auto text-gray-700 space-y-6">
            <p>
              A Studiefy nasceu da paixão por transformar a educação médica através da tecnologia. 
              Somos uma plataforma inovadora dedicada a auxiliar estudantes de medicina em sua jornada 
              acadêmica, oferecendo recursos personalizados e eficientes para o aprendizado.
            </p>
            
            <p>
              Nossa missão é democratizar o acesso ao conhecimento médico de qualidade, 
              fornecendo ferramentas inteligentes que se adaptam ao ritmo e estilo de 
              aprendizado de cada estudante. Acreditamos que a educação médica pode ser 
              mais eficiente, envolvente e acessível.
            </p>

            <p>
              Com uma equipe apaixonada por educação e tecnologia, estamos constantemente 
              inovando e desenvolvendo novas funcionalidades para tornar seu estudo mais 
              produtivo e eficaz. Na Studiefy, não apenas oferecemos conteúdo, mas 
              construímos o futuro da educação médica.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
