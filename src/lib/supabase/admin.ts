import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Este cliente usa a chave de serviço e deve ser usado apenas no servidor
// para operações administrativas ou webhooks
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Priorizar a chave de serviço específica
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erro nas variáveis de ambiente do Supabase:', {
      urlDefined: !!supabaseUrl,
      keyDefined: !!supabaseServiceKey,
      keyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'undefined'
    });
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  
  // Log para debug (não mostrar a chave completa)
  console.log('Criando cliente admin do Supabase:', {
    url: supabaseUrl,
    keyPrefix: supabaseServiceKey.substring(0, 20) + '...',
    isServiceRole: supabaseServiceKey.includes('role\":\"service_role')
  });

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'x-supabase-auth-token': `service_role`
      }
    }
  });
}
