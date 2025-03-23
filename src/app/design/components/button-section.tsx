"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Download, Search, Bell, Settings, Trash, Heart, Mail, Share, Save } from "lucide-react"

const ButtonSection = () => {
  return (
    <AccordionItem value="button">
      <AccordionTrigger className="text-xl font-medium">Botões</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Variantes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Button variant="default">Default</Button>
                <span className="text-sm text-muted-foreground">Default</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button variant="secondary">Secondary</Button>
                <span className="text-sm text-muted-foreground">Secondary</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button variant="outline">Outline</Button>
                <span className="text-sm text-muted-foreground">Outline</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button variant="ghost">Ghost</Button>
                <span className="text-sm text-muted-foreground">Ghost</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button variant="link">Link</Button>
                <span className="text-sm text-muted-foreground">Link</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button variant="destructive">Destructive</Button>
                <span className="text-sm text-muted-foreground">Destructive</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Tamanhos</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Button size="sm">Pequeno</Button>
                <span className="text-sm text-muted-foreground">Small (sm)</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button size="default">Padrão</Button>
                <span className="text-sm text-muted-foreground">Default</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button size="lg">Grande</Button>
                <span className="text-sm text-muted-foreground">Large (lg)</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Icon</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Estados</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Button>Normal</Button>
                <span className="text-sm text-muted-foreground">Normal</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button disabled>Desabilitado</Button>
                <span className="text-sm text-muted-foreground">Disabled</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button className="cursor-not-allowed opacity-50">Loading...</Button>
                <span className="text-sm text-muted-foreground">Loading</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Com ícones</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                <span className="text-sm text-muted-foreground">Ícone à esquerda</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button>
                  Download
                  <Download className="h-4 w-4 ml-2" />
                </Button>
                <span className="text-sm text-muted-foreground">Ícone à direita</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Botões redondos com ícone</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium mb-3">Variantes</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" className="rounded-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Default</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full">
                      <Bell className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Secondary</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" variant="outline" className="rounded-full">
                      <Search className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Outline</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Ghost</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" variant="destructive" className="rounded-full">
                      <Trash className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Destructive</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium mb-3">Tamanhos</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" className="rounded-full h-8 w-8">
                      <Heart className="h-3 w-3" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Pequeno</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" className="rounded-full">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Médio</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button size="icon" className="rounded-full h-12 w-12">
                      <Share className="h-5 w-5" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Grande</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium mb-3">Aplicações</h4>
                <div className="flex flex-wrap gap-6">
                  <Card className="p-4 w-full md:w-auto">
                    <h5 className="font-medium mb-2">Barra de ações</h5>
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">125</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8">
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Botões de ação em interfaces sociais ou de conteúdo
                    </p>
                  </Card>
                  
                  <Card className="p-4 w-full md:w-auto">
                    <h5 className="font-medium mb-2">Botão flutuante</h5>
                    <div className="relative h-32 w-full md:w-48 border rounded-lg p-2 flex items-end justify-end">
                      <Button size="icon" className="rounded-full absolute bottom-4 right-4 shadow-lg">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Botão de ação flutuante (FAB) para ação principal
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Contextos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Ações primárias</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use botões primários para ações principais em formulários, diálogos e páginas.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Salvar</Button>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Ações destrutivas</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use botões destrutivos para ações que removem ou excluem dados.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button variant="destructive">Excluir</Button>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Ações secundárias</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use botões secundários ou ghost para ações menos importantes ou alternativas.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary">Filtrar</Button>
                    <Button variant="ghost">Limpar</Button>
                    <Button variant="outline" size="sm">Ver mais</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use o botão <code>default</code> para ações primárias e mais importantes.</li>
              <li>Use o botão <code>secondary</code> para ações secundárias que não são tão importantes quanto a ação primária.</li>
              <li>Use o botão <code>outline</code> para ações alternativas ou cancelamento.</li>
              <li>Use o botão <code>destructive</code> para ações que excluem ou removem dados.</li>
              <li>Use o botão <code>ghost</code> para ações menos importantes ou em áreas com muitos botões.</li>
              <li>Use o botão <code>link</code> para navegação ou quando quiser que o botão pareça um link.</li>
              <li>Use botões redondos com ícone para ações rápidas, especialmente em interfaces móveis ou compactas.</li>
              <li>Mantenha os textos dos botões curtos e diretos, preferencialmente com verbos de ação.</li>
              <li>Seja consistente com o uso de ícones nos botões em todo o aplicativo.</li>
              <li>Mantenha a hierarquia visual clara, destacando a ação principal e subordinando as demais.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ButtonSection
