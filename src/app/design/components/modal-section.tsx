"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

const ModalSection = () => {
  return (
    <AccordionItem value="modal">
      <AccordionTrigger className="text-xl font-medium">Modal</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Modal básico</h3>
            <p className="mb-4">
              No Studiefy, utilizamos o componente <code>Dialog</code> para criar modais. Os modais são usados para exibir conteúdo que requer atenção imediata do usuário.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Modal simples</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Abrir modal</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Título do Modal</DialogTitle>
                      <DialogDescription>
                        Esta é uma descrição do modal que explica seu propósito.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>Conteúdo do modal pode incluir texto, formulários, imagens ou qualquer outro elemento.</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="mr-2">
                        Cancelar
                      </Button>
                      <Button>Confirmar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-muted-foreground mt-4">
                  Modal básico com título, descrição, conteúdo e botões de ação.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Modal de confirmação</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Excluir item</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar exclusão</DialogTitle>
                      <DialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o item.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button variant="outline" className="mr-2">Cancelar</Button>
                      </DialogClose>
                      <Button variant="destructive">Excluir</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-muted-foreground mt-4">
                  Modal de confirmação para ações destrutivas.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Casos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Formulário em modal</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Adicionar novo</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar evento</DialogTitle>
                      <DialogDescription>
                        Preencha os detalhes do novo evento. Clique em salvar quando terminar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" placeholder="Nome do evento" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input id="date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" placeholder="Descrição do evento" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-muted-foreground mt-4">
                  Modal contendo um formulário para adicionar novos itens.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Modal de detalhes</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Ver detalhes</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Detalhes do conteúdo</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Matemática Avançada</h4>
                          <p className="text-sm text-muted-foreground">
                            Curso completo de cálculo diferencial e integral, álgebra linear e estatística.
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge>Matemática</Badge>
                            <Badge variant="outline">Avançado</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Fechar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-muted-foreground mt-2">
                  Modal para exibir detalhes de um item específico.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use modais com moderação, apenas quando for necessário interromper o fluxo do usuário.</li>
              <li>Forneça títulos claros que indiquem o propósito do modal.</li>
              <li>Inclua uma descrição quando necessário para explicar o contexto.</li>
              <li>Ofereça sempre uma forma de fechar o modal (botão de fechar, botão cancelar ou clicando fora).</li>
              <li>Mantenha o conteúdo do modal conciso e focado em uma única tarefa.</li>
              <li>Para ações destrutivas, use modais de confirmação com linguagem clara sobre as consequências.</li>
              <li>Considere o tamanho do modal - não deve ser muito grande nem muito pequeno para o conteúdo.</li>
              <li>Garanta que o modal seja acessível via teclado e para tecnologias assistivas.</li>
              <li>Evite modais dentro de modais (aninhados) sempre que possível.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ModalSection
