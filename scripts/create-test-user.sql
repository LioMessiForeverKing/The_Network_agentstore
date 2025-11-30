-- Create a test user for Prime agent testing
-- This script creates a user in auth.users that can be used for testing

-- Option 1: Use Supabase Auth to create a user (recommended)
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Or use the Supabase Auth API

-- Option 2: Insert directly into auth.users (requires service role)
-- WARNING: This bypasses Supabase Auth and should only be used for testing
-- You'll need to manually create the user record with proper password hash, etc.

-- For testing, the easiest approach is:
-- 1. Sign up a test user through your app's auth flow
-- 2. Copy their user ID from Supabase Dashboard → Authentication → Users
-- 3. Use that user_id in your test task_spec

-- To get an existing user ID:
-- SELECT id, email FROM auth.users LIMIT 5;

-- If you need to create a test user programmatically, use Supabase Auth API:
-- POST /auth/v1/admin/users
-- {
--   "email": "test@example.com",
--   "password": "testpassword123",
--   "email_confirm": true
-- }

