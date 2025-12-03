-- Fix Missing Capabilities for Experimental Agents
-- This script adds capabilities to all experimental agents that don't have them

-- First, check how many agents are missing capabilities
SELECT 
  'Agents missing capabilities:' as info,
  COUNT(*) as count
FROM agents a
WHERE a.status = 'EXPERIMENTAL'
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id);

-- Insert capabilities for all experimental agents that don't have them
INSERT INTO agent_capabilities (
  agent_id,
  passport_data,
  success_rate,
  average_latency_ms,
  total_uses
)
SELECT 
  a.id as agent_id,
  jsonb_build_object(
    'type', 'tool',
    'capabilities', jsonb_build_object(
      'supported_task_types', jsonb_build_array(a.domain),
      'input_format', 'standard',
      'preferred_fields', '{}'::jsonb
    ),
    'input_schema', jsonb_build_object(
      'type', 'object',
      'properties', jsonb_build_object(
        'raw_message', jsonb_build_object('type', 'string'),
        'context', jsonb_build_object('type', 'object')
      )
    ),
    'output_schema', jsonb_build_object(
      'type', 'object',
      'properties', jsonb_build_object(
        'response', jsonb_build_object('type', 'string'),
        'data', jsonb_build_object('type', 'object'),
        'success', jsonb_build_object('type', 'boolean')
      )
    ),
    'risk_level', 'low',
    'cost_level', 'cheap',
    'latency_target_ms', 2000,
    'constraints', jsonb_build_object('max_context_tokens', 4000),
    'required_trust_threshold', 0.5
  ) as passport_data,
  0.5 as success_rate,
  0 as average_latency_ms,
  0 as total_uses
FROM agents a
WHERE a.status = 'EXPERIMENTAL'
  AND a.domain IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id
  );

-- Verify the fix
SELECT 
  'Total experimental agents:' as info,
  COUNT(*) as count
FROM agents 
WHERE status = 'EXPERIMENTAL';

SELECT 
  'Agents WITH capabilities:' as info,
  COUNT(*) as count
FROM agents a
JOIN agent_capabilities ac ON a.id = ac.agent_id
WHERE a.status = 'EXPERIMENTAL';

SELECT 
  'Agents STILL missing capabilities:' as info,
  COUNT(*) as count
FROM agents a
WHERE a.status = 'EXPERIMENTAL'
  AND NOT EXISTS (SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id);

-- Show sample of capabilities created
SELECT 
  a.name,
  a.slug,
  a.domain,
  ac.passport_data->'capabilities'->'supported_task_types' as supported_task_types
FROM agents a
JOIN agent_capabilities ac ON a.id = ac.agent_id
WHERE a.status = 'EXPERIMENTAL'
LIMIT 10;

