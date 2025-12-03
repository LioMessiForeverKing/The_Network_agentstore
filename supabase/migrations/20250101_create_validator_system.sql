-- Validator Agent System Migration
-- Creates tables for validation events and synthetic tasks

-- ============================================================================
-- 1. AGENT_VALIDATION_EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_validation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_log_id UUID REFERENCES public.agent_usage_logs(id) ON DELETE CASCADE,
  validator_agent_id UUID REFERENCES public.agents(id),
  score FLOAT CHECK (score >= 0 AND score <= 1),
  label TEXT CHECK (label IN ('PASS', 'FAIL', 'NEEDS_REVIEW')),
  error_type TEXT CHECK (error_type IN ('HALLUCINATION', 'MISSING_FIELD', 'BAD_FORMAT', 'OFF_POLICY', 'OTHER', 'NONE')),
  explanation TEXT,
  is_human BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent_validation_events
CREATE INDEX IF NOT EXISTS idx_validation_usage_log ON public.agent_validation_events(usage_log_id);
CREATE INDEX IF NOT EXISTS idx_validation_agent ON public.agent_validation_events(validator_agent_id);
CREATE INDEX IF NOT EXISTS idx_validation_label ON public.agent_validation_events(label);
CREATE INDEX IF NOT EXISTS idx_validation_created ON public.agent_validation_events(created_at);

-- RLS for agent_validation_events
ALTER TABLE public.agent_validation_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view validation events for their own usage logs
CREATE POLICY "Users can view their validation events" ON public.agent_validation_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_usage_logs
      WHERE agent_usage_logs.id = agent_validation_events.usage_log_id
      AND agent_usage_logs.user_id = auth.uid()
    )
  );

-- Policy: Service role can insert/update validation events
CREATE POLICY "Service role can manage validation events" ON public.agent_validation_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 2. SYNTHETIC_TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.synthetic_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug_candidate TEXT NOT NULL,
  task_type TEXT NOT NULL,
  task_spec_json JSONB NOT NULL,
  expected_shape JSONB,
  status TEXT CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
  usage_log_id UUID REFERENCES public.agent_usage_logs(id),
  validation_event_id UUID REFERENCES public.agent_validation_events(id),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for synthetic_tasks
CREATE INDEX IF NOT EXISTS idx_synthetic_status ON public.synthetic_tasks(status);
CREATE INDEX IF NOT EXISTS idx_synthetic_agent ON public.synthetic_tasks(agent_slug_candidate);
CREATE INDEX IF NOT EXISTS idx_synthetic_created ON public.synthetic_tasks(created_at);

-- RLS for synthetic_tasks
ALTER TABLE public.synthetic_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and service role can view/manage synthetic tasks
CREATE POLICY "Admins can manage synthetic tasks" ON public.synthetic_tasks
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        SELECT email FROM auth.users WHERE email LIKE '%@thenetwork.ai' OR email LIKE '%@admin.thenetwork.ai'
      )
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        SELECT email FROM auth.users WHERE email LIKE '%@thenetwork.ai' OR email LIKE '%@admin.thenetwork.ai'
      )
    )
  );

