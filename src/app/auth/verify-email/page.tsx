"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image 
              src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//logo_sfy_transp.webp"
              alt="Studiefy Logo"
              width={64}
              height={64}
              className="w-16 h-16"
              unoptimized
            />
          </div>
          <CardTitle className="text-2xl text-center">
            Verifique seu email
          </CardTitle>
          <CardDescription className="text-center">
            Enviamos um link de confirmação para o seu email.
            Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Depois de confirmar seu email, você poderá fazer login na sua conta.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Voltar para o login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
