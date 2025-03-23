"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

const ToastSection = () => {
  const { toast } = useToast()
  
  const showToast = () => {
    toast({
      title: "Notificação",
      description: "Esta é uma notificação simples.",
    })
  }

  const showSuccessToast = () => {
    toast({
      title: "Sucesso!",
      description: "Operação realizada com sucesso.",
      variant: "default",
      className: "bg-green-50 border-green-200",
    })
  }

  const showErrorToast = () => {
    toast({
      title: "Erro!",
      description: "Ocorreu um erro ao realizar a operação.",
      variant: "destructive",
    })
  }

  const showActionToast = () => {
    toast({
      title: "Arquivo excluído",
      description: "O arquivo foi movido para a lixeira.",
      action: (
        <ToastAction altText="Desfazer" onClick={() => console.log("Ação de desfazer")}>
          Desfazer
        </ToastAction>
      ),
    })
  }

  return (
    <AccordionItem value="toast">
      <AccordionTrigger className="text-xl font-medium">Toast</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Notificações Toast</h3>
            <p className="mb-4">
              Toasts são notificações temporárias que aparecem na interface para informar o usuário sobre eventos, 
              ações concluídas ou erros, sem interromper o fluxo principal.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Tipos de Toast</h4>
                <div className="space-y-4">
                  <div>
                    <Button onClick={showToast} variant="outline" className="w-full mb-2">
                      Mostrar Toast Básico
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Toast básico para informações gerais.
                    </p>
                  </div>
                  
                  <div>
                    <Button onClick={showSuccessToast} variant="outline" className="w-full mb-2">
                      Mostrar Toast de Sucesso
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Toast com estilo de sucesso para confirmações positivas.
                    </p>
                  </div>
                  
                  <div>
                    <Button onClick={showErrorToast} variant="outline" className="w-full mb-2">
                      Mostrar Toast de Erro
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Toast com estilo de erro para alertar sobre problemas.
                    </p>
                  </div>
                  
                  <div>
                    <Button onClick={showActionToast} variant="outline" className="w-full mb-2">
                      Mostrar Toast com Ação
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Toast com botão de ação para permitir desfazer ou confirmar.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium mb-2">Boas práticas</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Use toasts para feedback não crítico e temporário</li>
                  <li>Mantenha as mensagens concisas e claras</li>
                  <li>Posicione os toasts de forma consistente (geralmente no canto superior direito)</li>
                  <li>Use cores e ícones para diferenciar tipos de toasts (sucesso, erro, aviso)</li>
                  <li>Permita que o usuário feche o toast manualmente</li>
                  <li>Defina um tempo adequado de exibição (2-5 segundos)</li>
                  <li>Para ações importantes, adicione botões de ação (como "Desfazer")</li>
                  <li>Evite mostrar múltiplos toasts simultaneamente</li>
                  <li>Considere a acessibilidade (contraste, tempo de leitura)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ToastSection
