'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/hooks/useWindowSize'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'

interface OnboardingCelebrationProps {
  open: boolean
  onClose: () => void
}

export function OnboardingCelebration({ open, onClose }: OnboardingCelebrationProps) {
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open) {
      setShowConfetti(true)
      // Parar os confetes após 10 segundos
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3']}
        />
      )}
      
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">Parabéns!</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Você completou todos os passos iniciais do Studiefy!
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 text-center space-y-4">
            <p className="text-gray-700">
              Agora você está pronto para aproveitar ao máximo a plataforma e organizar seus estudos de forma eficiente.
            </p>
            <p className="text-gray-700">
              Continue explorando todas as funcionalidades e bons estudos!
            </p>
          </div>
          
          <div className="flex justify-center pb-4">
            <Button onClick={onClose} className="px-8">
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
