-- Fix RLS policies for agent_validation_events
-- Ensure admins and service role can view all validation events

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their validation events" ON public.agent_validation_events;
DROP POLICY IF EXISTS "Service role can manage validation events" ON public.agent_validation_events;

-- Policy: Service role can do everything (insert, select, update, delete)
-- This should work with createAdminClient() which uses service role key
CREATE POLICY "Service role can manage validation events" ON public.agent_validation_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

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

