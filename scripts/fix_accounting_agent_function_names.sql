-- Fix Accounting Agent Function Names
-- The v1 migration set function_name to "invoice-extractor", but the folder is "invoice-extractor-v1".
-- This script aligns them so Gaia calls the correct endpoint.

UPDATE public.agents
SET invocation_config = jsonb_set(
  invocation_config,
  '{function_name}',
  '"invoice-extractor-v1"'
)
WHERE slug = 'invoice-extractor-v1';

UPDATE public.agents
SET invocation_config = jsonb_set(
  invocation_config,
  '{function_name}',
  '"accounting-classifier-v1"'
)
WHERE slug = 'accounting-classifier-v1';

