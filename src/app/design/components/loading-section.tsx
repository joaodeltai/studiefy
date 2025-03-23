"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

const LoadingSection = () => {
  return (
    <AccordionItem value="loading">
      <AccordionTrigger className="text-xl font-medium">Carregamento</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Indicadores de carregamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Spinner (Loader2)</h4>
                <div className="flex items-center gap-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Tamanho pequeno (16px)</span>
                </div>
                <div className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Tamanho médio (24px)</span>
                </div>
                <div className="flex items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm">Tamanho grande (32px)</span>
                </div>
                <div className="flex items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="text-sm">Tamanho extra grande (40px)</span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Skeleton</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Uso em componentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Botão com carregamento</h4>
                <div className="space-y-4">
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Botão em estado de carregamento com spinner e texto.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Card com skeleton</h4>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
                <p className="text-sm text-muted-foreground mt-2">
                  Card com skeletons representando conteúdo em carregamento.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Casos de uso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-2">Carregamento de página</h4>
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Esqueleto de carregamento para uma página completa.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Carregamento de tabela</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-2">
                  Esqueleto de carregamento para uma tabela de dados.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use o <code>Loader2</code> (spinner) para operações curtas ou quando o espaço é limitado.</li>
              <li>Use <code>Skeleton</code> para representar o layout da página durante o carregamento inicial de conteúdo.</li>
              <li>Mantenha a consistência no uso de indicadores de carregamento em toda a aplicação.</li>
              <li>Forneça feedback visual imediato quando uma operação de carregamento iniciar.</li>
              <li>Para operações que podem levar mais tempo, considere adicionar uma mensagem informativa junto com o indicador de carregamento.</li>
              <li>Use tamanhos apropriados para os indicadores de carregamento de acordo com o contexto.</li>
              <li>Para botões, desabilite-os durante o carregamento para evitar cliques múltiplos.</li>
              <li>Os skeletons devem refletir o layout real do conteúdo que está sendo carregado.</li>
              <li>Evite usar múltiplos indicadores de carregamento diferentes na mesma área da interface.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default LoadingSection
