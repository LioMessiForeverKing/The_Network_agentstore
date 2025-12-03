-- Check if the learning system is set up correctly

-- 1. Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'agent_validation_events'
AND trigger_name = 'agent_learning_on_validation';

-- 2. Check if trigger function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name IN ('trigger_agent_learning', 'update_agent_learning')
AND routine_schema = 'public';

-- 3. Check if agent_validation_history table exists and has data
SELECT 
  COUNT(*) as total_history_records,
  COUNT(DISTINCT agent_id) as unique_agents,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM agent_validation_history;

-- 4. Check if agent_capabilities have learning fields
SELECT 
  agent_id,
  success_rate,
  recent_success_rate,
  validation_count,
  trend,
  last_validation_at
FROM agent_capabilities
WHERE validation_count > 0
ORDER BY validation_count DESC
LIMIT 10;

-- 5. Check recent validation events and if they triggered learning
SELECT 
  ave.id as validation_event_id,
  ave.usage_log_id,
  ave.score,
  ave.label,
  ave.created_at as validation_created_at,
  aul.agent_id,
  a.name as agent_name,
  CASE 
    WHEN avh.id IS NOT NULL THEN '✅ Learning history created'
    ELSE '❌ No learning history'
  END as learning_status,
  avh.created_at as learning_history_created_at
FROM agent_validation_events ave
LEFT JOIN agent_usage_logs aul ON aul.id = ave.usage_log_id
LEFT JOIN agents a ON a.id = aul.agent_id
LEFT JOIN agent_validation_history avh ON avh.validation_event_id = ave.id
ORDER BY ave.created_at DESC
LIMIT 20;

-- 6. Test the trigger function manually (if there's a recent validation event)
DO $$
DECLARE
  v_test_validation_id UUID;
  v_agent_id UUID;
  v_usage_log_id UUID;
BEGIN
  -- Get a recent validation event
  SELECT 
    ave.id,
    aul.agent_id,
    ave.usage_log_id
  INTO v_test_validation_id, v_agent_id, v_usage_log_id
  FROM agent_validation_events ave
  LEFT JOIN agent_usage_logs aul ON aul.id = ave.usage_log_id
  ORDER BY ave.created_at DESC
  LIMIT 1;
  
  IF v_test_validation_id IS NULL THEN
    RAISE NOTICE 'No validation events found to test';
  ELSIF v_agent_id IS NULL THEN
    RAISE NOTICE 'Validation event % has no agent_id (usage_log_id: %)', v_test_validation_id, v_usage_log_id;
  ELSE
    RAISE NOTICE 'Found validation event % for agent %', v_test_validation_id, v_agent_id;
    
    -- Check if learning history exists
    IF EXISTS (SELECT 1 FROM agent_validation_history WHERE validation_event_id = v_test_validation_id) THEN
      RAISE NOTICE '✅ Learning history exists for this validation event';
    ELSE
      RAISE NOTICE '❌ No learning history found - trigger may not have fired';
    END IF;
  END IF;
END $$;

