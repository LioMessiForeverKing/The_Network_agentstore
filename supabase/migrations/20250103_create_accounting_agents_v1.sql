-- Create Accounting v1 Agents
-- This migration creates the specialized agents required for the Enterprise Workflow demo.

-- 1. Invoice Extractor Agent
INSERT INTO public.agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES (
  'Invoice Extractor v1',
  'invoice-extractor-v1',
  'Specialized agent that extracts structured data (vendor, date, line items, totals) from raw invoice text or PDFs.',
  'FINANCE',
  'ACTIVE',
  'INTERNAL_FUNCTION',
  '{"function_name": "invoice-extractor", "method": "POST"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config;

-- 2. Accounting Classifier Agent
INSERT INTO public.agents (name, slug, description, domain, status, invocation_type, invocation_config)
VALUES (
  'Accounting Classifier v1',
  'accounting-classifier-v1',
  'Specialized agent that maps extracted invoice data to a Chart of Accounts code (e.g., 6100 Office Supplies).',
  'FINANCE',
  'ACTIVE',
  'INTERNAL_FUNCTION',
  '{"function_name": "accounting-classifier", "method": "POST"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  invocation_type = EXCLUDED.invocation_type,
  invocation_config = EXCLUDED.invocation_config;

-- 3. Add Capabilities (Passports) for these agents
-- We need to get their IDs first, so we use a DO block or CTE.

WITH new_agents AS (
  SELECT id, slug FROM public.agents WHERE slug IN ('invoice-extractor-v1', 'accounting-classifier-v1')
)
INSERT INTO public.agent_capabilities (agent_id, passport_data, success_rate, average_latency_ms, total_uses)
SELECT 
  id, 
  CASE 
    WHEN slug = 'invoice-extractor-v1' THEN 
      '{
        "capabilities": {
          "supported_task_types": ["INVOICE_EXTRACTION"],
          "input_format": "standard",
          "output_format": "json",
          "constraints": {
            "max_input_tokens": 16000
          }
        },
        "metrics": {
          "average_validator_score": 0.95
        }
      }'::jsonb
    WHEN slug = 'accounting-classifier-v1' THEN 
      '{
        "capabilities": {
          "supported_task_types": ["ACCOUNTING_CLASSIFICATION"],
          "input_format": "structured",
          "output_format": "json"
        },
        "metrics": {
          "average_validator_score": 0.92
        }
      }'::jsonb
  END,
  0.95, -- Initial high success rate for demo
  CASE WHEN slug = 'invoice-extractor-v1' THEN 1200 ELSE 800 END, -- Latency estimates
  10 -- Initial total uses to avoid "Newness" penalty in demo
FROM new_agents
ON CONFLICT (agent_id) DO UPDATE SET
  passport_data = EXCLUDED.passport_data,
  success_rate = EXCLUDED.success_rate,
  average_latency_ms = EXCLUDED.average_latency_ms;

