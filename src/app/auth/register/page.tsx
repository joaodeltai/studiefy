"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<string>("") // Novo estado para o tipo de usuário
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })
  const { signUp, isLoading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Verificar se a senha atende a todos os critérios
    const isPasswordValid = Object.values(passwordStrength).every(Boolean)
    
    if (!isPasswordValid) {
      setValidationError("A senha não atende aos requisitos mínimos de segurança")
      return
    }

    // Validação básica para o número de telefone
    const phoneRegex = /^\d{10,11}$/
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      setValidationError("Número de telefone inválido. Digite apenas números, incluindo DDD")
      return
    }

    // Verificar se o tipo de usuário foi selecionado
    if (!userType) {
      setValidationError("Por favor, selecione qual o seu perfil")
      return
    }

    try {
      await signUp(email, password, name, phoneNumber, userType)
      // Não é necessário redirecionar aqui, pois o redirecionamento agora é feito no hook useAuth
    } catch (error) {
      // O erro já é tratado no hook useAuth
    }
  }

  // Função para verificar a força da senha
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    })
  }

  // Função para formatar o número de telefone enquanto o usuário digita
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    
    if (value.length <= 11) {
      setPhoneNumber(value)
    }
  }

  // Função para exibir o número formatado
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length === 0) return ''
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  }

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex w-full max-w-4xl h-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Imagem à esquerda */}
        <div className="hidden md:flex md:w-1/2 relative border-r border-gray-200">
          <div className="absolute inset-0 flex flex-col justify-start items-start p-8 z-10">
            <div className="text-gray-800 max-w-xs">
              <p className="text-2xl font-bold mb-2">Se cadastrar é fácil, difícil vai ser largar o app depois!</p>
              <p className="text-sm">Cria tua conta e vem!</p>
            </div>
          </div>
          <div className="absolute bottom-0 w-full h-[60%] translate-y-4">
            <Image
              src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//work-from-home.webp"
              alt="Pessoa estudando em casa"
              fill
              className="object-contain object-bottom"
              unoptimized
            />
          </div>
        </div>
        
        {/* Formulário à direita */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[600px]">
          <Card className="w-full border-none shadow-none">
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1 px-0 pb-4">
                <CardTitle className="text-2xl">
                  Crie sua conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-0">
                {(error || validationError) && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {validationError || error}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    disabled={isLoading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="seu@email.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Celular</Label>
                  <div className="flex">
                    <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                      +55
                    </div>
                    <Input
                      id="phoneNumber"
                      placeholder="(00) 00000-0000"
                      type="tel"
                      autoComplete="tel"
                      disabled={isLoading}
                      value={formatPhoneNumber(phoneNumber)}
                      onChange={handlePhoneChange}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="userType">Sou</Label>
                  <Select
                    value={userType}
                    onValueChange={setUserType}
                    required
                  >
                    <SelectTrigger id="userType" disabled={isLoading}>
                      <SelectValue placeholder="Selecione seu perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vestibulando">Vestibulando</SelectItem>
                      <SelectItem value="estudante">Estudante</SelectItem>
                      <SelectItem value="universitario">Universitário</SelectItem>
                      <SelectItem value="concurseiro">Concurseiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="mt-1 space-y-1 text-xs">
                    <p className="font-semibold">A senha deve conter:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-2">
                      <div className={`flex items-center ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordStrength.length ? '✓' : '○'}</span> Mínimo 8 caracteres
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordStrength.hasUpperCase ? '✓' : '○'}</span> Letra maiúscula
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordStrength.hasLowerCase ? '✓' : '○'}</span> Letra minúscula
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordStrength.hasNumber ? '✓' : '○'}</span> Número
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordStrength.hasSpecialChar ? '✓' : '○'}</span> Caractere especial
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 px-0 pt-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !Object.values(passwordStrength).every(Boolean) || !userType}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
                <div className="text-sm text-center text-gray-600">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Entrar
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
