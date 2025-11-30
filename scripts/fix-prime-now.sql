-- FIX PRIME AGENT - Run this NOW in Supabase SQL Editor
-- This will fix the "Agent prime has no capabilities" error

-- Step 1: Make sure Prime agent exists and is ACTIVE
INSERT INTO agents (
    name, slug, domain, description, invocation_type, invocation_config, status, version
) 
VALUES (
    'Prime', 'prime', 'EVENT_PLANNING', 
    'Creates events, finds network matches, sends invites',
    'INTERNAL_FUNCTION',
    '{"function_name": "prime-agent", "endpoint": "/functions/v1/prime-agent", "method": "POST"}'::jsonb,
    'ACTIVE', 1
)
ON CONFLICT (slug) DO UPDATE SET 
    status = 'ACTIVE',
    domain = EXCLUDED.domain,
    invocation_type = EXCLUDED.invocation_type,
    invocation_config = EXCLUDED.invocation_config;

-- Step 2: Delete any existing capabilities (clean slate)
DELETE FROM agent_capabilities 
WHERE agent_id = (SELECT id FROM agents WHERE slug = 'prime');

-- Step 3: Insert Prime capabilities with EVENT_PLANNING
INSERT INTO agent_capabilities (
    agent_id,
    passport_data,
    success_rate,
    average_latency_ms,
    total_uses,
    version
)
SELECT 
    id,
    '{"capabilities": {"supported_task_types": ["EVENT_PLANNING", "EVENT_UPDATE", "EVENT_DELETE", "NETWORK_MATCHING"]}}'::jsonb,
    0.0,
    0,
    0,
    1
FROM agents
WHERE slug = 'prime';

-- Step 4: Verify it worked
SELECT 
    a.name,
    a.slug,
    a.status,
    ac.id as capability_id,
    ac.passport_data->'capabilities'->'supported_task_types' as supported_types
FROM agents a
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.slug = 'prime';

-- If you see supported_types with ["EVENT_PLANNING", ...], it worked!

