"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const BadgeSection = () => {
  return (
    <AccordionItem value="badge">
      <AccordionTrigger className="text-xl font-medium">Emblemas (Badges)</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Variantes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Badge variant="default">Default</Badge>
                <span className="text-sm text-muted-foreground">Default</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge variant="secondary">Secondary</Badge>
                <span className="text-sm text-muted-foreground">Secondary</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge variant="destructive">Destructive</Badge>
                <span className="text-sm text-muted-foreground">Destructive</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge variant="outline">Outline</Badge>
                <span className="text-sm text-muted-foreground">Outline</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge variant="success">Success</Badge>
                <span className="text-sm text-muted-foreground">Success</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Cores personalizadas</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Matemática</Badge>
                <span className="text-sm text-muted-foreground">Azul</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Física</Badge>
                <span className="text-sm text-muted-foreground">Roxo</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Biologia</Badge>
                <span className="text-sm text-muted-foreground">Verde</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Química</Badge>
                <span className="text-sm text-muted-foreground">Vermelho</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">História</Badge>
                <span className="text-sm text-muted-foreground">Amarelo</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Geografia</Badge>
                <span className="text-sm text-muted-foreground">Laranja</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Contextos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use badges para indicar status de elementos ou processos.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">Concluído</Badge>
                    <Badge variant="secondary">Em progresso</Badge>
                    <Badge variant="destructive">Atrasado</Badge>
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Categorias</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use badges para categorizar conteúdos ou itens.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Matemática</Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Física</Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Biologia</Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Notificações</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use badges para indicar contadores ou notificações.
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Button variant="outline" size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                      </Button>
                      <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] text-center">3</Badge>
                    </div>
                    
                    <div className="relative">
                      <Button variant="outline" size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </Button>
                      <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] text-center">12</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use badges de forma consistente para o mesmo tipo de informação em todo o aplicativo.</li>
              <li>Mantenha o texto dos badges curto e direto, preferencialmente com 1-2 palavras.</li>
              <li>Use cores para reforçar o significado (verde para sucesso, vermelho para erro, etc.).</li>
              <li>Evite usar muitos badges próximos uns dos outros para não sobrecarregar a interface.</li>
              <li>Considere usar o variant <code>outline</code> para badges menos importantes ou em fundos coloridos.</li>
              <li>Para contadores, use badges pequenos e posicione-os no canto superior direito do elemento.</li>
              <li>Mantenha a consistência de cores para categorias específicas em todo o aplicativo.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default BadgeSection
