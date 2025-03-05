import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    // Obtém o ID do usuário da query string
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    // Cria um cliente Supabase para acessar o banco de dados
    const supabase = await createServerClientWithCookies();

    // Verifica se o usuário está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verifica se o usuário está tentando acessar seus próprios dados
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    // Busca os dados da assinatura do usuário
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar assinatura:', error);
      
      // Se o erro for "not found", retornamos um objeto vazio
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null });
      }
      
      return NextResponse.json(
        { error: 'Erro ao buscar assinatura' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Erro ao verificar status da assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status da assinatura' },
      { status: 500 }
    );
  }
}
