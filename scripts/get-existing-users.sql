-- Get existing users from auth.users
-- Run this in Supabase SQL Editor to find a real user_id to use for testing

SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Copy one of the IDs and use it in your test task_spec
-- Example: If you get id = '123e4567-e89b-12d3-a456-426614174000'
-- Use it like: "user_id": "123e4567-e89b-12d3-a456-426614174000"

