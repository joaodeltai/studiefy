// Teste de conexão com o Supabase
import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  console.log("Testando conexão com Supabase...");
  
  try {
    // Teste de consulta básica
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("Erro na consulta:", error);
    } else {
      console.log("Consulta bem-sucedida:", data ? "Dados encontrados" : "Nenhum dado encontrado");
    }
    
    return { success: !error, data, error };
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    return { success: false, error };
  }
}

// Executar o teste se este arquivo for executado diretamente
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection;
  console.log("Função de teste disponível como window.testSupabaseConnection()");
}

export { testSupabaseConnection };
