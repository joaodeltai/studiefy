"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, User, Settings, Home, PlusCircle, Bell, Search, Save, Trash, Eye, Loader2, Info, HelpCircle, X, ChevronDown, SlidersHorizontal } from "lucide-react"

const IconSection = () => {
  return (
    <AccordionItem value="icon">
      <AccordionTrigger className="text-xl font-medium">Ícones</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Biblioteca de ícones</h3>
            <p className="mb-4">
              O Studiefy utiliza a biblioteca <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Lucide</a> para ícones. Esta biblioteca oferece um conjunto consistente de ícones de linha com estilo minimalista.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 mb-2" />
                <span className="text-sm">BookOpen</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 mb-2" />
                <span className="text-sm">Calendar</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <User className="h-8 w-8 mb-2" />
                <span className="text-sm">User</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Settings className="h-8 w-8 mb-2" />
                <span className="text-sm">Settings</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Home className="h-8 w-8 mb-2" />
                <span className="text-sm">Home</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <PlusCircle className="h-8 w-8 mb-2" />
                <span className="text-sm">PlusCircle</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Bell className="h-8 w-8 mb-2" />
                <span className="text-sm">Bell</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Search className="h-8 w-8 mb-2" />
                <span className="text-sm">Search</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Tamanhos</h3>
            <div className="flex flex-wrap items-end gap-8">
              <div className="flex flex-col items-center">
                <BookOpen className="h-4 w-4 mb-2" />
                <span className="text-xs">16px</span>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="h-5 w-5 mb-2" />
                <span className="text-xs">20px</span>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="h-6 w-6 mb-2" />
                <span className="text-xs">24px</span>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="h-8 w-8 mb-2" />
                <span className="text-xs">32px</span>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="h-10 w-10 mb-2" />
                <span className="text-xs">40px</span>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="h-12 w-12 mb-2" />
                <span className="text-xs">48px</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Uso com botões</h3>
            <div className="flex flex-wrap gap-4">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="secondary">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Excluir
              </Button>
              <Button variant="ghost">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button size="sm">
                <Search className="h-3 w-3 mr-2" />
                Buscar
              </Button>
              <Button size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Cores e estilos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 mb-2 text-secondary" />
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm">Muted</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 mb-2 text-destructive" />
                <span className="text-sm">Destructive</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Mantenha o uso de ícones consistente em toda a aplicação.</li>
              <li>Use ícones da biblioteca Lucide para manter a consistência visual.</li>
              <li>Escolha ícones intuitivos que representem claramente a ação ou conceito.</li>
              <li>Mantenha os tamanhos de ícones padronizados (16px, 20px, 24px, 32px).</li>
              <li>Em botões, use ícones de 16px (h-4 w-4) para a maioria dos casos.</li>
              <li>Adicione texto junto com ícones para melhorar a acessibilidade, exceto em botões de ícone.</li>
              <li>Use cores de ícones que contrastem bem com o fundo para garantir visibilidade.</li>
              <li>Evite usar muitos ícones próximos uns dos outros para não sobrecarregar a interface.</li>
              <li>Considere usar o atributo <code>aria-label</code> para ícones sem texto para melhorar a acessibilidade.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default IconSection
