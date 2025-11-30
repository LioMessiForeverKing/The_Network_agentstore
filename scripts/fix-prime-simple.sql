-- Simple fix for Prime Agent - Run this in Supabase SQL Editor

-- 1. Create Prime agent if it doesn't exist
INSERT INTO agents (
    name, slug, domain, description, invocation_type, invocation_config, status, version
) 
SELECT 
    'Prime', 'prime', 'EVENT_PLANNING', 
    'Creates events, finds network matches, sends invites',
    'INTERNAL_FUNCTION',
    '{"function_name": "prime-agent", "endpoint": "/functions/v1/prime-agent", "method": "POST"}'::jsonb,
    'ACTIVE', 1
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'prime')
ON CONFLICT (slug) DO UPDATE SET status = 'ACTIVE';

-- 2. Create/Update Prime capabilities (simplified - no trigger issues)
DO $$
DECLARE
    prime_agent_id UUID;
BEGIN
    SELECT id INTO prime_agent_id FROM agents WHERE slug = 'prime';
    
    IF prime_agent_id IS NOT NULL THEN
        -- Delete existing capabilities first to avoid trigger issues
        DELETE FROM agent_capabilities WHERE agent_id = prime_agent_id;
        
        -- Insert new capabilities
        INSERT INTO agent_capabilities (
            agent_id,
            passport_data,
            success_rate,
            average_latency_ms,
            total_uses,
            version
        ) VALUES (
            prime_agent_id,
            '{
                "capabilities": {
                    "supported_task_types": [
                        "EVENT_PLANNING",
                        "EVENT_UPDATE",
                        "EVENT_DELETE",
                        "NETWORK_MATCHING"
                    ]
                }
            }'::jsonb,
            0.0,
            0,
            0,
            1
        );
        
        RAISE NOTICE 'Prime agent capabilities created for agent_id: %', prime_agent_id;
    END IF;
END $$;

-- 3. Verify
SELECT 
    a.name,
    a.slug,
    a.status,
    ac.passport_data->'capabilities'->'supported_task_types' as supported_types
FROM agents a
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.slug = 'prime';

