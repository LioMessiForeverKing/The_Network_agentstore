-- Check Prime agent invocation_config
-- Run this to verify Prime has the correct invocation_config

SELECT 
    id,
    name,
    slug,
    status,
    invocation_type,
    invocation_config,
    CASE 
        WHEN invocation_config IS NULL THEN 'MISSING'
        WHEN invocation_config->>'invocation_type' IS NULL THEN 'MISSING invocation_type'
        WHEN invocation_config->>'function_name' IS NULL THEN 'MISSING function_name'
        ELSE 'OK'
    END as config_status
FROM agents
WHERE slug = 'prime';

-- If invocation_config is missing or wrong, fix it:
UPDATE agents
SET 
    invocation_type = 'INTERNAL_FUNCTION',
    invocation_config = '{
        "function_name": "prime-agent",
        "endpoint": "/functions/v1/prime-agent",
        "method": "POST"
    }'::jsonb
WHERE slug = 'prime';

-- Verify after update
SELECT 
    slug,
    invocation_type,
    invocation_config
FROM agents
WHERE slug = 'prime';

