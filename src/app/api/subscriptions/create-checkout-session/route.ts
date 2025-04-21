import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { stripe, createCheckoutSession } from '@/lib/stripe';
import { SubscriptionPlan } from '@/types/subscription';

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
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Erro ao buscar assinatura:', subscriptionError);
    }

    let customerId: string | undefined;
    
    // Se o usuário já tem um ID de cliente válido, usa ele
    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
      console.log(`Cliente existente: ${customerId}`);
      
      // Verifica se o cliente existe no Stripe
      try {
        if (!stripe) {
          throw new Error('Cliente Stripe não inicializado');
        }
        
        // Garantimos que customerId não seja undefined neste ponto
        if (customerId) {
          const existingCustomer = await stripe.customers.retrieve(customerId);
          
          if (existingCustomer.deleted) {
            console.log(`Cliente ${customerId} foi excluído no Stripe, criando um novo...`);
            customerId = undefined; // Força a criação de um novo cliente
          }
        }
      } catch (error: any) {
        console.error(`Erro ao verificar cliente ${customerId}:`, error.message);
        customerId = undefined; // Força a criação de um novo cliente
      }
    }
    
    // Se não tem um ID válido, cria um novo cliente no Stripe
    if (!customerId) {
      // Busca o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }

      const email = profile?.email || user.email || 'usuario@exemplo.com';
      const name = profile?.name || email.split('@')[0];
      
      console.log(`Criando novo cliente para ${email}`);
      
      try {
        if (!stripe) {
          throw new Error('Cliente Stripe não inicializado');
        }
        
        const customer = await stripe.customers.create({
          email: email,
          name: name,
          metadata: {
            userId: user.id,
          },
        });
        
        customerId = customer.id;
        console.log(`Novo cliente criado: ${customerId}`);
        
        // Salva o ID do cliente no banco de dados para uso futuro
        const { error: updateError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_customer_id: customerId,
            // Garantir que o status seja definido para evitar erro de restrição de não nulo
            status: 'pending', // Status inicial antes da confirmação do pagamento
            plan: 'free', // Plano padrão até a confirmação da assinatura premium
            period: 'monthly', // Período padrão
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          
        if (updateError) {
          console.error('Erro ao salvar ID do cliente:', updateError);
        }
      } catch (error: any) {
        console.error('Erro ao criar cliente no Stripe:', error);
        throw new Error(`Erro ao criar cliente no Stripe: ${error.message}`);
      }
    }
    
    if (!customerId) {
      throw new Error('Não foi possível obter ou criar um ID de cliente válido');
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
