"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search } from "lucide-react"

const TextfieldSection = () => {
  return (
    <AccordionItem value="textfield">
      <AccordionTrigger className="text-xl font-medium">Campos de Texto</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Tipos básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="default">Campo padrão</Label>
                  <Input id="default" placeholder="Digite algo aqui..." />
                  <p className="text-sm text-muted-foreground">
                    Campo de texto padrão para a maioria dos casos de uso.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disabled">Campo desabilitado</Label>
                  <Input id="disabled" placeholder="Campo desabilitado" disabled />
                  <p className="text-sm text-muted-foreground">
                    Usado para campos que não podem ser editados no contexto atual.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="with-icon" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Campo com ícone (label)</span>
                  </Label>
                  <Input id="with-icon" placeholder="Buscar..." />
                  <p className="text-sm text-muted-foreground">
                    Ícone no label para indicar a função do campo.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="required">Campo obrigatório</Label>
                  <Input id="required" placeholder="Campo obrigatório" required />
                  <p className="text-sm text-muted-foreground">
                    O atributo <code>required</code> indica que o campo deve ser preenchido.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readonly">Campo somente leitura</Label>
                  <Input id="readonly" defaultValue="Conteúdo não editável" readOnly />
                  <p className="text-sm text-muted-foreground">
                    Usado para mostrar informações que não devem ser editadas.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="with-button">Campo com botão</Label>
                  <div className="flex gap-2">
                    <Input id="with-button" placeholder="Código de convite" />
                    <Button>Aplicar</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Combinação de campo de texto com botão para ações imediatas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Tipos especializados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                  <p className="text-sm text-muted-foreground">
                    Campo específico para entrada de email.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="Sua senha" />
                  <p className="text-sm text-muted-foreground">
                    Campo de senha que oculta os caracteres digitados.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" type="number" placeholder="0" />
                  <p className="text-sm text-muted-foreground">
                    Campo para entrada de valores numéricos.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input id="file" type="file" />
                  <p className="text-sm text-muted-foreground">
                    Campo para upload de arquivos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Estados de validação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="valid" className="text-green-600">Campo válido</Label>
                <Input id="valid" className="border-green-600 focus-visible:ring-green-600" defaultValue="Entrada válida" readOnly />
                <p className="text-sm text-green-600">
                  Formato correto!
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invalid" className="text-destructive">Campo inválido</Label>
                <Input id="invalid" className="border-destructive focus-visible:ring-destructive" defaultValue="Entrada inválida" readOnly />
                <p className="text-sm text-destructive">
                  Por favor, verifique o formato da entrada.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Sempre use o componente <code>Label</code> associado ao campo para melhorar a acessibilidade.</li>
              <li>Forneça placeholders informativos que ajudem o usuário a entender o que deve ser inserido.</li>
              <li>Use o tipo de input apropriado (email, number, password) para ativar validações nativas do navegador.</li>
              <li>Forneça feedback visual claro para estados de erro e sucesso.</li>
              <li>Mantenha a consistência no estilo e tamanho dos campos em todo o aplicativo.</li>
              <li>Para campos obrigatórios, indique visualmente que são necessários (usando asterisco ou texto).</li>
              <li>Considere o uso de ícones para melhorar a compreensão da função do campo.</li>
              <li>Forneça mensagens de erro específicas e úteis quando a validação falhar.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default TextfieldSection
