'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

// Componente que usa useSearchParams
function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchSubscription, subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      router.push('/dashboard/subscription');
      return;
    }

    // Se já verificamos a sessão com sucesso, não precisamos verificar novamente
    if (sessionChecked && verificationSuccess) {
      return;
    }

    const checkSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Verifica o status da sessão diretamente no Stripe
        console.log(`Verificando sessão: ${sessionId}, tentativa: ${retryCount + 1}`);
        const response = await fetch(`/api/subscriptions/check-session?session_id=${sessionId}`, {
          // Adiciona cache: no-store para evitar problemas de cache
          cache: 'no-store',
          // Adiciona um timeout para evitar que a requisição fique pendente indefinidamente
          signal: AbortSignal.timeout(15000) // 15 segundos de timeout
        });
        
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Se a sessão foi bem-sucedida, busca os dados da assinatura
        if (data.success) {
          console.log('Sessão confirmada como paga, atualizando dados da assinatura');
          
          try {
            // Espera 2 segundos para garantir que o banco de dados foi atualizado
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Busca os dados atualizados da assinatura
            await fetchSubscription();
            
            setVerificationSuccess(true);
            setIsLoading(false);
            setSessionChecked(true);
            
            toast.success('Assinatura ativada com sucesso!');
          } catch (fetchError) {
            console.error('Erro ao buscar dados da assinatura:', fetchError);
            // Mesmo com erro, consideramos sucesso e tentamos novamente mais tarde
            setVerificationSuccess(true);
            setIsLoading(false);
            setSessionChecked(true);
            toast.success('Pagamento confirmado! Os detalhes da assinatura serão atualizados em breve.');
          }
        } else {
          // Se ainda não foi processada, tenta novamente após um intervalo
          if (retryCount < 5) {
            console.log(`Sessão ainda não está pronta (${data.status}), tentando novamente em 3 segundos...`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 3000);
          } else {
            // Após várias tentativas, busca a assinatura de qualquer forma
            console.log('Atingido número máximo de tentativas, buscando assinatura atual');
            try {
              await fetchSubscription();
              
              // Verifica se o usuário já está com plano premium
              if (subscription?.plan && subscription.plan.toString().toLowerCase() === 'premium') {
                setVerificationSuccess(true);
                toast.success('Assinatura premium encontrada!');
              } else {
                // Forçamos uma atualização manual da assinatura
                console.log('Tentando forçar atualização manual da assinatura');
                const manualResponse = await fetch(`/api/subscriptions/check-session?session_id=${sessionId}&force_update=true`, {
                  cache: 'no-store'
                });
                
                if (manualResponse.ok) {
                  // Busca os dados novamente após a atualização forçada
                  await fetchSubscription();
                  
                  if (subscription?.plan && subscription.plan.toString().toLowerCase() === 'premium') {
                    setVerificationSuccess(true);
                    toast.success('Assinatura premium ativada com sucesso!');
                  } else {
                    // Se após todas as tentativas ainda não está premium, mostra mensagem
                    toast.error('Não foi possível confirmar a assinatura. Por favor, contate o suporte.');
                  }
                } else {
                  toast.error('Não foi possível confirmar a assinatura. Por favor, contate o suporte.');
                }
              }
            } catch (error) {
              console.error('Erro ao verificar assinatura:', error);
              toast.error('Ocorreu um erro ao verificar sua assinatura. Por favor, tente novamente mais tarde.');
            } finally {
              setIsLoading(false);
              setSessionChecked(true);
            }
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar sessão:', error);
        
        // Tratamento especial para erros de sessão expirada ou não encontrada
        if (error.message.includes('404') || 
            error.message.includes('não encontrada') || 
            error.message.includes('expirada')) {
          setError('A sessão de pagamento expirou ou não foi encontrada. Por favor, tente realizar o pagamento novamente.');
        } else {
          setError(error.message || 'Ocorreu um erro ao verificar sua assinatura');
        }
        
        // Mesmo com erro, tentamos buscar a assinatura atual
        try {
          await fetchSubscription();
          
          // Se o usuário já tem assinatura premium, mostramos mensagem de sucesso
          if (subscription?.plan && subscription.plan.toString().toLowerCase() === 'premium') {
            setVerificationSuccess(true);
            toast.success('Você já possui uma assinatura premium ativa!');
          }
        } catch (subError) {
          console.error('Erro ao buscar assinatura atual:', subError);
        }
        
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    checkSession();
  }, [searchParams, fetchSubscription, router, retryCount, sessionChecked, verificationSuccess, subscription?.plan]);

  return (
    <div className="container mx-auto py-10 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {isLoading ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : error ? (
              <div className="h-16 w-16 text-red-500 flex items-center justify-center">!</div>
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isLoading ? 'Processando pagamento...' : error ? 'Erro ao processar' : 'Assinatura confirmada!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">
              Estamos verificando seu pagamento. Isso pode levar alguns instantes...
            </p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <p className="mb-4">
                Parabéns! Sua assinatura do plano <span className="font-bold">{subscription?.plan === 'premium' ? 'Premium' : 'Gratuito'}</span> foi confirmada com sucesso.
              </p>
              <p className="text-muted-foreground">
                Agora você tem acesso a todos os recursos do Studiefy. Aproveite!
              </p>
              {subscription?.plan !== 'premium' && (
                <p className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md text-sm">
                  <strong>Atenção:</strong> Seu plano ainda aparece como {subscription?.plan || 'gratuito'}. Se você acabou de fazer o pagamento, 
                  pode levar alguns minutos para que o sistema atualize. Se o problema persistir, 
                  por favor entre em contato com o suporte.
                </p>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button 
            onClick={() => router.push('/dashboard')}
            disabled={isLoading}
          >
            Voltar ao Dashboard
          </Button>
          {!isLoading && (
            <Button 
              variant="outline"
              onClick={() => {
                fetchSubscription();
                toast.info('Verificando status da assinatura...');
              }}
            >
              Verificar Assinatura
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Componente principal com Suspense
export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Carregando...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Estamos preparando a página de confirmação da sua assinatura...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
