"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const AvatarSection = () => {
  return (
    <AccordionItem value="avatar">
      <AccordionTrigger className="text-xl font-medium">Avatar</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Tamanhos</h3>
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar pequeno" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Pequeno (32px)</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar médio" />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Médio (40px)</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar grande" />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Grande (48px)</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar extra grande" />
                  <AvatarFallback>XG</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Extra Grande (64px)</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Fallbacks</h3>
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Iniciais</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Cor primária</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-secondary text-secondary-foreground">JD</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Cor secundária</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Contextos de uso</h3>
            <div className="grid grid-cols-3 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Perfil do usuário</h4>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar do usuário" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">João Silva</p>
                    <p className="text-sm text-muted-foreground">joao@email.com</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Use o avatar junto com o nome do usuário e email para identificação em menus de perfil.
                </p>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Comentários</h4>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar do comentário" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">João Silva</p>
                    <p className="text-sm text-muted-foreground">Ótimo conteúdo! Isso me ajudou muito nos estudos.</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Use o avatar de tamanho pequeno para comentários e interações sociais.
                </p>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Lista de usuários</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar de lista" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">João Silva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar de lista" />
                      <AvatarFallback>MC</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Maria Costa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar de lista" />
                      <AvatarFallback>PL</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Pedro Lima</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Use avatares extra pequenos (24px) para listas densas de usuários.
                </p>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use o tamanho padrão (40px) para a maioria dos casos de uso.</li>
              <li>Utilize avatares menores (32px ou 24px) para listas, comentários ou áreas com espaço limitado.</li>
              <li>Use avatares maiores (48px ou 64px) para perfis ou áreas de destaque.</li>
              <li>Sempre forneça um fallback com iniciais ou ícone para casos em que a imagem não carrega.</li>
              <li>Mantenha a consistência no uso de cores para os fallbacks em todo o aplicativo.</li>
              <li>Certifique-se de que o contraste entre o texto do fallback e o fundo seja adequado para acessibilidade.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default AvatarSection
