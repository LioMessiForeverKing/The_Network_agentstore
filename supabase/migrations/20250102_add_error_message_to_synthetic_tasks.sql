-- Add error_message column to synthetic_tasks table
ALTER TABLE public.synthetic_tasks 
ADD COLUMN IF NOT EXISTS error_message TEXT;

