-- Fix type mismatch in trigger_agent_learning function
-- The trigger passes NEW.score (FLOAT/double precision) but function expects DECIMAL
-- Solution: Cast NEW.score to DECIMAL in the trigger call

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
    -- Cast NEW.score (FLOAT/double precision) to DECIMAL to match function signature
    v_learning_result := update_agent_learning(
      v_agent_id,
      NEW.score::DECIMAL(5,4),  -- Cast FLOAT to DECIMAL(5,4) to match function signature
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
      (v_learning_result->>'reward')::DECIMAL(5,4),
      (v_learning_result->>'success_rate_before')::DECIMAL(5,4),
      (v_learning_result->>'success_rate_after')::DECIMAL(5,4),
      (v_learning_result->>'learning_rate')::DECIMAL(5,4);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger is already created, but we need to recreate it to use the updated function
-- (Actually, since we're using CREATE OR REPLACE, the trigger will automatically use the new function)

