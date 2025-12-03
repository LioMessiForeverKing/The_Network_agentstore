-- Agent Learning System Migration
-- Adds fields for reinforcement learning based on validator feedback

-- ============================================================================
-- 1. Add Learning Fields to agent_capabilities
-- ============================================================================
ALTER TABLE public.agent_capabilities 
ADD COLUMN IF NOT EXISTS recent_success_rate DECIMAL(5,4) CHECK (recent_success_rate >= 0 AND recent_success_rate <= 1),
ADD COLUMN IF NOT EXISTS validation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_validation_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trend TEXT CHECK (trend IN ('IMPROVING', 'STABLE', 'DECLINING'));

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_recent_success ON public.agent_capabilities(recent_success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_validation_count ON public.agent_capabilities(validation_count DESC);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_trend ON public.agent_capabilities(trend);

-- ============================================================================
-- 2. Create agent_validation_history table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_validation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  validation_event_id UUID REFERENCES public.agent_validation_events(id) ON DELETE CASCADE NOT NULL,
  reward DECIMAL(5,4) NOT NULL,
  success_rate_before DECIMAL(5,4) NOT NULL,
  success_rate_after DECIMAL(5,4) NOT NULL,
  learning_rate DECIMAL(5,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_validation_history_agent ON public.agent_validation_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_validation_history_validation ON public.agent_validation_history(validation_event_id);
CREATE INDEX IF NOT EXISTS idx_validation_history_created ON public.agent_validation_history(created_at DESC);

-- RLS for agent_validation_history
ALTER TABLE public.agent_validation_history ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage validation history
CREATE POLICY "Service role can manage validation history" ON public.agent_validation_history
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 3. Function to update agent capabilities based on validation
-- ============================================================================
CREATE OR REPLACE FUNCTION update_agent_learning(
  p_agent_id UUID,
  p_validation_score DECIMAL,
  p_validation_label TEXT
) RETURNS JSONB AS $$
DECLARE
  v_current_capabilities RECORD;
  v_reward DECIMAL(5,4);
  v_learning_rate DECIMAL(5,4);
  v_new_success_rate DECIMAL(5,4);
  v_recent_success_rate DECIMAL(5,4);
  v_validation_count INTEGER;
  v_trend TEXT;
  v_previous_success_rate DECIMAL(5,4);
BEGIN
  -- Get current capabilities
  SELECT 
    success_rate,
    recent_success_rate,
    validation_count,
    trend
  INTO v_current_capabilities
  FROM agent_capabilities
  WHERE agent_id = p_agent_id;

  -- If no capabilities found, return error
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Agent capabilities not found');
  END IF;

  v_previous_success_rate := COALESCE(v_current_capabilities.success_rate, 0.5);
  v_validation_count := COALESCE(v_current_capabilities.validation_count, 0);

  -- Calculate reward based on validation outcome
  -- Reward is the delta to apply to success_rate
  IF p_validation_label = 'PASS' THEN
    -- Reward: 0.1 to 0.2 based on score (higher score = higher reward)
    v_reward := 0.1 + (p_validation_score - 0.8) * 0.5;
    -- Clamp reward to valid range
    v_reward := GREATEST(0.1, LEAST(0.2, v_reward));
  ELSIF p_validation_label = 'NEEDS_REVIEW' THEN
    -- Small positive reward for partial success: 0.0 to 0.03
    v_reward := (p_validation_score - 0.5) * 0.1;
    -- Clamp reward to valid range
    v_reward := GREATEST(0.0, LEAST(0.03, v_reward));
  ELSE
    -- Penalty for failure: -0.1 to -0.2 (lower score = larger penalty)
    v_reward := -0.1 - (0.5 - p_validation_score) * 0.2;
    -- Clamp reward to valid range
    v_reward := GREATEST(-0.2, LEAST(-0.1, v_reward));
  END IF;

  -- Calculate adaptive learning rate
  -- High for new agents (< 10), medium (10-100), low (> 100)
  IF v_validation_count < 10 THEN
    v_learning_rate := 0.2;
  ELSIF v_validation_count < 100 THEN
    v_learning_rate := 0.1;
  ELSE
    v_learning_rate := 0.05;
  END IF;

  -- Update success_rate using Exponential Moving Average (EMA)
  -- The reward is added to the current success_rate, weighted by learning_rate
  -- This means: new_rate = old_rate + (learning_rate * reward)
  -- But we also want to move towards the validation score itself
  -- So we use: new_rate = (learning_rate * validation_score) + ((1 - learning_rate) * old_rate)
  -- This way, the validation score directly influences the success rate
  v_new_success_rate := (v_learning_rate * p_validation_score) + ((1 - v_learning_rate) * v_previous_success_rate);
  
  -- Clamp to valid range
  v_new_success_rate := GREATEST(0.0, LEAST(1.0, v_new_success_rate));

  -- Calculate recent success rate (last 10 validations)
  -- This is a simplified version - in production, you'd query actual recent validations
  -- For now, we'll use a weighted average
  v_recent_success_rate := (0.7 * v_new_success_rate) + (0.3 * COALESCE(v_current_capabilities.recent_success_rate, v_new_success_rate));

  -- Determine trend
  IF v_new_success_rate > v_previous_success_rate + 0.05 THEN
    v_trend := 'IMPROVING';
  ELSIF v_new_success_rate < v_previous_success_rate - 0.05 THEN
    v_trend := 'DECLINING';
  ELSE
    v_trend := 'STABLE';
  END IF;

  -- Update agent capabilities
  UPDATE agent_capabilities
  SET
    success_rate = v_new_success_rate,
    recent_success_rate = v_recent_success_rate,
    validation_count = v_validation_count + 1,
    last_validation_at = NOW(),
    trend = v_trend,
    last_updated = NOW()
  WHERE agent_id = p_agent_id;

  -- Return learning metrics
  RETURN jsonb_build_object(
    'agent_id', p_agent_id,
    'reward', v_reward,
    'learning_rate', v_learning_rate,
    'success_rate_before', v_previous_success_rate,
    'success_rate_after', v_new_success_rate,
    'recent_success_rate', v_recent_success_rate,
    'trend', v_trend,
    'validation_count', v_validation_count + 1
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Trigger to automatically update learning when validation is created
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_agent_learning()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_id UUID;
  v_learning_result JSONB;
BEGIN
  -- Get the agent_id from the usage_log
  SELECT agent_id INTO v_agent_id
  FROM agent_usage_logs
  WHERE id = NEW.usage_log_id;

  -- Only update if we have an agent_id (not routing logs)
  IF v_agent_id IS NOT NULL THEN
    -- Update agent learning
    v_learning_result := update_agent_learning(
      v_agent_id,
      NEW.score,
      NEW.label
    );

    -- Store learning history
    INSERT INTO agent_validation_history (
      agent_id,
      validation_event_id,
      reward,
      success_rate_before,
      success_rate_after,
      learning_rate
    )
    SELECT
      v_agent_id,
      NEW.id,
      (v_learning_result->>'reward')::DECIMAL,
      (v_learning_result->>'success_rate_before')::DECIMAL,
      (v_learning_result->>'success_rate_after')::DECIMAL,
      (v_learning_result->>'learning_rate')::DECIMAL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS agent_learning_on_validation ON public.agent_validation_events;
CREATE TRIGGER agent_learning_on_validation
  AFTER INSERT ON public.agent_validation_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_agent_learning();

