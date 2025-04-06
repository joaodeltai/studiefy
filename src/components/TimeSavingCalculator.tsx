'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import Image from "next/image";
import { FileText, Layers, PenTool, BookOpen, Printer, Grid, XCircle, Trello, Bookmark, CheckSquare, ChevronRight } from 'lucide-react';

const TimeSavingCalculator = () => {
  // Estados para a seção "Quanto tempo você pode economizar?"
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [studyDays, setStudyDays] = useState(20);
  
  // Cálculo do tempo economizado (5 minutos por ferramenta por dia de estudo)
  const timeSaved = useMemo(() => {
    // 5 minutos por ferramenta * dias de estudo no mês
    return selectedTools.length * 5 * studyDays;
  }, [selectedTools.length, studyDays]);

  return (
    <section className="container mx-auto px-8 max-w-6xl py-16">
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          Quanto tempo você pode economizar?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Compare sua rotina atual com o que a Studiefy faz por você — e descubra quanto tempo você pode ganhar.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-background rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Quais ferramentas você usa atualmente?</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                { 
                  name: 'Google Calendar', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//icon-calendar.svg" width={24} height={24} alt="Google Calendar" /> 
                },
                { 
                  name: 'Notion', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//icon-notion.svg" width={24} height={24} alt="Notion" /> 
                },
                { 
                  name: 'Anki', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//anki-icon.svg" width={24} height={24} alt="Anki" /> 
                },
                { 
                  name: 'GoodNotes', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//GoodNotes-icon.svg" width={24} height={24} alt="GoodNotes" /> 
                },
                { 
                  name: 'OneNote', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//onenotes-icon.svg" width={24} height={24} alt="OneNote" /> 
                },
                { 
                  name: 'Cronograma impresso', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//icons8-imprimir-96.webp" width={24} height={24} alt="Cronograma impresso" /> 
                },
                { 
                  name: 'Planilhas Google', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//sheets-icon.svg" width={24} height={24} alt="Planilhas Google" /> 
                },
                { 
                  name: 'Caderno de erros manual', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//icons8-caderno-96.webp" width={24} height={24} alt="Caderno de erros manual" /> 
                },
                { 
                  name: 'Trello', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//icons8-trello.svg" width={24} height={24} alt="Trello" /> 
                },
                { 
                  name: 'Evernote', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//icons8-evernote.svg" width={24} height={24} alt="Evernote" /> 
                },
                { 
                  name: 'Estudei', 
                  icon: <Image src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//favicon.webp" width={24} height={24} alt="Estudei" /> 
                }
              ].map((tool, index) => (
                <div 
                  key={index} 
                  className={`relative rounded-lg p-2 border ${selectedTools.includes(tool.name) ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'} flex items-center gap-2 cursor-pointer transition-all`}
                  onClick={() => {
                    const newSelectedTools = selectedTools.includes(tool.name)
                      ? selectedTools.filter(t => t !== tool.name)
                      : [...selectedTools, tool.name];
                    setSelectedTools(newSelectedTools);
                  }}
                >
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-muted">
                    {tool.icon}
                  </div>
                  <span className="text-sm font-medium">{tool.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-background rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Quantos dias você estuda no mês, em média?</h3>
            
            <div className="mt-6">
              <Slider
                value={[studyDays]}
                min={1}
                max={30}
                step={0.01}
                onValueChange={(values) => setStudyDays(Math.round(values[0]))}
                className="mb-6 w-full"
              />
              <div className="text-center mt-4">
                <span className="text-2xl font-bold">{studyDays} {studyDays === 1 ? 'dia' : 'dias'}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-primary/10 rounded-xl p-6 sticky top-24 h-fit"
          >
            <h3 className="text-xl font-semibold mb-4">Seu resultado</h3>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Usando <span className="font-bold">{selectedTools.length}</span> {selectedTools.length === 1 ? 'app' : 'apps'} para gerenciar seus estudos, com a Studiefy você vai economizar:
              </p>
              
              <div className="text-center py-6">
                <span className="text-4xl md:text-5xl font-bold text-primary">
                  {timeSaved < 60 ? timeSaved : Math.round(timeSaved / 60)}
                </span>
                <span className="text-xl md:text-2xl font-medium ml-2">
                  {timeSaved < 60 ? 'minutos' : 'horas'}
                </span>
                <p className="text-muted-foreground mt-2">por mês</p>
              </div>
              
              <div className="bg-background rounded-lg p-4">
                <p className="text-sm">Isso equivale a <span className="font-bold">{Math.round((timeSaved / 60) / studyDays * 10) / 10}</span> {Math.round((timeSaved / 60) / studyDays * 10) / 10 === 1 ? 'dia inteiro' : 'dias inteiros'} de estudo que você poderia aproveitar melhor!</p>
              </div>
              
              <Link href="/auth/register">
                <Button className="w-full mt-4" size="lg">
                  Começar a economizar tempo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TimeSavingCalculator;
