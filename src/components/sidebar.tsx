'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, GraduationCap, ChevronUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useProfile } from '@/hooks/useProfile'
import { ProfileDropdown } from "./profile-dropdown"
import { useState, useEffect } from 'react'

const routes = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Matérias',
    href: '/dashboard/subjects',
    icon: GraduationCap
  },
  {
    label: 'Estudo',
    href: '/dashboard/study',
    icon: BookOpen
  },
  {
    label: 'Avaliações',
    href: '/dashboard/assessments',
    icon: BookOpen
  }
]

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

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useProfile()
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const [dropdownSide, setDropdownSide] = useState<'right' | 'top'>(isSmallScreen ? 'top' : 'right')

  useEffect(() => {
    const handleResize = () => {
      setDropdownSide(window.innerWidth <= 768 ? 'top' : 'right')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-full w-full flex-col bg-studiefy-black text-studiefy-white">
      <div className="px-3 py-4">
        <Link
          href="/dashboard"
          className="mb-14 flex items-center pl-3 text-2xl font-bold"
        >
          Studiefy
        </Link>
        <div className="space-y-4">
          <div className="flex flex-1 flex-col gap-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-studiefy-black/5",
                  pathname === route.href
                    ? "bg-studiefy-black/10 text-studiefy-white"
                    : "text-studiefy-gray hover:text-studiefy-white"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <ProfileDropdown
          user={{
            name: profile?.username ? `@${profile.username}` : profile?.name,
            email: profile?.email || undefined,
            avatar_url: profile?.avatar_url || undefined,
            username: profile?.username || undefined
          }}
          side={dropdownSide}
          className="w-full"
        />
      </div>
    </div>
  )
}
