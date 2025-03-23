"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search } from "lucide-react"

const SearchSection = () => {
  return (
    <AccordionItem value="search">
      <AccordionTrigger className="text-xl font-medium">Busca</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Campos de busca básicos</h3>
            <p className="mb-4">
              Campos de busca permitem aos usuários encontrar informações específicas dentro do Studiefy. Eles devem ser facilmente identificáveis e acessíveis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Busca simples</h4>
                <div className="p-4 border rounded-lg">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-8"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Campo de busca simples com ícone à esquerda.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Busca com botão</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input placeholder="Buscar conteúdo..." />
                    <Button type="submit">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Campo de busca com botão para iniciar a busca.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Busca com filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Busca com filtro integrado</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        className="pl-8"
                      />
                    </div>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="subjects">Matérias</SelectItem>
                        <SelectItem value="contents">Conteúdos</SelectItem>
                        <SelectItem value="events">Eventos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Campo de busca com botão de filtro que abre um menu dropdown.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Busca com filtros rápidos</h4>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar conteúdo..."
                      className="pl-8"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Matérias
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Conteúdos
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Eventos
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Notas
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Campo de busca com filtros rápidos abaixo do campo.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Busca avançada</h3>
            <div className="grid grid-cols-1 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Busca expandida</h4>
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-8"
                    />
                  </div>
                  
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="subjects">Matérias</SelectItem>
                      <SelectItem value="contents">Conteúdos</SelectItem>
                      <SelectItem value="events">Eventos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mês</SelectItem>
                      <SelectItem value="year">Este ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mais recentes</SelectItem>
                      <SelectItem value="oldest">Mais antigos</SelectItem>
                      <SelectItem value="name">Nome (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" className="mr-2">Limpar</Button>
                    <Button>Aplicar filtros</Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Campo de busca com filtros avançados expansíveis.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Posicione o campo de busca em um local consistente e facilmente acessível.</li>
              <li>Use ícones reconhecíveis, como a lupa, para indicar a função de busca.</li>
              <li>Forneça um placeholder claro que indique o que o usuário pode buscar.</li>
              <li>Ofereça feedback visual durante a digitação e quando nenhum resultado for encontrado.</li>
              <li>Para buscas complexas, ofereça filtros adicionais para refinar os resultados.</li>
              <li>Considere implementar sugestões de busca e autocomplete para ajudar os usuários.</li>
              <li>Garanta que a busca seja responsiva e funcione bem em dispositivos móveis.</li>
              <li>Permita que o usuário limpe facilmente o campo de busca.</li>
              <li>Para interfaces com muitos dados, considere implementar busca avançada com múltiplos filtros.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default SearchSection
