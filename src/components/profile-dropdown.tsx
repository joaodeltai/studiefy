"use client"

import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProfileDropdownProps {
  user: {
    email: string | undefined
    name: string | undefined
    avatar_url?: string
    username?: string
  }
  className?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

export function ProfileDropdown({ user, className, side = "right", align = "end" }: ProfileDropdownProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.refresh()
    } catch (error) {
      toast.error("Erro ao sair")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-16 w-full justify-start gap-2 px-4 hover:bg-studiefy-black/5 rounded-none"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.avatar_url} 
              alt={user.name} 
              className="object-cover"
            />
            <AvatarFallback className="bg-studiefy-black text-studiefy-white">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-start text-left">
            <span className="text-sm font-medium text-studiefy-white">{user.name}</span>
            <span className="text-xs text-studiefy-gray">{user.email}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-studiefy-gray" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={cn("w-56 bg-studiefy-black text-studiefy-white border border-studiefy-gray/20", className)}
        side={side}
        align={align}
        sideOffset={side === 'top' ? 4 : 8}
        alignOffset={side === 'top' ? 8 : 0}
      >
        <DropdownMenuLabel className="font-normal" asChild>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-studiefy-white">
              {user.name}
            </p>
            <p className="text-xs leading-none text-studiefy-white/80">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-studiefy-gray/20" />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="focus:bg-studiefy-black/10 focus:text-studiefy-white cursor-pointer"
            onClick={() => router.push("/dashboard/profile")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-studiefy-black/10 focus:text-studiefy-white">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-studiefy-gray/20" />
        <DropdownMenuItem 
          className="focus:bg-studiefy-black/10 focus:text-studiefy-white cursor-pointer" 
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
