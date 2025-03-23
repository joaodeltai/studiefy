"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const TableSection = () => {
  return (
    <AccordionItem value="table">
      <AccordionTrigger className="text-xl font-medium">Tabelas</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Estrutura básica</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Exemplo de tabela com estrutura completa</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Matéria</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Prova 1</TableCell>
                    <TableCell>Matemática</TableCell>
                    <TableCell>8.5</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Prova 2</TableCell>
                    <TableCell>Física</TableCell>
                    <TableCell>7.0</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Trabalho</TableCell>
                    <TableCell>Química</TableCell>
                    <TableCell>9.2</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Média</TableCell>
                    <TableCell colSpan={2}>8.2</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Tabela completa com <code>Table</code>, <code>TableHeader</code>, <code>TableBody</code>, <code>TableFooter</code>, <code>TableHead</code>, <code>TableRow</code>, <code>TableCell</code> e <code>TableCaption</code>.
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Variações</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-base font-medium mb-2">Tabela simples</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Item 1</TableCell>
                      <TableCell>R$ 100,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Item 2</TableCell>
                      <TableCell>R$ 150,00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-2">
                  Tabela simples sem caption ou footer.
                </p>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Tabela com linhas zebradas</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matéria</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-studiefy-black/5">
                      <TableCell>Matemática</TableCell>
                      <TableCell>8.5</TableCell>
                      <TableCell><Badge variant="outline">Aprovado</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Física</TableCell>
                      <TableCell>7.0</TableCell>
                      <TableCell><Badge variant="outline">Aprovado</Badge></TableCell>
                    </TableRow>
                    <TableRow className="bg-studiefy-black/5">
                      <TableCell>Química</TableCell>
                      <TableCell>5.5</TableCell>
                      <TableCell><Badge variant="destructive">Reprovado</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-2">
                  Tabela com linhas zebradas para melhor legibilidade.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Casos de uso</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-base font-medium mb-2">Tabela de notas</h4>
                <Table>
                  <TableCaption>Histórico de notas - 1º Semestre</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Matéria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Prova 1</TableCell>
                      <TableCell>Matemática</TableCell>
                      <TableCell>10/03/2023</TableCell>
                      <TableCell>8.5</TableCell>
                      <TableCell><Badge variant="default">Aprovado</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Trabalho</TableCell>
                      <TableCell>História</TableCell>
                      <TableCell>15/03/2023</TableCell>
                      <TableCell>9.0</TableCell>
                      <TableCell><Badge variant="default">Aprovado</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Prova 2</TableCell>
                      <TableCell>Física</TableCell>
                      <TableCell>22/03/2023</TableCell>
                      <TableCell>5.5</TableCell>
                      <TableCell><Badge variant="destructive">Reprovado</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Boas práticas</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use <code>TableHeader</code> para definir claramente os cabeçalhos da tabela.</li>
              <li>Utilize <code>TableCaption</code> para fornecer um título descritivo para a tabela.</li>
              <li>Considere usar linhas zebradas para melhorar a legibilidade em tabelas com muitas linhas.</li>
              <li>Alinhe números à direita e texto à esquerda para melhor legibilidade.</li>
              <li>Mantenha as tabelas responsivas usando <code>overflow-x-auto</code> no container.</li>
              <li>Use <code>TableFooter</code> para totais, médias ou informações de resumo.</li>
              <li>Adicione espaçamento adequado entre colunas para melhorar a legibilidade.</li>
              <li>Considere usar badges ou ícones para status ou categorias para informações visuais rápidas.</li>
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default TableSection
