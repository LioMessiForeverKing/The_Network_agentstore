-- Fix Atlas agent endpoint
-- The deployed function is named "Atlas" (capital A)
-- function_name is already correct, but endpoint still points to "atlas-agent"
-- Update endpoint to match the actual deployed function name

UPDATE agents 
SET invocation_config = jsonb_set(
  invocation_config,
  '{endpoint}',
  to_jsonb(replace(invocation_config->>'endpoint', 'atlas-agent', 'Atlas'))
)
WHERE slug = 'atlas';

-- Verify the update
SELECT 
  slug,
  name,
  status,
  invocation_config->>'function_name' as function_name,
  invocation_config->>'endpoint' as endpoint
FROM agents 
WHERE slug = 'atlas';

