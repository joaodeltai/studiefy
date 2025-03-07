"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"

interface ComingSoonDialogProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
}

export function ComingSoonDialog({ isOpen, onClose, featureName }: ComingSoonDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-studiefy-primary" />
            Funcionalidade em desenvolvimento
          </DialogTitle>
          <DialogDescription>
            Estamos trabalhando para trazer novidades incríveis para você!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            A funcionalidade <strong>{featureName}</strong> estará disponível em breve.
          </p>
          <p>
            Estamos aprimorando esta função para garantir a melhor experiência possível.
            Fique atento às atualizações!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
