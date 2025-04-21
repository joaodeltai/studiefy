import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/news', '/sobre', '/contato', '/privacidade', '/termos']
  
  // Rotas especiais que devem ser acessíveis mesmo sem autenticação
  const specialRoutes = ['/dashboard/subscription/success']
  
  // Se não houver sessão e a rota não for pública ou especial, redireciona para login
  if (!session && 
      !req.nextUrl.pathname.startsWith('/auth') && 
      !publicRoutes.includes(req.nextUrl.pathname) && 
      !specialRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Se houver sessão e estiver em uma rota de auth, redireciona para dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
