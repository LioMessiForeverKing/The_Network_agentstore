-- Test script to verify validation event insert works
-- This will help debug why validation events aren't being stored

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'agent_validation_events';

-- 2. List all policies on agent_validation_events
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'agent_validation_events';

-- 3. Check if there are any validation events
SELECT COUNT(*) as total_validation_events
FROM agent_validation_events;

-- 4. Check recent usage logs that should have validation events
SELECT 
  aul.id as usage_log_id,
  aul.agent_id,
  a.name as agent_name,
  aul.created_at,
  COUNT(ave.id) as validation_count
FROM agent_usage_logs aul
LEFT JOIN agents a ON a.id = aul.agent_id
LEFT JOIN agent_validation_events ave ON ave.usage_log_id = aul.id
WHERE aul.created_at > NOW() - INTERVAL '24 hours'
AND aul.agent_id IS NOT NULL
GROUP BY aul.id, aul.agent_id, a.name, aul.created_at
ORDER BY aul.created_at DESC
LIMIT 10;

-- 5. Check if validator agent exists
SELECT id, name, slug, status
FROM agents
WHERE slug = 'validator';

-- 6. Test insert (this will fail if RLS blocks it, but we can see the error)
-- First, get a recent usage_log_id
DO $$
DECLARE
  v_usage_log_id UUID;
  v_validator_id UUID;
  v_test_id UUID;
BEGIN
  -- Get a recent usage log
  SELECT id INTO v_usage_log_id
  FROM agent_usage_logs
  WHERE agent_id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Get validator agent id
  SELECT id INTO v_validator_id
  FROM agents
  WHERE slug = 'validator';
  
  IF v_usage_log_id IS NULL THEN
    RAISE NOTICE 'No usage logs found';
  ELSIF v_validator_id IS NULL THEN
    RAISE NOTICE 'Validator agent not found';
  ELSE
    RAISE NOTICE 'Testing insert with usage_log_id: %, validator_id: %', v_usage_log_id, v_validator_id;
    
    -- Try to insert a test validation event
    INSERT INTO agent_validation_events (
      usage_log_id,
      validator_agent_id,
      score,
      label,
      error_type,
      explanation,
      is_human
    ) VALUES (
      v_usage_log_id,
      v_validator_id,
      0.5,
      'NEEDS_REVIEW',
      'OTHER',
      'Test validation event',
      false
    )
    RETURNING id INTO v_test_id;
    
    RAISE NOTICE '✅ Test insert successful! ID: %', v_test_id;
    
    -- Clean up test insert
    DELETE FROM agent_validation_events WHERE id = v_test_id;
    RAISE NOTICE 'Test record deleted';
  END IF;
END $$;

