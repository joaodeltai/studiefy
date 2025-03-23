"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Home, BookOpen, Calendar, User, Settings, ChevronDown } from "lucide-react"

const NavigationSection = () => {
  return (
    <AccordionItem value="navigation">
      <AccordionTrigger className="text-xl font-medium">Navigation</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Navegação lateral</h3>
            <p className="mb-4">
              A navegação lateral (sidebar) é o principal meio de navegação no Studiefy, fornecendo acesso às principais áreas do aplicativo.
            </p>
            <div className="flex gap-8">
              <div className="w-64 h-[400px] bg-card border rounded-lg p-4">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="font-bold text-xl mb-4">Studiefy</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 text-primary font-medium">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                        <BookOpen className="h-4 w-4" />
                        <span>Matérias</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                        <Calendar className="h-4 w-4" />
                        <span>Calendário</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Perfil</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Boas práticas</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Use ícones consistentes para cada item de navegação</li>
                  <li>Destaque o item ativo com cor ou fundo diferenciado</li>
                  <li>Agrupe itens relacionados</li>
                  <li>Mantenha a navegação simples e direta</li>
                  <li>Coloque os itens mais importantes no topo</li>
                  <li>Itens de perfil e configurações devem ficar na parte inferior</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Navegação com dropdown</h3>
            <p className="mb-4">
              Dropdowns são úteis para agrupar itens relacionados e economizar espaço na interface.
            </p>
            <div className="flex gap-8">
              <div className="w-64 bg-card border rounded-lg p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                    <BookOpen className="h-4 w-4" />
                    <span>Matemática</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted cursor-pointer">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Física</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="pl-6 mt-1 space-y-1">
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                        <span className="text-sm">Mecânica</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 text-primary font-medium">
                        <span className="text-sm">Eletromagnetismo</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                        <span className="text-sm">Termodinâmica</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                    <BookOpen className="h-4 w-4" />
                    <span>Química</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Boas práticas</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Use indicadores visuais (como setas) para mostrar que um item tem submenu</li>
                  <li>Indente os itens do submenu para criar hierarquia visual</li>
                  <li>Limite a profundidade dos submenus a no máximo 2 níveis</li>
                  <li>Mantenha os rótulos concisos e descritivos</li>
                  <li>Permita que o usuário expanda/recolha os submenus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default NavigationSection
