-- Insert Validator Agent
-- Run this after creating the validator-agent edge function

-- Insert Validator agent
INSERT INTO agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES (
  'Validator',
  'validator',
  'Evaluates and scores agent outputs for quality assurance',
  'EVALUATION',
  'ACTIVE',
  'INTERNAL_FUNCTION',
  '{"function_name": "validator-agent", "endpoint": "/functions/v1/validator-agent", "method": "POST"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config,
  updated_at = NOW();

-- Insert capabilities (get the agent_id first)
INSERT INTO agent_capabilities (
  agent_id,
  supported_task_types,
  passport_data,
  success_rate,
  average_latency_ms,
  total_uses
)
SELECT 
  id,
  ARRAY['VALIDATION'],
  '{
    "type": "validator",
    "capabilities": {
      "supported_task_types": ["VALIDATION"],
      "supported_domains": ["EVENT_PLANNING", "GOAL_PLANNING", "STUDY_HELP", "SOCIAL_INTRO"]
    },
    "input_schema": {
      "original_task_spec": "object",
      "agent_output": "object",
      "agent_slug": "string",
      "rubric": "object (optional)"
    },
    "output_schema": {
      "score": "number (0-1)",
      "label": "string (PASS|FAIL|NEEDS_REVIEW)",
      "error_type": "string",
      "explanation": "string"
    },
    "risk_level": "low",
    "cost_level": "medium",
    "latency_target_ms": 3000,
    "constraints": {
      "max_context_tokens": 8000
    },
    "required_trust_threshold": 0.5
  }'::jsonb,
  0,
  0,
  0
FROM agents WHERE slug = 'validator'
ON CONFLICT (agent_id) DO UPDATE SET
  supported_task_types = EXCLUDED.supported_task_types,
  passport_data = EXCLUDED.passport_data,
  last_updated = NOW();

