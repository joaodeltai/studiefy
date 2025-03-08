'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Mouse, Stethoscope, Info } from 'lucide-react'
import Image from 'next/image'
import { interpolate } from "flubber"
import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion"
import VacancyBanner from "@/components/VacancyBanner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"
import { Flame, Timer, BookCheck, LineChart, LayoutGrid, Target, BookOpen, Brain, Cog } from 'lucide-react'
import Footer from "@/components/global/Footer";
import { FAQ } from "@/components/FAQ";

const paths = [
  "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z", // Check
  "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z", // X
  "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" // Pencil
]

const colors = [
  "#22c55e", // Verde para Check
  "#ef4444", // Vermelho para X
  "#000000"  // Preto para Lápis
]

function useFlubber(progress: MotionValue<number>, paths: string[]) {
  return useTransform(progress, paths.map((_, i) => i), paths, {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 0.1 }),
  })
}

const IconMorphing = () => {
  const [pathIndex, setPathIndex] = React.useState(0)
  const progress = useMotionValue(pathIndex)
  
  // Duplicamos o primeiro path no final para criar um loop suave
  const allPaths = [...paths, paths[0]]
  const allColors = [...colors, colors[0]]
  
  const fill = useTransform(progress, allPaths.map((_, i) => i), allColors)
  const path = useFlubber(progress, allPaths)

  React.useEffect(() => {
    const animation = animate(progress, pathIndex, {
      duration: 1.2,
      ease: "easeInOut",
      onComplete: () => {
        if (pathIndex === paths.length) {
          // Quando chegar no último (que é a cópia do primeiro),
          // volta instantaneamente para o primeiro sem animação
          progress.set(0)
          setPathIndex(0)
        } else {
          setPathIndex(pathIndex + 1)
        }
      },
    })

    return () => animation.stop()
  }, [pathIndex, progress])

  return (
    <div className="w-6 h-6">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <motion.path fill={fill} d={path} />
      </svg>
    </div>
  )
}

const GearAnimation = () => {
  return (
    <div className="relative w-10 h-10">
      <motion.div
        className="absolute"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <Cog className="w-7 h-7 text-foreground" />
      </motion.div>
      <motion.div
        className="absolute left-3 top-3"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <Cog className="w-5 h-5 text-foreground" />
      </motion.div>
    </div>
  )
}

const CountdownTimer = () => {
  const [time, setTime] = React.useState(1500) // 25 minutos em segundos

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) return 1500
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  return (
    <motion.div 
      className="bg-foreground/5 rounded-lg px-3 py-1.5 font-mono text-sm"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        opacity: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
        }
      }}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </motion.div>
  )
}

const AnimatedFlame = () => {
  return (
    <div className="w-14 h-14 relative">
      <motion.svg
        viewBox="0 0 24 24"
        className="w-full h-full"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Base da chama */}
        <motion.path
          d="M12 2c0 0-3 4-3 8c0 2.5 1.5 4 3 4c1.5 0 3-1.5 3-4c0-4-3-8-3-8z"
          fill="#ff6b00"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Centro da chama */}
        <motion.path
          d="M12 3c0 0-2 3-2 6c0 2 1 3 2 3c1 0 2-1 2-3c0-3-2-6-2-6z"
          fill="#ff9500"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        />
        
        {/* Núcleo da chama */}
        <motion.path
          d="M12 4c0 0-1 2-1 4c0 1.5 0.5 2 1 2c0.5 0 1-0.5 1-2c0-2-1-4-1-4z"
          fill="#ffcc00"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -1.5, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        />

        {/* Efeito de brilho */}
        <motion.circle
          cx="12"
          cy="8"
          r="3"
          fill="#fff"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: "blur(2px)" }}
        />
      </motion.svg>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <VacancyBanner />
      
      {/* Header */}
      <header className="bg-background py-4 px-4 border-b border-foreground/10 mb-0 mt-8">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:text-primary transition-colors">
            <Image 
              src="/images/logo_sfy_transp.webp"
              alt="Studiefy Logo"
              width={32}
              height={32}
              className="w-8 h-8"
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

      {/* Hero Section */}
      <main className="flex-1 flex items-center relative py-16">
        {/* Estetoscópio flutuante */}
        <div className="absolute left-[10%] top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="animate-float">
            <Stethoscope className="w-28 h-28 text-foreground opacity-25" />
          </div>
        </div>

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
              />
              <Button 
                type="submit"
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

      {/* Scroll indicator */}
      <div className="w-full flex justify-center my-12">
        <div className="animate-bounce">
          <Mouse className="w-8 h-8 text-foreground/50 hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Section 2 */}
      <section className="flex items-start justify-center bg-background text-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-x-16">
            {/* Coluna da esquerda */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
                Chega de perder seu tempo precioso com planilhas e cadernos.
              </p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Organize seus estudos para medicina com total clareza do seu progresso
              </h2>
            </div>

            {/* Coluna da direita */}
            <div className="flex flex-col justify-between h-full mt-8 md:mt-0">
              <p className="text-xl text-foreground/70">
                O único App que transforma cada minuto de estudo em dados precisos de progresso
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="w-full bg-foreground text-background hover:bg-primary hover:text-foreground transition-colors mt-8">
                  COMECE AGORA GRATUITAMENTE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <div className="w-full bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-8 md:gap-32 items-center">
              {/* Desktop Tooltip */}
              <div className="hidden md:block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="group">
                      <div className="text-center relative">
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-4xl md:text-6xl font-bold text-[#282828]">
                            <span className="text-[#9046cf]">-</span>87%
                          </p>
                          <Info className="w-4 h-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
                        </div>
                        <p className="text-base md:text-lg text-foreground/70 mt-2 w-full">
                          de ansiedade
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">87% dos usuários relataram menos ansiedade com os estudos após uma semana de uso.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Mobile Dialog */}
              <div className="md:hidden">
                <Dialog>
                  <DialogTrigger className="group">
                    <div className="text-center relative">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-4xl md:text-6xl font-bold text-[#282828]">
                          <span className="text-[#9046cf]">-</span>87%
                        </p>
                        <Info className="w-4 h-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
                      </div>
                      <p className="text-base md:text-lg text-foreground/70 mt-2 w-full">
                        de ansiedade
                      </p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className={cn(
                    "bg-[#c8ff29] text-[#282828] p-3 rounded-lg",
                    "w-auto max-w-[200px] mx-auto",
                    "border-none shadow-none",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                    "data-[state=open]:slide-in-from-bottom-2"
                  )}>
                    <DialogTitle>
                      <VisuallyHidden>Informação sobre redução de ansiedade</VisuallyHidden>
                    </DialogTitle>
                    <p className="text-sm">87% dos usuários relataram menos ansiedade com os estudos após uma semana de uso.</p>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Desktop Tooltip */}
              <div className="hidden md:block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="group">
                      <div className="text-center relative">
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-4xl md:text-6xl font-bold text-[#282828]">
                            <span className="text-[#9046cf]">+</span>40 pts
                          </p>
                          <Info className="w-4 h-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
                        </div>
                        <p className="text-base md:text-lg text-foreground/70 mt-2 w-full">
                          nos simulados
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">+40 pontos na nota em simulados após 1 mês com o Studiefy.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Mobile Dialog */}
              <div className="md:hidden">
                <Dialog>
                  <DialogTrigger className="group">
                    <div className="text-center relative">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-4xl md:text-6xl font-bold text-[#282828]">
                          <span className="text-[#9046cf]">+</span>40 pts
                        </p>
                        <Info className="w-4 h-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
                      </div>
                      <p className="text-base md:text-lg text-foreground/70 mt-2 w-full">
                        nos simulados
                      </p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className={cn(
                    "bg-[#c8ff29] text-[#282828] p-3 rounded-lg",
                    "w-auto max-w-[200px] mx-auto",
                    "border-none shadow-none",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                    "data-[state=open]:slide-in-from-bottom-2"
                  )}>
                    <DialogTitle>
                      <VisuallyHidden>Informação sobre melhoria nas notas</VisuallyHidden>
                    </DialogTitle>
                    <p className="text-sm">+40 pontos na nota em simulados após 1 mês com o Studiefy.</p>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <p className="text-xs text-foreground/40 mt-4 md:hidden">
              Toque nos números para mais informações
            </p>
            <p className="text-xs text-foreground/40 mt-4 hidden md:block">
              Passe o mouse sobre os números para mais informações
            </p>
          </div>
        </div>
      </div>

      {/* Barra de texto rolante */}
      <div className="w-full bg-foreground py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-scroll">
          <span className="inline-flex items-center text-xl text-background">
            APROVAÇÃO <span className="text-purple mx-4">✦</span> 
            ORGANIZAÇÃO <span className="text-purple mx-4">✦</span> 
            MEDICINA <span className="text-purple mx-4">✦</span> 
            CONTROLE <span className="text-purple mx-4">✦</span> 
            EFICIÊNCIA <span className="text-purple mx-4">✦</span> 
            MEDICINA <span className="text-purple mx-4">✦</span> 
            PROGRESSO <span className="text-purple mx-4">✦</span> 
            RESULTADO <span className="text-purple mx-4">✦</span> 
            MEDICINA <span className="text-purple mx-4">✦</span>
          </span>
          {/* Duplicar o texto para criar efeito de scroll contínuo */}
          <span className="inline-flex items-center text-xl text-background ml-4">
            APROVAÇÃO <span className="text-purple mx-4">✦</span> 
            ORGANIZAÇÃO <span className="text-purple mx-4">✦</span> 
            MEDICINA <span className="text-purple mx-4">✦</span> 
            CONTROLE <span className="text-purple mx-4">✦</span> 
            EFICIÊNCIA <span className="text-purple mx-4">✦</span> 
            MEDICINA <span className="text-purple mx-4">✦</span> 
            PROGRESSO <span className="text-purple mx-4">✦</span> 
            RESULTADO <span className="text-purple mx-4">✦</span> 
            MEDICINA <span className="text-purple mx-4">✦</span>
          </span>
        </div>
      </div>

      {/* Paradoxo da Produtividade */}
      <div className="container mx-auto px-4 py-16">
        <div className="relative flex flex-col md:grid md:grid-cols-2 md:gap-8 md:items-center">
          {/* Lado esquerdo - Texto explicativo */}
          <div className="text-foreground space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Você sabe o que é o Paradoxo da Produtividade?
            </h3>
            <div className="space-y-4 text-foreground/80">
              <p>
                Não? vou te explicar... sabe aquela sensação de estudar o dia inteiro, mas ainda assim não ter certeza se está progredindo, certo?
              </p>
              <p>
                Não é sua culpa...
              </p>
              <p>
                O problema real é que quanto mais você tenta se organizar usando planilhas, cadernos e apps diversos, menos tempo sobra para realmente estudar.
              </p>
              <p>
                É como tentar esvaziar um barco usando um balde furado. Você se esforça muito, mas os resultados não aparecem.
              </p>
              <p>
                Veja só:
              </p>
            </div>
          </div>

          {/* Lado direito - Lista de problemas */}
          <div className="relative md:flex md:items-center mt-8 md:mt-0">
            <div className="bg-dark-gray rounded-3xl w-full p-8 md:p-12">
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-[2rem] h-[2rem] shrink-0 rounded-full bg-background/10 flex items-center justify-center text-sm text-background transition-colors group-hover:bg-primary group-hover:text-foreground">
                    1
                  </div>
                  <p className="text-lg md:text-xl text-background transition-colors group-hover:text-primary">
                    Você perde horas atualizando planilhas
                  </p>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-[2rem] h-[2rem] shrink-0 rounded-full bg-background/10 flex items-center justify-center text-sm text-background transition-colors group-hover:bg-primary group-hover:text-foreground">
                    2
                  </div>
                  <p className="text-lg md:text-xl text-background transition-colors group-hover:text-primary">
                    Nunca sabe exatamente seus pontos fracos
                  </p>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-[2rem] h-[2rem] shrink-0 rounded-full bg-background/10 flex items-center justify-center text-sm text-background transition-colors group-hover:bg-primary group-hover:text-foreground">
                    3
                  </div>
                  <p className="text-lg md:text-xl text-background transition-colors group-hover:text-primary">
                    A ansiedade aumenta a cada dia
                  </p>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-[2rem] h-[2rem] shrink-0 rounded-full bg-background/10 flex items-center justify-center text-sm text-background transition-colors group-hover:bg-primary group-hover:text-foreground">
                    4
                  </div>
                  <p className="text-lg md:text-xl text-background transition-colors group-hover:text-primary">
                    O tempo precioso escorre entre os dedos
                  </p>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-[2rem] h-[2rem] shrink-0 rounded-full bg-background/10 flex items-center justify-center text-sm text-background transition-colors group-hover:bg-primary group-hover:text-foreground">
                    5
                  </div>
                  <p className="text-lg md:text-xl text-background transition-colors group-hover:text-primary">
                    A aprovação parece cada vez mais distante
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Texto de transição */}
      <div className="container mx-auto px-4 text-center">
        <p className="text-[#282828] text-lg md:text-2xl">
          Então criamos o...
        </p>
      </div>

      {/* Seção 3 - Versão Alternativa */}
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-start gap-4 md:gap-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold space-y-2 md:space-y-4">
              <div>Algoritmo</div>
              <div className="inline-block bg-foreground rounded-2xl px-4 py-1.5">
                <span className="text-primary">Tempo</span>
                <span className="text-[#f5f3f5]">-</span>
                <span className="text-[#9046cf]">Força</span>
              </div>
            </h2>

            {/* Elemento decorativo com imagem */}
            <div className="flex-1 h-[90px] md:h-[140px] rounded-3xl md:rounded-full overflow-hidden bg-foreground relative">
              <Image
                src="/images/3d-rendering-abstract-black-white-waves.jpg"
                alt="Abstract waves background"
                fill
                className="object-cover opacity-50"
              />
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex items-center justify-center w-full h-full text-background"
              >
                <p className="text-sm md:text-xl text-center px-4 md:px-6 font-light max-w-2xl mx-auto">
                  Que transforma cada minuto do seu estudo em dados precisos de progresso
                </p>
              </motion.div>
            </div>
          </div>
          {/* Texto para mobile */}
          <p className="md:hidden text-xl text-foreground/70 text-center mt-6">
          Que transforma cada minuto do seu estudo em dados precisos de progresso
          </p>
        </div>

        {/* Grade de Recursos */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 - Cálculo em Tempo Real */}
          <div className="bg-background border-2 border-foreground/10 rounded-3xl p-8 hover:border-[#9046cf] transition-colors group">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Cálculo em Tempo Real</h3>
            <p className="text-foreground/70">
              Cada minuto de estudo é automaticamente convertido em pontos de força específicos para cada matéria.
            </p>
          </div>

          {/* Card 2 - Mapa de Progresso */}
          <div className="bg-background border-2 border-foreground/10 rounded-3xl p-8 hover:border-[#9046cf] transition-colors group">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Mapa de Progresso</h3>
            <p className="text-foreground/70">
              Visualize exatamente onde você está forte ou fraco, com dados precisos do seu desempenho real.
            </p>
          </div>

          {/* Card 3 - Sistema Inteligente */}
          <div className="bg-background border-2 border-foreground/10 rounded-3xl p-8 hover:border-[#9046cf] transition-colors group">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <IconMorphing />
            </div>
            <h3 className="text-2xl font-bold mb-4">Sistema Inteligente</h3>
            <p className="text-foreground/70">
              O sistema trabalha constantemente analisando seus dados enquanto você foca no que importa: estudar.
            </p>
          </div>
        </div>

        {/* Seção de Benefícios */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {/* Coluna da Esquerda - Professor Particular */}
          <div className="bg-dark-gray rounded-3xl p-8 md:p-10 text-background relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h3 className="text-2xl font-bold">Seu Professor Particular Digital</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p>Pontos Fortes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p>Tempo Dedicado</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p>Áreas de Melhoria</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p>Progresso Diário</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Elemento decorativo animado */}
            <div className="absolute bottom-0 left-0 w-full h-40 opacity-10">
              <motion.div
                className="absolute bottom-0 left-0 w-full"
                initial={{ y: 0 }}
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <svg viewBox="0 0 1440 320" className="w-full">
                  <path
                    fill="currentColor"
                    d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  ></path>
                </svg>
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-0 w-full"
                initial={{ y: 0 }}
                animate={{ 
                  y: [0, -15, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <svg viewBox="0 0 1440 320" className="w-full">
                  <path
                    fill="currentColor"
                    d="M0,96L48,128C96,160,192,224,288,213.3C384,203,480,117,576,117.3C672,117,768,203,864,224C960,245,1056,203,1152,186.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  ></path>
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Coluna da Direita - Clareza nos Estudos */}
          <div className="bg-foreground rounded-3xl p-8 md:p-10 text-background relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6">
                Acorde Sabendo Exatamente:
              </h3>
              <div className="space-y-4">
                <div className="bg-background/5 p-4 rounded-xl flex items-center gap-4 hover:bg-primary/20 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    📚
                  </div>
                  <p>O que estudar</p>
                </div>
                <div className="bg-background/5 p-4 rounded-xl flex items-center gap-4 hover:bg-primary/20 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    ⏱️
                  </div>
                  <p>Por quanto tempo</p>
                </div>
                <div className="bg-background/5 p-4 rounded-xl flex items-center gap-4 hover:bg-primary/20 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    🎯
                  </div>
                  <p>Onde focar sua energia</p>
                </div>
                <div className="bg-background/5 p-4 rounded-xl flex items-center gap-4 hover:bg-primary/20 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    📈
                  </div>
                  <p>Como está progredindo</p>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Footer com Call-to-Action */}
        <div className="text-center mt-12">
          <p className="text-xl text-foreground/70 mb-2">
            Mantenha sua motivação alta com nosso sistema de níveis e ofensivas
          </p>
          <div className="inline-flex items-center">
            <Link href="/auth/register">
              <span className="bg-[#282828] text-white px-4 py-2 rounded-xl inline-flex items-center gap-2">
                Comece agora
                <span className="text-2xl text-primary">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Seção 4 - Para quem é o aplicativo */}
      <div className="mt-8 overflow-hidden">
        {/* Título da seção com destaque */}
        <div className="relative px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center relative flex flex-wrap justify-center items-center gap-3">
            <span>Pra ti que é...</span>
          </h2>
        </div>

        {/* Grid de cards com layout alternativo */}
        <div className="container mx-auto px-4">
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 - Vestibulandos */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-primary rounded-3xl transition-all group-hover:blur-[20px] md:group-hover:blur-xl opacity-20" />
              <div className="bg-dark-gray rounded-3xl p-6 relative">
                <div className="bg-background/10 rounded-2xl p-4 mb-6 flex items-center gap-4">
                  <span className="text-3xl">👨‍⚕️</span>
                  <h3 className="text-lg font-semibold text-background">Vestibulandos de Medicina</h3>
                </div>
                <p className="text-sm text-background/80">
                  Prepare-se para o vestibular de medicina com um método personalizado e eficiente.
                  Acompanhamento individual e materiais específicos para sua aprovação.
                </p>
              </div>
            </motion.div>

            {/* Card 2 - Alunos de Cursinho */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-primary rounded-3xl transition-all group-hover:blur-[20px] md:group-hover:blur-xl opacity-20" />
              <div className="bg-dark-gray rounded-3xl p-6 relative">
                <div className="bg-background/10 rounded-2xl p-4 mb-6 flex items-center gap-4">
                  <span className="text-3xl">📚</span>
                  <h3 className="text-lg font-semibold text-background">Alunos de Cursinho</h3>
                </div>
                <p className="text-sm text-background/80">
                  Potencialize seus estudos no cursinho com nossa plataforma.
                  Recursos complementares e suporte para maximizar seu aprendizado.
                </p>
              </div>
            </motion.div>

            {/* Card 3 - Estudantes do Terceiro Ano */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-primary rounded-3xl transition-all group-hover:blur-[20px] md:group-hover:blur-xl opacity-20" />
              <div className="bg-dark-gray rounded-3xl p-6 relative">
                <div className="bg-background/10 rounded-2xl p-4 mb-6 flex items-center gap-4">
                  <span className="text-3xl">🎓</span>
                  <h3 className="text-lg font-semibold text-background">Estudantes do Terceiro Ano</h3>
                </div>
                <p className="text-sm text-background/80">
                  Prepare-se para o ENEM e vestibulares desde o ensino médio.
                  Construa uma base sólida para seu futuro acadêmico.
                </p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.3 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-primary rounded-3xl transition-all group-hover:blur-[20px] md:group-hover:blur-xl opacity-20" />
              <div className="bg-dark-gray rounded-3xl p-6 relative">
                <div className="bg-background/10 rounded-2xl p-4 mb-6 flex items-center gap-4">
                  <span className="text-3xl">👨‍👧</span>
                  <h3 className="text-lg font-semibold text-background">Pais Preocupados</h3>
                </div>
                <p className="text-sm text-background/80">
                  Acompanhe o progresso do seu filho de perto.
                  Relatórios detalhados e orientações para apoiar a jornada acadêmica.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Section 5 - Como Funciona */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-2">É mais simples do que tu imagina, vê só:</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-background border border-foreground/10 rounded-xl p-6 hover:border-[#9046cf] transition-colors"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="bg-[#282828] p-2 rounded-lg">
                  <LayoutGrid className="w-6 h-6 text-primary" />
                </div>
                <GearAnimation />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Configure em 10 minutos</h3>
              <ul className="space-y-2 text-foreground/70">
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Organize suas matérias</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Defina suas metas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Comece a usar imediatamente</span>
                </li>
              </ul>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-background border border-foreground/10 rounded-xl p-6 hover:border-[#9046cf] transition-colors"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="bg-[#282828] p-2 rounded-lg">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <CountdownTimer />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Estude com o Timer Inteligente</h3>
              <ul className="space-y-2 text-foreground/70">
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Registre o tempo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Acompanha cada matéria estudada</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Identifica seus pontos fortes e fracos</span>
                </li>
              </ul>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-background border border-foreground/10 rounded-xl p-6 hover:border-[#9046cf] transition-colors"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="bg-[#282828] p-2 rounded-lg">
                  <BookCheck className="w-6 h-6 text-primary" />
                </div>
                <IconMorphing />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Registre</h3>
              <ul className="space-y-2 text-foreground/70">
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Preencha suas notas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Faça seu caderno de erros</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Faça revisões inteligentes</span>
                </li>
              </ul>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-background border border-foreground/10 rounded-xl p-6 hover:border-[#9046cf] transition-colors"
            >
              <div className="mb-4 flex items-center justify-between w-full">
                <div className="bg-[#282828] p-2 rounded-lg">
                  <LineChart className="w-6 h-6 text-primary" />
                </div>
                <div className="flex justify-end w-full">
                  <AnimatedFlame />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">4. Veja Seu Progresso Real</h3>
              <ul className="space-y-2 text-foreground/70">
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Dashboard atualizado em tempo real</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Relatórios claros de evolução</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#282828]">✦</span>
                  <span>Recomendações personalizadas de estudo</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seção 6 - Beta Tester */}
      <div className="w-full bg-[#282828] py-16">
        <div className="container mx-auto px-4">
          <div className="w-full bg-[#f5f5f5] rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src="/images/creative-background-with-white-lines.jpg"
                alt="Creative background"
                fill
                className="object-cover opacity-50"
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="w-full lg:w-[45%]">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 uppercase text-left">
                  Comece agora como Beta Tester
                </h2>

                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center gap-2 text-lg md:text-xl">
                    <span className="text-2xl">✦</span>
                    <span>Apenas 220 vagas</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg md:text-xl">
                    <span className="text-2xl">✦</span>
                    <span>Acesso vitalício gratuito</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg md:text-xl font-bold bg-black/10 p-4 rounded-xl">
                    <span className="text-2xl">✦</span>
                    <span>Um SUPER BÔNUS: Todas as provas da UFRGS organizadas por assunto para você estudar</span>
                  </div>
                </div>

                <Link href="/auth/register">
                  <Button
                    className="w-full sm:w-auto bg-[#282828] hover:bg-[#383838] text-white font-bold py-4 sm:py-6 px-4 sm:px-8 rounded-xl text-sm sm:text-base md:text-lg whitespace-normal sm:whitespace-nowrap"
                  >
                    COMEÇAR AGORA GRATUITAMENTE
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FAQ />
      <Footer />
    </div>
  )
}
