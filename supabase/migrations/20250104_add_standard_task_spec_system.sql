-- Standard Task Spec System Migration
-- Adds input_format declaration to agent passports for transformation

-- ============================================================================
-- 1. Update Prime Agent Passport with input_format
-- ============================================================================
UPDATE public.agent_capabilities
SET passport_data = jsonb_set(
  passport_data,
  '{capabilities,input_format}',
  '"nlp_create"'
)
WHERE agent_id IN (
  SELECT id FROM public.agents WHERE slug = 'prime'
)
AND passport_data->'capabilities' IS NOT NULL;

-- Also add preferred_fields for Prime
UPDATE public.agent_capabilities
SET passport_data = jsonb_set(
  jsonb_set(
    passport_data,
    '{capabilities,preferred_fields}',
    '{"action": "nlp_create", "auto_invite": false}'::jsonb
  ),
  '{capabilities,input_transformation}',
  '{
    "action_field": "context.action",
    "message_field": "context.message"
  }'::jsonb
)
WHERE agent_id IN (
  SELECT id FROM public.agents WHERE slug = 'prime'
)
AND passport_data->'capabilities' IS NOT NULL;

-- ============================================================================
-- 2. Add default input_format to existing agents (if not set)
-- ============================================================================
-- For agents without input_format, default to 'standard' (no transformation)
UPDATE public.agent_capabilities
SET passport_data = jsonb_set(
  passport_data,
  '{capabilities,input_format}',
  '"standard"'
)
WHERE passport_data->'capabilities'->>'input_format' IS NULL
AND passport_data->'capabilities' IS NOT NULL;

