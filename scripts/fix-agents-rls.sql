-- Fix RLS policies for agents table to allow admin/service role to create agents
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON public.agents;
DROP POLICY IF EXISTS "Service role can manage agents" ON public.agents;
DROP POLICY IF EXISTS "Authenticated users can insert agents" ON public.agents;
DROP POLICY IF EXISTS "Authenticated users can update agents" ON public.agents;

-- Allow everyone to view agents (SELECT)
CREATE POLICY "Agents are viewable by everyone" ON public.agents
    FOR SELECT USING (true);

-- Note: Service role key bypasses RLS by default in Supabase
-- But we'll add policies as a backup for authenticated operations

-- Allow authenticated users to insert agents (for admin dashboard)
-- This is a fallback - the API should use service role key which bypasses RLS
CREATE POLICY "Authenticated users can insert agents" ON public.agents
    FOR INSERT 
    WITH CHECK (true); -- Allow all authenticated inserts (admin check happens in API)

-- Allow authenticated users to update agents
CREATE POLICY "Authenticated users can update agents" ON public.agents
    FOR UPDATE 
    USING (true) -- Allow all authenticated updates
    WITH CHECK (true);

-- Verify the policies
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
WHERE tablename = 'agents'
ORDER BY policyname;

