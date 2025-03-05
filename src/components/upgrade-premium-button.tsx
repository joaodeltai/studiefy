"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { UpgradePremiumDialog } from "@/components/upgrade-premium-dialog";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradePremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Texto do botão
   */
  text?: string;
  
  /**
   * Nome do recurso relacionado ao upgrade (para contextualizar o dialog)
   */
  featureName?: string;
  
  /**
   * Título personalizado para o dialog
   */
  dialogTitle?: string;
  
  /**
   * Descrição personalizada para o dialog
   */
  dialogDescription?: string;
  
  /**
   * Se true, não mostra o ícone de Sparkles
   */
  hideIcon?: boolean;
  
  /**
   * Se true, usa cores mais sutis para o botão
   */
  subtle?: boolean;
  
  /**
   * Variante personalizada do botão
   */
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

/**
 * Botão que abre o dialog de upgrade para o plano Premium
 * 
 * Exemplo de uso:
 * ```tsx
 * <UpgradePremiumButton featureName="matérias" />
 * ```
 */
export const UpgradePremiumButton = forwardRef<HTMLButtonElement, UpgradePremiumButtonProps>(
  ({ 
    text = "Upgrade para Premium", 
    featureName,
    dialogTitle,
    dialogDescription,
    hideIcon = false,
    subtle = false,
    buttonVariant,
    className,
    ...props 
  }, ref) => {
    const buttonStyle = subtle
      ? buttonVariant || "secondary"
      : buttonVariant || "default";
    
    const buttonClass = subtle
      ? cn(className)
      : cn(
          "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800",
          !buttonVariant && "text-white",
          className
        );
    
    return (
      <UpgradePremiumDialog
        trigger={
          <Button
            ref={ref}
            variant={buttonStyle}
            className={buttonClass}
            {...props}
          >
            {!hideIcon && <Sparkles className="h-4 w-4 mr-2" />}
            {text}
          </Button>
        }
        featureName={featureName}
        title={dialogTitle}
        description={dialogDescription}
      />
    );
  }
);

UpgradePremiumButton.displayName = "UpgradePremiumButton";
