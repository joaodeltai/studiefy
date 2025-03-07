"use client"

import { Info, MessageSquare } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FeedbackPage() {
  const whatsappNumber = "+5551991248817"
  const whatsappMessage = encodeURIComponent("Olá! Estou usando o Studiefy e gostaria de dar um feedback/solicitar suporte.")
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="h-full p-4">
      {/* Header */}
      <div className="flex items-center mb-6 md:pl-12">
        <h1 className="text-2xl font-bold">Feedback e Suporte</h1>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto">
        <Card className="border border-studiefy-black/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-studiefy-primary" />
              Como podemos te ajudar?
            </CardTitle>
            <CardDescription>
              Estamos sempre buscando melhorar o Studiefy para você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Sua opinião é muito importante para nós! Se você encontrou algum problema, 
                tem sugestões de melhorias ou precisa de ajuda para utilizar o Studiefy, 
                entre em contato conosco.
              </p>
              <p>
                Nossa equipe está pronta para te atender e garantir que você tenha a melhor 
                experiência possível com nossa plataforma.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Falar pelo WhatsApp
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
