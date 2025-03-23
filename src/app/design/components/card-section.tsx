"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const CardSection = () => {
  return (
    <AccordionItem value="card">
      <AccordionTrigger className="text-xl font-medium">Cards</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Estrutura básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Título do Card</CardTitle>
                    <CardDescription>Descrição do card, explicando seu conteúdo.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Este é o conteúdo principal do card. Aqui você pode adicionar qualquer tipo de conteúdo.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">Cancelar</Button>
                    <Button size="sm" className="ml-2">Salvar</Button>
                  </CardFooter>
                </Card>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Card completo com todos os componentes: <code>Card</code>, <code>CardHeader</code>, <code>CardTitle</code>, <code>CardDescription</code>, <code>CardContent</code> e <code>CardFooter</code>.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Card className="mb-2">
                    <CardHeader>
                      <CardTitle>Apenas título</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Card com título, sem descrição.</p>
                    </CardContent>
                  </Card>
                  <p className="text-sm text-muted-foreground">Card com título, sem descrição.</p>
                </div>
                
                <div>
                  <Card className="mb-2">
                    <CardContent>
                      <p>Este card não possui cabeçalho nem rodapé, apenas conteúdo.</p>
                    </CardContent>
                  </Card>
                  <p className="text-sm text-muted-foreground">Card apenas com conteúdo.</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Variações de estilo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Card className="mb-2">
                  <CardHeader>
                    <CardTitle>Card padrão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Estilo padrão com borda e sombra.</p>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">Estilo padrão</p>
              </div>
              
              <div>
                <Card className="mb-2 border-2 border-primary">
                  <CardHeader>
                    <CardTitle>Card com borda destacada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Borda mais grossa e colorida.</p>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">Borda destacada</p>
              </div>
              
              <div>
                <Card className="mb-2 shadow-lg">
                  <CardHeader>
                    <CardTitle>Card com sombra maior</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Sombra mais pronunciada.</p>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">Sombra maior</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Casos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card className="mb-2">
                  <CardHeader>
                    <CardTitle>Matemática</CardTitle>
                    <CardDescription>Álgebra Linear</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Matrizes e determinantes, transformações lineares, espaços vetoriais.
                    </p>
                    <div className="flex items-center mt-4 text-xs text-muted-foreground">
                      <span>3 conteúdos</span>
                      <span className="mx-2">•</span>
                      <span>2 eventos</span>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">Card de matéria/conteúdo</p>
              </div>
              
              <div>
                <Card className="mb-2">
                  <CardHeader>
                    <CardTitle>ENEM 2023</CardTitle>
                    <CardDescription>Prova</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm">90 questões • 5h30 de duração</p>
                        <p className="text-xs text-muted-foreground mt-1">Nota: 780,5</p>
                      </div>
                      <Button size="sm" variant="outline">Ver detalhes</Button>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">Card de evento</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use cards para agrupar informações relacionadas e criar hierarquia visual.</li>
              <li>Mantenha a estrutura consistente para cards do mesmo tipo em toda a aplicação.</li>
              <li>Use o <code>CardHeader</code> para título e descrição, <code>CardContent</code> para o conteúdo principal e <code>CardFooter</code> para ações.</li>
              <li>Evite sobrecarregar cards com muitas informações ou ações.</li>
              <li>Considere usar badges ou ícones para adicionar informações visuais rápidas.</li>
              <li>Mantenha o espaçamento interno consistente para melhor legibilidade.</li>
              <li>Use variações de estilo (bordas, sombras) com moderação e propósito.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default CardSection
