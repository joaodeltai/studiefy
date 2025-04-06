'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row w-full gap-6">
        {/* Coluna da esquerda - Título (20%) */}
        <div className="w-full md:w-[20%]">
          <h2 className="text-3xl font-bold md:pt-2">Perguntas Frequentes</h2>
        </div>
        
        {/* Coluna da direita - Conteúdo em sanfona (80%) */}
        <div className="w-full md:w-[80%]">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Como o Studiefy me ajuda a estudar melhor?</AccordionTrigger>
              <AccordionContent>
                O Studiefy organiza todos seus estudos automaticamente. Em 10 minutos você já sabe usar todas as funções. 
                O app mostra exatamente onde você está forte ou fraco em cada matéria, baseado no seu tempo de estudo real.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Quanto tempo leva para aprender a usar o app?</AccordionTrigger>
              <AccordionContent>
                Em apenas 10 minutos você domina todas as funções. Nossa interface é super simples e intuitiva. 
                Não perca tempo precioso aprendendo sistemas complexos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Como sei que o Studiefy realmente funciona?</AccordionTrigger>
              <AccordionContent>
                87% dos usuários relatam menos ansiedade após uma semana de uso. Além disso, nossos alunos melhoram 
                em média 40 pontos nas notas dos simulados após 1 mês usando o app.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>O app funciona offline?</AccordionTrigger>
              <AccordionContent>
                Sim. Você pode usar todas as funções principais sem internet. O app sincroniza seus dados quando você voltar online.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Posso usar junto com outros métodos de estudo?</AccordionTrigger>
              <AccordionContent>
                Claro. O Studiefy se adapta ao seu método atual. Ele apenas organiza e monitora seu progresso, 
                sem interferir na sua forma de estudar.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Como o sistema de níveis funciona?</AccordionTrigger>
              <AccordionContent>
                Você ganha pontos de experiência (XP) por cada minuto estudado. Conforme avança, sobe de nível. 
                Isso ajuda a manter sua motivação alta e mostra seu progresso real.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>O que é o sistema de ofensivas?</AccordionTrigger>
              <AccordionContent>
                Ofensivas são sequências de dias estudando. Quanto mais dias seguidos você estuda, maior sua ofensiva. 
                Isso ajuda a manter consistência nos estudos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>Como o timer pomodoro funciona?</AccordionTrigger>
              <AccordionContent>
                Você define ciclos de estudo e pausa (exemplo: 50 minutos de estudo, 10 de pausa). 
                O app registra automaticamente seu tempo em cada matéria.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger>Quanto custa o Studiefy?</AccordionTrigger>
              <AccordionContent>
                Durante esta semana, oferecemos acesso gratuito para os primeiros 120 usuários beta. 
                Após este período, o valor será R$39,90 por mês.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger>Existe garantia?</AccordionTrigger>
              <AccordionContent>
                Sim. Usuários beta têm acesso vitalício gratuito a todas as funcionalidades. Sem compromisso.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
