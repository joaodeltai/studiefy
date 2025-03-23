"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const CheckboxSection = () => {
  return (
    <AccordionItem value="checkbox">
      <AccordionTrigger className="text-xl font-medium">Checkbox</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Checkbox básico</h3>
            <p className="mb-4">
              Checkboxes permitem que o usuário selecione múltiplas opções de um conjunto. São ideais para listas de opções não exclusivas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Checkbox simples</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms">Aceitar termos e condições</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="newsletter" defaultChecked />
                      <Label htmlFor="newsletter">Inscrever-se na newsletter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="updates" />
                      <Label htmlFor="updates">Receber atualizações por email</Label>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Checkboxes básicos com labels descritivos.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Checkbox com descrição</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="marketing" className="mt-1" />
                      <div>
                        <Label htmlFor="marketing" className="font-medium">Marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba emails sobre novos produtos, recursos e atualizações.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="events" className="mt-1" />
                      <div>
                        <Label htmlFor="events" className="font-medium">Eventos</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba emails sobre eventos e webinars educacionais.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Checkboxes com descrições detalhadas para cada opção.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Casos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Lista de tarefas</h4>
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas para hoje</CardTitle>
                    <CardDescription>Marque as tarefas concluídas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-1" defaultChecked />
                        <Label htmlFor="task-1" className="line-through text-muted-foreground">Revisar material de estudo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-2" />
                        <Label htmlFor="task-2">Completar exercícios</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-3" />
                        <Label htmlFor="task-3">Agendar sessão de estudo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-4" />
                        <Label htmlFor="task-4">Preparar para avaliação</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground mt-2">
                  Uso de checkboxes para uma lista de tarefas.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Filtros</h4>
                <Card>
                  <CardHeader>
                    <CardTitle>Filtrar conteúdo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-1" defaultChecked />
                        <Label htmlFor="filter-1">Matérias</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-2" defaultChecked />
                        <Label htmlFor="filter-2">Conteúdos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-3" />
                        <Label htmlFor="filter-3">Eventos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-4" />
                        <Label htmlFor="filter-4">Notas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-5" />
                        <Label htmlFor="filter-5">História</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-6" />
                        <Label htmlFor="filter-6">Geografia</Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Aplicar filtros</Button>
                  </CardFooter>
                </Card>
                <p className="text-sm text-muted-foreground mt-2">
                  Uso de checkboxes para filtrar conteúdo por categorias.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Estados</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Padrão</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="default-state" />
                    <Label htmlFor="default-state">Padrão</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium mb-2">Marcado</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="checked-state" checked />
                    <Label htmlFor="checked-state">Marcado</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium mb-2">Desabilitado</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled-state" disabled />
                    <Label htmlFor="disabled-state" className="text-muted-foreground">Desabilitado</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium mb-2">Desabilitado e marcado</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled-checked-state" disabled checked />
                    <Label htmlFor="disabled-checked-state" className="text-muted-foreground">Desabilitado e marcado</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use checkboxes quando o usuário puder selecionar múltiplas opções de uma lista.</li>
              <li>Forneca labels claros e descritivos para cada checkbox.</li>
              <li>Agrupe checkboxes relacionados visualmente.</li>
              <li>Considere adicionar a opção "Selecionar todos" para listas longas de checkboxes.</li>
              <li>Evite usar checkboxes para ações que ocorrem imediatamente após a seleção (use botões ou switches).</li>
              <li>Mantenha o texto do label conciso e claro.</li>
              <li>Considere o uso de checkboxes indeterminados para representar estados parciais em hierarquias.</li>
              <li>Garanta que os checkboxes sejam acessíveis via teclado e para tecnologias assistivas.</li>
              <li>Pré-selecione checkboxes apenas quando for claramente benéfico para a maioria dos usuários.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default CheckboxSection
