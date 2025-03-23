"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Settings, User, CreditCard, LogOut, PlusCircle, Cloud, Github, LifeBuoy, Mail, MessageSquare, Check, ChevronRight, MoreHorizontal, Edit, Copy, Archive, Trash } from "lucide-react"

const DropdownSection = () => {
  const [position, setPosition] = React.useState("bottom")
  
  return (
    <AccordionItem value="dropdown">
      <AccordionTrigger className="text-xl font-medium">Dropdown</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Dropdown Menu</h3>
            <p className="mb-4">
              Dropdown menus exibem uma lista de opções quando acionados, permitindo que o usuário selecione uma opção ou execute uma ação.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-3">Básico</h4>
                <div className="flex flex-col space-y-6">
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Abrir Menu</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Pagamentos</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configurações</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sair</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dropdown menu básico com ícones e separadores.
                    </p>
                  </div>
                  
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 w-8 p-0 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          <span>Arquivar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-sm text-muted-foreground mt-2">
                      Botão de ações com dropdown alinhado à direita.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium mb-3">Avançado</h4>
                <div className="flex flex-col space-y-6">
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Grupos e Submenus</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Perfil</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Pagamentos</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Cloud className="mr-2 h-4 w-4" />
                              <span>Integrações</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-48">
                              <DropdownMenuItem>
                                <Github className="mr-2 h-4 w-4" />
                                <span>GitHub</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Gmail</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span>Mais integrações...</span>
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <LifeBuoy className="mr-2 h-4 w-4" />
                          <span>Suporte</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Feedback</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dropdown com grupos, submenus e itens desabilitados.
                    </p>
                  </div>
                  
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Seleção</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Preferências</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>
                          <span>Notificações por e-mail</span>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>
                          <span>Notificações push</span>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Posição</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                          <DropdownMenuRadioItem value="top">
                            <span>Topo</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="bottom">
                            <span>Base</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="right">
                            <span>Direita</span>
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dropdown com checkboxes e opções de rádio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Contextos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Menu de navegação</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use dropdowns para organizar opções de navegação em menus compactos.
                  </p>
                  <div className="flex justify-between items-center p-2 border rounded-md">
                    <span className="font-medium">Disciplinas</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Matemática</DropdownMenuItem>
                        <DropdownMenuItem>Física</DropdownMenuItem>
                        <DropdownMenuItem>Química</DropdownMenuItem>
                        <DropdownMenuItem>Biologia</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Ações de item</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use dropdowns para ações contextuais em itens de lista ou tabela.
                  </p>
                  <div className="flex justify-between items-center p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>João Silva</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Remover</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Filtros e ordenação</h4>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use dropdowns para opções de filtro e ordenação em listas e tabelas.
                  </p>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          <span>Filtrar</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuCheckboxItem checked>
                          <span>Recentes</span>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>
                          <span>Populares</span>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>
                          <span>Não lidos</span>
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          <span>Ordenar</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup value="recentes">
                          <DropdownMenuRadioItem value="recentes">
                            <Check className="mr-2 h-4 w-4 opacity-0" />
                            <span>Mais recentes</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="antigos">
                            <span>Mais antigos</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="az">
                            <span>A-Z</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="za">
                            <span>Z-A</span>
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use dropdowns para agrupar ações relacionadas e economizar espaço na interface</li>
              <li>Organize itens em grupos lógicos com separadores para melhorar a leitura</li>
              <li>Adicione ícones para facilitar o reconhecimento visual das opções</li>
              <li>Desabilite opções que não estão disponíveis no momento, mas mantenha-as visíveis</li>
              <li>Use submenus apenas quando necessário, evitando hierarquias muito profundas</li>
              <li>Posicione o dropdown de forma que não obscureça conteúdo importante</li>
              <li>Mantenha os rótulos dos itens concisos e diretos</li>
              <li>Use checkboxes para opções que podem ser ativadas/desativadas independentemente</li>
              <li>Use opções de rádio para seleções mutuamente exclusivas</li>
              <li>Destaque ações destrutivas (como "Excluir") com cores de alerta</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default DropdownSection
