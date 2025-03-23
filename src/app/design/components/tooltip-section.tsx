"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { HelpCircle, Save, Eye, Trash } from "lucide-react"

const TooltipSection = () => {
  return (
    <AccordionItem value="tooltip">
      <AccordionTrigger className="text-xl font-medium">Tooltip</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Tooltips básicos</h3>
            <p className="mb-4">
              Tooltips são pequenas dicas que aparecem quando o usuário passa o mouse sobre um elemento. São úteis para fornecer informações adicionais sem sobrecarregar a interface.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-2">Tooltip simples</h4>
                  <div className="flex items-center justify-center p-8 border rounded-lg">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline">Passe o mouse aqui</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Informação adicional em tooltip</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tooltip básico que aparece ao passar o mouse sobre o botão.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-medium mb-2">Tooltip em ícone</h4>
                  <div className="flex items-center justify-center p-8 border rounded-lg">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <HelpCircle className="h-4 w-4" />
                            <span className="sr-only">Ajuda</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Informações de ajuda</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tooltip em ícone de ajuda, comum para fornecer informações contextuais.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-2">Tooltip com delay</h4>
                  <div className="flex items-center justify-center p-8 border rounded-lg">
                    <TooltipProvider delayDuration={500}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button>Tooltip com delay</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Este tooltip aparece após um pequeno delay</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tooltip com delay de 500ms antes de aparecer, evitando exibições acidentais.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-medium mb-2">Tooltip em texto</h4>
                  <div className="flex items-center justify-center p-8 border rounded-lg">
                    <p className="text-center">
                      Este texto contém um{" "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="underline cursor-help">termo técnico</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Explicação do termo técnico</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>{" "}
                      que pode precisar de explicação.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tooltip em texto para explicar termos ou conceitos específicos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Casos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Tooltips em ícones de ação</h4>
                <Card>
                  <CardHeader>
                    <CardTitle>Documento</CardTitle>
                    <CardDescription>Gerenciar documento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Conteúdo do documento...
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Save className="h-4 w-4" />
                              <span className="sr-only">Salvar</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Salvar documento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Visualizar</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar documento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir documento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardFooter>
                </Card>
                <p className="text-sm text-muted-foreground mt-2">
                  Tooltips em botões de ação com ícones para explicar sua função.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Tooltips em elementos truncados</h4>
                <Card>
                  <CardHeader>
                    <CardTitle className="truncate w-full">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">Título muito longo que será truncado na interface e precisa de um tooltip para mostrar o conteúdo completo</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Título muito longo que será truncado na interface e precisa de um tooltip para mostrar o conteúdo completo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Conteúdo do card...
                    </p>
                  </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground mt-2">
                  Tooltip para mostrar o texto completo de elementos truncados.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use tooltips para informações complementares, não para informações essenciais.</li>
              <li>Mantenha o conteúdo do tooltip conciso e direto.</li>
              <li>Aplique tooltips em elementos que não são autoexplicativos, como ícones sem texto.</li>
              <li>Considere adicionar um pequeno delay antes de mostrar o tooltip para evitar exibições acidentais.</li>
              <li>Posicione o tooltip de forma que não obstrua conteúdo importante.</li>
              <li>Use tooltips para mostrar o texto completo de elementos truncados.</li>
              <li>Garanta que o tooltip seja acessível via teclado para usuários que não usam mouse.</li>
              <li>Evite usar tooltips em dispositivos móveis, onde não há evento de "hover".</li>
              <li>Não coloque interações (como links ou botões) dentro de tooltips.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default TooltipSection
