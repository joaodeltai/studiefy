"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Profile, useProfile } from "@/hooks/useProfile"
import { Check, X } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface EditProfileDialogProps {
  profile: Profile
  onSave: (updates: Partial<Profile>) => Promise<void>
}

export function EditProfileDialog({ profile, onSave }: EditProfileDialogProps) {
  const { isUsernameAvailable } = useProfile()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(profile.name)
  const [username, setUsername] = useState(profile.username || '')
  const [loading, setLoading] = useState(false)
  const [usernameState, setUsernameState] = useState<{
    isValid: boolean
    isAvailable: boolean | null
    message: string | null
  }>({
    isValid: false,
    isAvailable: null,
    message: null
  })

  // Validar formato do username
  const validateUsername = (value: string) => {
    if (!value) {
      return {
        isValid: true,
        isAvailable: null,
        message: null
      }
    }

    if (value.length < 3) {
      return {
        isValid: false,
        isAvailable: null,
        message: "Mínimo de 3 caracteres"
      }
    }

    if (value.length > 20) {
      return {
        isValid: false,
        isAvailable: null,
        message: "Máximo de 20 caracteres"
      }
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return {
        isValid: false,
        isAvailable: null,
        message: "Apenas letras, números e underscore"
      }
    }

    return {
      isValid: true,
      isAvailable: null,
      message: null
    }
  }

  // Verificar disponibilidade do username quando o formato for válido
  useEffect(() => {
    let mounted = true
    let debounceTimer: NodeJS.Timeout | null = null
    
    const checkAvailability = async () => {
      if (!username) {
        setUsernameState({
          isValid: true,
          isAvailable: null,
          message: null
        })
        return
      }

      try {
        const result = await isUsernameAvailable(username)
        if (mounted) {
          setUsernameState({
            isValid: result.available,
            isAvailable: result.available,
            message: result.message || null
          })
        }
      } catch (error) {
        if (mounted) {
          setUsernameState({
            isValid: false,
            isAvailable: false,
            message: "Erro ao verificar disponibilidade"
          })
        }
      }
    }

    // Limpar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Iniciar nova verificação após delay
    debounceTimer = setTimeout(checkAvailability, 300)

    return () => {
      mounted = false
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [username, isUsernameAvailable])

  const handleSave = async () => {
    if (!canSave) return

    try {
      setLoading(true)
      await onSave({ 
        name: name.trim(),
        username: username.trim() || null
      })
      setOpen(false)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = name !== profile.name || username !== (profile.username || '')
  const canSave = hasChanges && 
    name.trim() && 
    (!username || (usernameState.isValid && usernameState.isAvailable === true))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Editar Perfil</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Nome de usuário
            </Label>
            <div className="col-span-3 space-y-1">
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="seu_nome_de_usuario"
                  className={cn(
                    "pl-7 pr-8",
                    username && (
                      usernameState.isAvailable === true
                        ? "border-green-500 focus-visible:ring-green-500"
                        : usernameState.message
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                    )
                  )}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-studiefy-black/40">
                  @
                </span>
                {username && (
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    {usernameState.isAvailable === true && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {usernameState.message && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {usernameState.message ? (
                <p className="text-xs text-red-500">
                  {usernameState.message}
                </p>
              ) : (
                <p className="text-xs text-studiefy-black/60">
                  Apenas letras, números e underscore (_). Entre 3 e 20 caracteres.
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={loading || !canSave}
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
