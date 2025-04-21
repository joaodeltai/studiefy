-- Criação da tabela stripe_events para rastrear eventos processados
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar índice para pesquisa rápida por event_id
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(event_id);

-- Configurar RLS (Row Level Security)
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas administradores possam ler eventos
CREATE POLICY "Apenas administradores podem ler eventos do Stripe" 
ON stripe_events FOR SELECT 
USING (auth.role() = 'service_role');

-- Política para permitir que apenas o serviço possa inserir eventos
CREATE POLICY "Apenas o serviço pode inserir eventos do Stripe" 
ON stripe_events FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Comentários para documentação
COMMENT ON TABLE stripe_events IS 'Tabela para rastrear eventos do Stripe que já foram processados';
COMMENT ON COLUMN stripe_events.event_id IS 'ID único do evento no Stripe';
COMMENT ON COLUMN stripe_events.event_type IS 'Tipo do evento (ex: checkout.session.completed)';
COMMENT ON COLUMN stripe_events.processed_at IS 'Data e hora em que o evento foi processado';
