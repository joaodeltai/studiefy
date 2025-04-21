import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuu00e1rio nu00e3o fornecido' }, { status: 400 });
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuu00e1rio estu00e1 autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Nu00e3o autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuu00e1rio u00e9 administrador
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('user_id', session.user.id)
      .single();
    
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.split(',') || [];
    const isAdmin = profile?.role === 'admin' || adminEmails.includes(profile?.email);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    // Buscar detalhes do usuu00e1rio solicitado
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar dados do usuu00e1rio:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!userData) {
      return NextResponse.json({ error: 'Usuu00e1rio nu00e3o encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(userData);
    
  } catch (error: any) {
    console.error('Erro na rota de detalhes do usuu00e1rio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
