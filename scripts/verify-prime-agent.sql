-- Verify Prime Agent Setup
-- Run this to check if Prime agent and capabilities are properly configured

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

-- 3. Check all active agents
SELECT 
    a.slug,
    a.name,
    a.status,
    CASE 
        WHEN ac.id IS NOT NULL THEN 'Has capabilities'
        ELSE 'Missing capabilities'
    END as capabilities_status
FROM agents a
LEFT JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.status = 'ACTIVE';

-- 4. If Prime is missing, you can create it with:
/*
INSERT INTO agents (
    name, slug, domain, description, invocation_type, invocation_config, status, version
) VALUES (
    'Prime',
    'prime',
    'EVENT_PLANNING',
    'Creates events, finds network matches, sends invites',
    'INTERNAL_FUNCTION',
    '{"function_name": "prime-agent", "endpoint": "/functions/v1/prime-agent", "method": "POST"}'::jsonb,
    'ACTIVE',
    1
) ON CONFLICT (slug) DO UPDATE SET status = 'ACTIVE';

-- Then create capabilities (see complete-schema.sql for full passport_data)
*/

