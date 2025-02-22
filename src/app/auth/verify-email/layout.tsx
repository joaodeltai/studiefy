import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verifique seu Email - Studiefy",
  description: "Verifique seu email para ativar sua conta no Studiefy",
}

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
