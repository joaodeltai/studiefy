"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

const RadioSection = () => {
  return (
    <AccordionItem value="radio">
      <AccordionTrigger className="text-xl font-medium">Radio</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Radio básico</h3>
            <p className="mb-4">
              Botões de rádio (Radio) permitem que o usuário selecione uma única opção de um conjunto. São ideais para escolhas exclusivas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Radio simples</h4>
                <div className="p-4 border rounded-lg">
                  <RadioGroup defaultValue="option-one">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-one" id="option-one" />
                      <Label htmlFor="option-one">Opção 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-two" id="option-two" />
                      <Label htmlFor="option-two">Opção 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-three" id="option-three" />
                      <Label htmlFor="option-three">Opção 3</Label>
                    </div>
                  </RadioGroup>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Radio básico com três opções, permitindo a seleção de apenas uma.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Radio com descrição</h4>
                <div className="p-4 border rounded-lg">
                  <RadioGroup defaultValue="card">
                    <div className="flex items-start space-x-2 mb-3">
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div>
                        <Label htmlFor="card" className="font-medium">Cartão de crédito</Label>
                        <p className="text-sm text-muted-foreground">Pague com seu cartão de crédito.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 mb-3">
                      <RadioGroupItem value="paypal" id="paypal" className="mt-1" />
                      <div>
                        <Label htmlFor="paypal" className="font-medium">PayPal</Label>
                        <p className="text-sm text-muted-foreground">Pague com sua conta PayPal.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="pix" id="pix" className="mt-1" />
                      <div>
                        <Label htmlFor="pix" className="font-medium">Pix</Label>
                        <p className="text-sm text-muted-foreground">Pague instantaneamente com Pix.</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Radio com descrições detalhadas para cada opção.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Estados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Padrão</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="default" />
                    <Label htmlFor="default">Opção padrão</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium mb-2">Selecionado</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checked" id="checked" checked />
                    <Label htmlFor="checked">Opção selecionada</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-base font-medium mb-2">Desabilitado</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="disabled" id="disabled" disabled />
                    <Label htmlFor="disabled" className="text-muted-foreground">Opção desabilitada</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use botões de rádio quando o usuário precisa ver todas as opções disponíveis.</li>
              <li>Agrupe botões de rádio relacionados dentro de um RadioGroup.</li>
              <li>Forneça labels claros e descritivos para cada opção.</li>
              <li>Considere adicionar descrições adicionais para opções complexas.</li>
              <li>Pré-selecione a opção mais comum ou recomendada quando apropriado.</li>
              <li>Mantenha o número de opções gerenciável (geralmente menos de 7).</li>
              <li>Organize as opções em uma ordem lógica (alfabética, numérica, por frequência de uso, etc.).</li>
              <li>Garanta que os botões de rádio sejam acessíveis via teclado.</li>
              <li>Para muitas opções, considere usar um Select em vez de Radio.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default RadioSection
