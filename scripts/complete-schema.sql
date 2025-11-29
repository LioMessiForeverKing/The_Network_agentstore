-- Complete Agent Store Database Schema
-- Run this SQL in your Supabase SQL Editor
-- This creates all required tables for the Agent Store and Prime agent

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. AGENTS TABLE - Agent catalog registry
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    description TEXT NOT NULL,
    
    invocation_type TEXT NOT NULL CHECK (invocation_type IN (
        'INTERNAL_FUNCTION',
        'HTTP_ENDPOINT'
    )) DEFAULT 'INTERNAL_FUNCTION',
    
    invocation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    status TEXT NOT NULL DEFAULT 'EXPERIMENTAL' CHECK (status IN (
        'ACTIVE',
        'EXPERIMENTAL',
        'DISABLED'
    )),
    
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agents
CREATE INDEX IF NOT EXISTS idx_agents_slug ON public.agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_domain ON public.agents(domain);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);

-- ============================================================================
-- 2. AGENT_PASSPORTS TABLE - User passports only (for Stella instances)
-- ============================================================================
-- Note: This table is ONLY for user passports (Stella instances)
-- Agent capabilities are stored in agent_capabilities table (see below)

CREATE TABLE IF NOT EXISTS public.agent_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- For USER passports only
    user_id UUID, -- REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    handle_id UUID, -- For user passports (references agent_handles)
    dna_id UUID,    -- For user passports (references digital_dna_v2)
    
    -- Passport data (JSONB format)
    passport_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Permission settings
    public_fields JSONB DEFAULT '["handle", "composite_dna", "trust_score"]'::jsonb,
    authenticated_fields JSONB DEFAULT '["goals", "constraints", "capabilities"]'::jsonb,
    
    version INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one passport per user
    UNIQUE(user_id)
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add passport_data if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_passports' 
        AND column_name = 'passport_data'
    ) THEN
        ALTER TABLE public.agent_passports 
        ADD COLUMN passport_data JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add other columns if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_passports' 
        AND column_name = 'public_fields'
    ) THEN
        ALTER TABLE public.agent_passports 
        ADD COLUMN public_fields JSONB DEFAULT '["handle", "composite_dna", "trust_score"]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_passports' 
        AND column_name = 'authenticated_fields'
    ) THEN
        ALTER TABLE public.agent_passports 
        ADD COLUMN authenticated_fields JSONB DEFAULT '["goals", "constraints", "capabilities"]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_passports' 
        AND column_name = 'version'
    ) THEN
        ALTER TABLE public.agent_passports ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_passports' 
        AND column_name = 'last_updated'
    ) THEN
        ALTER TABLE public.agent_passports ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Indexes for agent_passports
CREATE INDEX IF NOT EXISTS idx_agent_passports_user_id ON public.agent_passports(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_passports_handle_id ON public.agent_passports(handle_id);

-- ============================================================================
-- 2B. AGENT_CAPABILITIES TABLE - Agent capabilities & performance
-- ============================================================================
-- Separate table for agent passports (Prime, Study Planner, etc.)
-- This is separate from agent_passports which is for user passports only

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

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_agent_capabilities_updated_at ON public.agent_capabilities;
CREATE TRIGGER update_agent_capabilities_updated_at 
    BEFORE UPDATE ON public.agent_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. AGENT_USAGE_LOGS TABLE - Complete audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Stella Identifier
    stella_handle TEXT NOT NULL,  -- @firstname.lastname.network
    
    -- Agent Reference
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    -- NULL if this is Stella's own action (not routed to agent)
    
    -- User Reference
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Task Information
    task_type TEXT NOT NULL,
    task_description TEXT,
    
    -- Full Context
    full_context_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    routing_metadata JSONB,
    task_steps JSONB,
    
    -- Input/Output
    input_json JSONB,
    output_json JSONB,
    
    -- Results
    resulting_event_id UUID, -- References weekly_activities(id) when created
    success_flag BOOLEAN DEFAULT true,
    latency_ms INTEGER,
    error_message TEXT,
    
    -- Multi-Agent Chain
    parent_usage_log_id UUID REFERENCES public.agent_usage_logs(id) ON DELETE SET NULL,
    chain_position INTEGER,
    
    -- User Feedback
    user_feedback TEXT,
    user_feedback_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent_usage_logs
CREATE INDEX IF NOT EXISTS idx_agent_usage_stella_handle ON public.agent_usage_logs(stella_handle);
CREATE INDEX IF NOT EXISTS idx_agent_usage_agent ON public.agent_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_user ON public.agent_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_event ON public.agent_usage_logs(resulting_event_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_task_type ON public.agent_usage_logs(task_type);
CREATE INDEX IF NOT EXISTS idx_agent_usage_created ON public.agent_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_usage_parent ON public.agent_usage_logs(parent_usage_log_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_success ON public.agent_usage_logs(success_flag, created_at);

-- ============================================================================
-- 4. WEEKLY_ACTIVITIES TABLE - Events created by Prime
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_weekly_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic Activity Info
    activity_description TEXT NOT NULL,
    event_name TEXT,
    location TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    week_start DATE NOT NULL,
    
    -- Event-Specific Fields
    tags TEXT[],
    is_hosting BOOLEAN DEFAULT true,
    event_image_url TEXT,
    event_title TEXT,
    max_capacity INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    shared_with_stella_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for weekly_activities
CREATE INDEX IF NOT EXISTS idx_weekly_activities_user_week 
    ON public.user_weekly_activities(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_activities_location 
    ON public.user_weekly_activities(location) 
    WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_weekly_activities_tags 
    ON public.user_weekly_activities USING GIN(tags)
    WHERE tags IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_weekly_activities_hosting 
    ON public.user_weekly_activities(is_hosting, start_date)
    WHERE is_hosting = true AND start_date IS NOT NULL;

-- ============================================================================
-- 5. EVENT_ATTENDEES TABLE - Invites and attendance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.user_weekly_activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'maybe', 'declined')) 
        DEFAULT 'pending',
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Indexes for event_attendees
CREATE INDEX IF NOT EXISTS idx_event_attendees_event 
    ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user 
    ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status 
    ON public.event_attendees(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_status 
    ON public.event_attendees(user_id, status)
    WHERE status = 'confirmed';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_weekly_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents (public read)
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON public.agents;
CREATE POLICY "Agents are viewable by everyone" ON public.agents
    FOR SELECT USING (true);

-- RLS Policies for agent_passports (public read for user passports)
DROP POLICY IF EXISTS "Agent passports are viewable by everyone" ON public.agent_passports;
CREATE POLICY "Agent passports are viewable by everyone" ON public.agent_passports
    FOR SELECT USING (true);

-- RLS Policies for agent_capabilities (public read)
DROP POLICY IF EXISTS "Agent capabilities are viewable by everyone" ON public.agent_capabilities;
CREATE POLICY "Agent capabilities are viewable by everyone" ON public.agent_capabilities
    FOR SELECT USING (true);

-- RLS Policies for agent_usage_logs (users can only see their own logs)
DROP POLICY IF EXISTS "Users can view their own usage logs" ON public.agent_usage_logs;
CREATE POLICY "Users can view their own usage logs" ON public.agent_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage logs" ON public.agent_usage_logs;
CREATE POLICY "Users can insert their own usage logs" ON public.agent_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_activities (users can see their own events and public events)
DROP POLICY IF EXISTS "Users can view their own events" ON public.user_weekly_activities;
CREATE POLICY "Users can view their own events" ON public.user_weekly_activities
    FOR SELECT USING (auth.uid() = user_id OR is_hosting = true);

DROP POLICY IF EXISTS "Users can create their own events" ON public.user_weekly_activities;
CREATE POLICY "Users can create their own events" ON public.user_weekly_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for event_attendees (users can see their own invites and event attendees)
DROP POLICY IF EXISTS "Users can view their own invites" ON public.event_attendees;
CREATE POLICY "Users can view their own invites" ON public.event_attendees
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;
CREATE POLICY "Users can view event attendees" ON public.event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_weekly_activities
            WHERE id = event_attendees.event_id
            AND user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_passports_updated_at ON public.agent_passports;
CREATE TRIGGER update_agent_passports_updated_at 
    BEFORE UPDATE ON public.agent_passports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_usage_logs_updated_at ON public.agent_usage_logs;
CREATE TRIGGER update_agent_usage_logs_updated_at 
    BEFORE UPDATE ON public.agent_usage_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT PRIME AGENT
-- ============================================================================

-- Insert Prime agent
INSERT INTO public.agents (
    name,
    slug,
    domain,
    description,
    invocation_type,
    invocation_config,
    status,
    version
) VALUES (
    'Prime',
    'prime',
    'EVENT_PLANNING',
    'Creates events, finds network matches, sends invites',
    'INTERNAL_FUNCTION',
    '{
        "function_name": "prime-agent",
        "endpoint": "/api/agents/prime/execute",
        "method": "POST"
    }'::jsonb,
    'ACTIVE',
    1
)
ON CONFLICT (slug) DO UPDATE SET
    domain = EXCLUDED.domain,
    description = EXCLUDED.description,
    invocation_type = EXCLUDED.invocation_type,
    invocation_config = EXCLUDED.invocation_config,
    status = EXCLUDED.status,
    updated_at = NOW();

-- ============================================================================
-- CREATE PRIME AGENT CAPABILITIES
-- ============================================================================

-- Get Prime agent ID and create capabilities
DO $$
DECLARE
    prime_agent_id UUID;
BEGIN
    -- Get Prime agent ID
    SELECT id INTO prime_agent_id FROM public.agents WHERE slug = 'prime';
    
    IF prime_agent_id IS NOT NULL THEN
        -- Insert or update Prime agent capabilities
        INSERT INTO public.agent_capabilities (
            agent_id,
            passport_data,
            version
        ) VALUES (
            prime_agent_id,
            '{
                "@context": "https://thenetwork.ai/passport/v1",
                "@type": "SpecialistAgent",
                "agent_slug": "prime",
                "name": "Prime",
                "domain": "EVENT_PLANNING",
                "capabilities": {
                    "supported_task_types": [
                        "EVENT_PLANNING",
                        "EVENT_UPDATE",
                        "EVENT_DELETE",
                        "NETWORK_MATCHING"
                    ],
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "required": true
                            },
                            "date": {
                                "type": "string",
                                "format": "ISO8601",
                                "required": true
                            },
                            "time": {
                                "type": "string"
                            },
                            "theme": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "max_attendees": {
                                "type": "number",
                                "maximum": 50
                            }
                        }
                    },
                    "output_schema": {
                        "type": "object",
                        "properties": {
                            "event_id": {
                                "type": "UUID"
                            },
                            "invites_sent": {
                                "type": "number"
                            },
                            "matches_found": {
                                "type": "number"
                            }
                        }
                    }
                },
                "trust_metrics": {
                    "success_rate": 0.0,
                    "average_latency_ms": 0,
                    "total_uses": 0
                },
                "constraints": {
                    "max_attendees": 50,
                    "jurisdictions": ["US", "CA"]
                },
                "preferences": {
                    "preferred_task_types": ["EVENT_PLANNING", "NETWORK_MATCHING"]
                },
                "version": "1.0"
            }'::jsonb,
            1
        )
        ON CONFLICT (agent_id) DO UPDATE SET
            passport_data = EXCLUDED.passport_data,
            version = EXCLUDED.version,
            last_updated = NOW();
        
        RAISE NOTICE 'Created Prime agent capabilities';
    ELSE
        RAISE NOTICE 'Prime agent not found - capabilities will be created when Prime agent is created';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to verify)
-- ============================================================================

-- Verify tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('agents', 'agent_passports', 'agent_capabilities', 'agent_usage_logs', 'user_weekly_activities', 'event_attendees');

-- Verify Prime agent exists
-- SELECT * FROM public.agents WHERE slug = 'prime';

-- Verify Prime capabilities exist
-- SELECT ac.* FROM public.agent_capabilities ac
-- JOIN public.agents a ON a.id = ac.agent_id
-- WHERE a.slug = 'prime';

