"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Founder = {
  name: string;
  description: string;
  photoUrl: string;
};

const founders: Founder[] = [
  {
    name: "Carol Stifelmann",
    description: "Criadora da Studiefy, aprovada em mais de 15 universidades, e cursando Medicina na UFRGS.",
    photoUrl: "https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//WhatsApp%20Image%202025-04-06%20at%2001.02.07.webp"
  },
  {
    name: "João Quintana",
    description: "Desenvolvedor da Studiefy, dono de uma Agência de Marketing e apaixonado por tecnologia e inovação.",
    photoUrl: "https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//WhatsApp%20Image%202025-04-04%20at%2015.17.20.webp"
  }
];

export function AboutFounders() {
  const [selectedFounder, setSelectedFounder] = useState<number>(0);

  return (
    <section className="w-full py-8 md:py-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Quem somos nós</h2>
          <div className="w-full max-w-[800px] mx-auto mt-8">
            <div className="flex flex-row justify-center gap-8 mb-8">
              {founders.map((founder, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => setSelectedFounder(index)}
                >
                  <div className="relative">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-primary">
                      <img
                        src={founder.photoUrl}
                        alt={`Foto de ${founder.name}`}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-300",
                          selectedFounder === index ? "" : "grayscale"
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg">
              <p className="text-muted-foreground mb-2">{founders[selectedFounder].description}</p>
              <p className="text-right italic">-- {founders[selectedFounder].name}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
