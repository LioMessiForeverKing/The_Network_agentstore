-- Verify and Fix Prime Agent Setup
-- Run this in Supabase SQL Editor to ensure Prime is properly configured

-- 1. Check if Prime agent exists
SELECT 
    id,
    name,
    slug,
    domain,
    status,
    invocation_type,
    invocation_config
FROM agents
WHERE slug = 'prime';

-- 2. Check if Prime has capabilities
SELECT 
    ac.id,
    ac.agent_id,
    ac.passport_data->'capabilities'->'supported_task_types' as supported_task_types,
    ac.success_rate,
    ac.total_uses
FROM agent_capabilities ac
JOIN agents a ON a.id = ac.agent_id
WHERE a.slug = 'prime';

-- 3. If Prime doesn't exist, create it
INSERT INTO agents (
    name,
    slug,
    domain,
    description,
    invocation_type,
    invocation_config,
    status,
    version
) 
SELECT 
    'Prime',
    'prime',
    'EVENT_PLANNING',
    'Creates events, finds network matches, sends invites',
    'INTERNAL_FUNCTION',
    '{"function_name": "prime-agent", "endpoint": "/functions/v1/prime-agent", "method": "POST"}'::jsonb,
    'ACTIVE',
    1
WHERE NOT EXISTS (
    SELECT 1 FROM agents WHERE slug = 'prime'
)
ON CONFLICT (slug) DO UPDATE SET
    domain = EXCLUDED.domain,
    description = EXCLUDED.description,
    invocation_type = EXCLUDED.invocation_type,
    invocation_config = EXCLUDED.invocation_config,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 4. Create/Update Prime capabilities
DO $$
DECLARE
    prime_agent_id UUID;
BEGIN
    -- Get Prime agent ID
    SELECT id INTO prime_agent_id FROM agents WHERE slug = 'prime';
    
    IF prime_agent_id IS NOT NULL THEN
        -- Insert or update Prime agent capabilities
        INSERT INTO agent_capabilities (
            agent_id,
            passport_data,
            success_rate,
            average_latency_ms,
            total_uses,
            version
        ) 
        SELECT 
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
                            "location": {"type": "string", "required": true},
                            "date": {"type": "string", "format": "ISO8601", "required": true},
                            "time": {"type": "string"},
                            "theme": {"type": "array", "items": {"type": "string"}},
                            "max_attendees": {"type": "number", "maximum": 50}
                        }
                    },
                    "output_schema": {
                        "type": "object",
                        "properties": {
                            "event_id": {"type": "UUID"},
                            "invites_sent": {"type": "number"},
                            "matches_found": {"type": "number"}
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
                }
            }'::jsonb,
            0.0,
            0,
            0,
            1
        ON CONFLICT (agent_id) DO UPDATE SET
            passport_data = EXCLUDED.passport_data,
            version = EXCLUDED.version,
            last_updated = NOW();
        
        RAISE NOTICE 'Prime agent capabilities created/updated for agent_id: %', prime_agent_id;
    ELSE
        RAISE NOTICE 'Prime agent not found. Please create it first.';
    END IF;
END $$;

-- 5. Verify the setup
SELECT 
    a.name,
    a.slug,
    a.status,
    ac.passport_data->'capabilities'->'supported_task_types' as supported_task_types,
    CASE 
        WHEN ac.id IS NOT NULL THEN 'Has capabilities'
        ELSE 'Missing capabilities'
    END as capabilities_status
FROM agents a
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.slug = 'prime';

