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
        const response = await fetch(`/api/subscriptions/check-session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Se a sessão foi bem-sucedida, busca os dados da assinatura
        if (data.success) {
          console.log('Sessão confirmada como paga, atualizando dados da assinatura');
          
          // Espera 2 segundos para garantir que o banco de dados foi atualizado
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Busca os dados atualizados da assinatura
          await fetchSubscription();
          
          setVerificationSuccess(true);
          setIsLoading(false);
          setSessionChecked(true);
          
          toast.success('Assinatura ativada com sucesso!');
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
            await fetchSubscription();
            setIsLoading(false);
            setSessionChecked(true);
            
            // Verifica se o usuário já está com plano premium
            if (subscription?.plan === 'premium') {
              setVerificationSuccess(true);
              toast.success('Assinatura premium encontrada!');
            } else {
              // Se após todas as tentativas ainda não está premium, mostra mensagem
              toast.error('Não foi possível confirmar a assinatura. Por favor, contate o suporte.');
            }
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar sessão:', error);
        setError(error.message || 'Ocorreu um erro ao verificar sua assinatura');
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
