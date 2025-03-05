'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LogOut, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/useAuth'

interface User {
  name?: string
  email?: string
  avatar_url?: string
  username?: string
}

interface ProfileDropdownProps {
  user: User
  side?: 'right' | 'top'
  className?: string
  isCollapsed?: boolean
}

function getInitials(name: string): string {
  if (!name) return ''
  
  return name
    .split(' ')
    .map(word => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileDropdown({ 
  user, 
  side = 'right', 
  className,
  isCollapsed = false
}: ProfileDropdownProps) {
  const userInitials = user.name ? getInitials(user.name) : '?'
  const { signOut } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-studiefy-black/5",
          className
        )}>
          <Avatar className="h-8 w-8">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.name || 'Avatar'} />
            ) : (
              <AvatarFallback className="bg-studiefy-black/20 text-studiefy-white text-sm">
                {userInitials}
              </AvatarFallback>
            )}
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex flex-1 flex-col justify-center overflow-hidden text-left">
              {user.name && (
                <p className="truncate text-sm font-medium text-studiefy-white">
                  {user.name}
                </p>
              )}
              {user.email && (
                <p className="truncate text-xs text-studiefy-gray">
                  {user.email}
                </p>
              )}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={side}
        className="w-56 bg-white"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            {user.name && (
              <p className="text-sm font-medium leading-none">
                {user.name}
              </p>
            )}
            {user.email && (
              <p className="text-xs text-studiefy-gray">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Minha Conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-500 focus:text-red-500"
          onClick={async () => {
            await signOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}