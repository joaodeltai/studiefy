import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário é administrador
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
    
    // Buscar todas as assinaturas
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar assinaturas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(subscriptions || []);
    
  } catch (error: any) {
    console.error('Erro na rota de assinaturas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
