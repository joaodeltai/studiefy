"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"

const TabsSection = () => {
  return (
    <AccordionItem value="tabs">
      <AccordionTrigger className="text-xl font-medium">Tabs</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Uso de Tabs</h3>
            <p className="mb-4">
              Tabs su00e3o utilizadas para alternar entre diferentes visualizau00e7u00f5es dentro do mesmo contexto, 
              permitindo que o usuu00e1rio acesse diferentes conteu00fados sem mudar de pu00e1gina.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Perfil de usuu00e1rio</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-secondary rounded-full"></div>
                    <div>
                      <h4 className="text-lg font-medium">Jou00e3o Silva</h4>
                      <p className="text-sm text-muted-foreground">Estudante de Engenharia</p>
                    </div>
                  </div>
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Informau00e7u00f5es</TabsTrigger>
                      <TabsTrigger value="progress">Progresso</TabsTrigger>
                      <TabsTrigger value="settings">Configurau00e7u00f5es</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="mt-4 space-y-2">
                      <div>
                        <h4 className="text-sm font-medium">Email</h4>
                        <p className="text-sm text-muted-foreground">joao.silva@email.com</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Universidade</h4>
                        <p className="text-sm text-muted-foreground">Universidade Federal</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Curso</h4>
                        <p className="text-sm text-muted-foreground">Engenharia Civil</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="progress" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Matemu00e1tica</span>
                            <span className="text-sm text-muted-foreground">75%</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Fu00edsica</span>
                            <span className="text-sm text-muted-foreground">60%</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="settings" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifications">Notificau00e7u00f5es</Label>
                        <input type="checkbox" id="notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emails">Emails semanais</Label>
                        <input type="checkbox" id="emails" />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Uso de tabs para organizar informau00e7u00f5es de perfil de usuu00e1rio.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Detalhes de conteu00fado</h4>
                <div className="p-4 border rounded-lg">
                  <h4 className="text-lg font-medium mb-2">Cu00e1lculo Diferencial</h4>
                  <p className="text-sm text-muted-foreground">Matu00e9ria fundamental para engenharia</p>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Visu00e3o geral</TabsTrigger>
                      <TabsTrigger value="content">Conteu00fado</TabsTrigger>
                      <TabsTrigger value="resources">Recursos</TabsTrigger>
                      <TabsTrigger value="grades">Notas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                      <p className="text-sm">
                        Cu00e1lculo Diferencial u00e9 uma disciplina fundamental que estuda taxas de variau00e7u00e3o e inclinau00e7u00f5es de curvas. u00c9 essencial para diversos campos da engenharia e ciu00eancias.
                      </p>
                      <div className="flex items-center mt-4 space-x-2">
                        <div className="bg-secondary text-sm font-medium text-white px-2 py-1 rounded-md">Matemu00e1tica</div>
                        <div className="bg-secondary text-sm font-medium text-white px-2 py-1 rounded-md">Avanu00e7ado</div>
                      </div>
                    </TabsContent>
                    <TabsContent value="content" className="mt-4">
                      <ul className="space-y-2 text-sm">
                        <li>u2022 Limites e Continuidade</li>
                        <li>u2022 Derivadas</li>
                        <li>u2022 Aplicau00e7u00f5es de Derivadas</li>
                        <li>u2022 Integrais</li>
                      </ul>
                    </TabsContent>
                    <TabsContent value="resources" className="mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-sm">Livro: Cu00e1lculo - Vol. 1 (James Stewart)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-sm">Apostila: Fundamentos de Cu00e1lculo</span>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="grades" className="mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Prova 1</span>
                          <span className="text-sm font-medium">8.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Prova 2</span>
                          <span className="text-sm font-medium">7.0</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Mu00e9dia</span>
                          <span className="text-sm font-medium">7.75</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Uso de tabs para organizar detalhes de um conteu00fado acadu00eamico.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas pru00e1ticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Recomendau00e7u00f5es</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Use tabs para conteu00fados relacionados dentro do mesmo contexto</li>
                  <li>Limite o nu00famero de tabs (idealmente 2-6)</li>
                  <li>Use ru00f3tulos curtos e descritivos</li>
                  <li>Mantenha a consistu00eancia visual entre as diferentes tabs</li>
                  <li>Destaque visualmente a tab ativa</li>
                  <li>Evite tabs aninhadas (tabs dentro de tabs)</li>
                  <li>Considere a responsividade em telas menores</li>
                </ul>
              </div>
              <div>
                <h4 className="text-base font-medium mb-2">Quando usar</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium">Use tabs quando:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>O conteu00fado pode ser dividido em categorias distintas</li>
                      <li>O usuu00e1rio precisa alternar entre diferentes visualizau00e7u00f5es</li>
                      <li>Vocu00ea deseja economizar espau00e7o vertical na interface</li>
                      <li>Os conteu00fados su00e3o independentes, mas relacionados</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Evite tabs quando:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>O conteu00fado precisa ser visualizado simultaneamente</li>
                      <li>Hu00e1 uma sequu00eancia lu00f3gica que o usuu00e1rio deve seguir</li>
                      <li>Hu00e1 muitas categorias (considere um menu lateral)</li>
                      <li>O conteu00fado u00e9 muito extenso (considere pu00e1ginas separadas)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default TabsSection
