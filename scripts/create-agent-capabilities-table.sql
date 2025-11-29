-- Create separate table for agent capabilities/passports
-- This is separate from agent_passports (which is for user passports only)

-- ============================================================================
-- AGENT_CAPABILITIES TABLE - Agent capabilities & performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Passport data (JSONB format)
    passport_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Performance metrics (can also be in passport_data, but stored here for easy querying)
    success_rate DECIMAL(5, 4) DEFAULT 0.0 CHECK (success_rate >= 0 AND success_rate <= 1),
    average_latency_ms INTEGER DEFAULT 0,
    total_uses INTEGER DEFAULT 0,
    
    version INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_id ON public.agent_capabilities(agent_id);

-- Enable RLS
ALTER TABLE public.agent_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access
DROP POLICY IF EXISTS "Agent capabilities are viewable by everyone" ON public.agent_capabilities;
CREATE POLICY "Agent capabilities are viewable by everyone" ON public.agent_capabilities
    FOR SELECT USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_agent_capabilities_updated_at ON public.agent_capabilities;
CREATE TRIGGER update_agent_capabilities_updated_at 
    BEFORE UPDATE ON public.agent_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

