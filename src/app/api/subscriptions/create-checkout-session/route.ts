import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '../../../../lib/supabase/server';
import { stripe, createCheckoutSession } from '../../../../lib/stripe';
import { SubscriptionPlan } from '../../../../types/subscription';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClientWithCookies();
    const { priceId } = await req.json();

    console.log('=== Creating checkout session ===');
    
    // Verifica se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para assinar um plano' },
        { status: 401 }
      );
    }

    console.log(`User ID: ${user.id}, Price ID: ${priceId}`);

    // Verifica se o usuário já tem um ID de cliente no Stripe
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId: string;
    
    // Se o usuário já tem um ID de cliente, usa ele
    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
      console.log(`Cliente existente: ${customerId}`);
    } else {
      // Se não, cria um novo cliente no Stripe
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('user_id', user.id)
        .single();

      const customer = await stripe.customers.create({
        email: profile?.email || user.email || '',
        name: profile?.name || '',
        metadata: {
          userId: user.id,
        },
      });
      
      customerId = customer.id;
      console.log(`Novo cliente criado: ${customerId}`);
    }

    // Cria uma sessão de checkout
    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId: user.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    );
  }
}
