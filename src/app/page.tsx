import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo and name */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">📚</div>
            <span className="font-semibold text-xl">Studiefy</span>
          </div>
          
          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Registrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
            A melhor plataforma para estudantes organizarem sua vida estudantil
          </h1>
          
          <h2 className="text-xl text-muted-foreground max-w-2xl">
            Organize seus estudos de forma inteligente e eficiente
          </h2>

          {/* Newsletter signup */}
          <div className="flex w-full max-w-md items-center space-x-2 mt-4">
            <Input 
              type="email" 
              placeholder="Seu melhor email" 
              className="h-11"
            />
            <Button 
              type="submit" 
              className="h-11"
            >
              Inscrever-se
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
