"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Info, CheckCircle, X, Bell, ArrowRight } from "lucide-react"

const BannerSection = () => {
  return (
    <AccordionItem value="banner">
      <AccordionTrigger className="text-xl font-medium">Banners</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Banners Informativos</h3>
            <p className="mb-4">
              Banners são elementos visuais que ocupam toda a largura da tela e são usados para comunicar
              informações importantes, promoções ou alertas aos usuários.
            </p>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start justify-between">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Informativo</h4>
                    <p className="text-blue-800">Este é um banner informativo para comunicar atualizações ou novidades.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 flex items-start justify-between">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Alerta</h4>
                    <p className="text-yellow-800">Este é um banner de alerta para chamar atenção para algo importante.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start justify-between">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Erro</h4>
                    <p className="text-red-800">Este é um banner de erro para informar sobre problemas críticos.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start justify-between">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Sucesso</h4>
                    <p className="text-green-800">Este é um banner de sucesso para confirmar uma ação bem-sucedida.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Banners Promocionais</h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xl">Plano Premium</h4>
                    <p className="max-w-md">Aproveite todos os recursos exclusivos com 30% de desconto no primeiro mês.</p>
                    <Button className="bg-white text-indigo-600 hover:bg-gray-100 mt-2">
                      Assinar agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" className="text-white hover:bg-white/20 p-1 h-auto rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-lg">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 max-w-md">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-2" />
                        <h4 className="font-bold text-xl">Evento Especial</h4>
                      </div>
                      <p>Participe do nosso webinar gratuito sobre produtividade e organização de estudos.</p>
                      <div className="flex space-x-3 mt-2">
                        <Button className="bg-white text-orange-600 hover:bg-gray-100">
                          Inscrever-se
                        </Button>
                        <Button variant="outline" className="text-white border-white hover:bg-white/20">
                          Saiba mais
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-white hover:bg-white/20 p-1 h-auto rounded-full">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Banners de Cookie e Consentimento</h3>
            <div className="space-y-6">
              <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg" style={{position: 'relative'}}>
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm md:text-base">
                    Utilizamos cookies para melhorar sua experiência em nosso site. Ao continuar navegando, você concorda com nossa política de privacidade.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="text-white border-white hover:bg-white/20 text-sm">
                      Personalizar
                    </Button>
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 text-sm">
                      Aceitar todos
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-4 shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-blue-500 mr-3" />
                    <p className="text-sm md:text-base">
                      Deseja receber notificações sobre novos conteúdos e atualizações?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      Agora não
                    </Button>
                    <Button size="sm">
                      Permitir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Uso efetivo</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Use banners para comunicar informações importantes que precisam de atenção imediata</li>
                  <li>Mantenha o conteúdo conciso e direto</li>
                  <li>Inclua uma ação clara que o usuário pode tomar</li>
                  <li>Use cores e ícones adequados para reforçar o tipo de mensagem</li>
                  <li>Sempre ofereça uma forma de fechar ou dispensar o banner</li>
                  <li>Limite o número de banners exibidos simultaneamente</li>
                </ul>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Quando utilizar</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Banners informativos:</strong> Para comunicar atualizações do sistema, novidades ou informações gerais</li>
                  <li><strong>Banners de alerta:</strong> Para avisar sobre eventos importantes que requerem atenção</li>
                  <li><strong>Banners de erro:</strong> Para informar sobre problemas críticos que afetam a experiência</li>
                  <li><strong>Banners de sucesso:</strong> Para confirmar ações bem-sucedidas de grande impacto</li>
                  <li><strong>Banners promocionais:</strong> Para destacar ofertas, eventos ou recursos premium</li>
                  <li><strong>Banners de consentimento:</strong> Para obter permissão do usuário (cookies, notificações)</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default BannerSection
