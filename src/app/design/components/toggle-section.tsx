"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const ToggleSection = () => {
  return (
    <AccordionItem value="toggle">
      <AccordionTrigger className="text-xl font-medium">Alternadores</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Checkbox como alternador</h3>
            <p className="mb-4">
              No Studiefy, utilizamos o componente <code>Checkbox</code> para funcionalidades de alternância (toggle).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Aceito os termos e condições</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="notifications" defaultChecked />
                  <Label htmlFor="notifications">Receber notificações</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled" disabled />
                  <Label htmlFor="disabled" className="text-muted-foreground">Opção desabilitada</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled-checked" disabled defaultChecked />
                  <Label htmlFor="disabled-checked" className="text-muted-foreground">Opção selecionada e desabilitada</Label>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-2">Exemplo de uso em formulário</p>
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferências de notificação</CardTitle>
                      <CardDescription>Escolha quais notificações deseja receber</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-notif" defaultChecked />
                        <Label htmlFor="email-notif">Notificações por email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="push-notif" defaultChecked />
                        <Label htmlFor="push-notif">Notificações push</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="marketing" />
                        <Label htmlFor="marketing">Emails de marketing</Label>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm">Salvar preferências</Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Casos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Filtros</h4>
                <Card>
                  <CardHeader>
                    <CardTitle>Filtrar conteúdos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-math" defaultChecked />
                      <Label htmlFor="filter-math">Matemática</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-physics" />
                      <Label htmlFor="filter-physics">Física</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-chemistry" />
                      <Label htmlFor="filter-chemistry">Química</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Configurações</h4>
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de privacidade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy-profile" defaultChecked />
                      <Label htmlFor="privacy-profile">Perfil público</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy-stats" />
                      <Label htmlFor="privacy-stats">Mostrar estatísticas</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use checkboxes para opções que podem ser ativadas/desativadas independentemente.</li>
              <li>Sempre associe um <code>Label</code> ao checkbox para melhorar a acessibilidade.</li>
              <li>Posicione o label à direita do checkbox, seguindo o padrão convencional.</li>
              <li>Use linguagem clara e direta nos labels para que o usuário entenda exatamente o que está sendo ativado/desativado.</li>
              <li>Agrupe checkboxes relacionados visualmente (em cards ou seções).</li>
              <li>Considere usar o estado <code>defaultChecked</code> para opções que normalmente devem estar ativadas.</li>
              <li>Para opções que não podem ser alteradas no momento, use o estado <code>disabled</code>.</li>
              <li>Forneça feedback visual imediato quando o estado do checkbox mudar.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ToggleSection
