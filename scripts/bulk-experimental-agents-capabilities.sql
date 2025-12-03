-- Bulk Insert Agent Capabilities for Experimental Agents
-- Run this AFTER running parts 1-5 to create capabilities for all experimental agents

-- This script creates agent_capabilities entries for all agents that don't have one yet
-- It uses the domain as the supported_task_type and sets standard input_format

-- Note: agent_capabilities table has these columns:
--   id, agent_id, passport_data (JSONB), success_rate, average_latency_ms, total_uses, version, last_updated, created_at

INSERT INTO agent_capabilities (
  agent_id,
  passport_data,
  success_rate,
  average_latency_ms,
  total_uses
)
SELECT 
  a.id,
  jsonb_build_object(
    'type', 'tool',
    'capabilities', jsonb_build_object(
      'supported_task_types', jsonb_build_array(a.domain),
      'input_format', 'standard',
      'preferred_fields', jsonb_build_object()
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
    'constraints', jsonb_build_object(
      'max_context_tokens', 4000
    ),
    'required_trust_threshold', 0.5
  ),
  0.5,  -- Initial success rate
  0,    -- Initial average latency
  0     -- Initial total uses
FROM agents a
WHERE a.status = 'EXPERIMENTAL'
  AND a.domain IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM agent_capabilities ac WHERE ac.agent_id = a.id
  )
ON CONFLICT (agent_id) DO NOTHING;

-- Count how many capabilities were created
SELECT 
  COUNT(*) as total_experimental_agents,
  COUNT(ac.id) as agents_with_capabilities
FROM agents a
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
WHERE a.status = 'EXPERIMENTAL';

SELECT 'Agent capabilities inserted for all experimental agents' as status;

