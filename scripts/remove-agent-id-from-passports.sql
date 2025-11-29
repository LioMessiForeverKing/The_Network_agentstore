-- Remove agent_id column and related constraints from agent_passports table
-- This reverts the changes made by fix-agent-passports.sql

-- Remove foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'agent_passports' 
        AND constraint_name = 'agent_passports_agent_id_fkey'
    ) THEN
        ALTER TABLE public.agent_passports 
        DROP CONSTRAINT agent_passports_agent_id_fkey;
        
        RAISE NOTICE 'Removed foreign key constraint agent_passports_agent_id_fkey';
    END IF;
END $$;

-- Remove check constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_user_or_agent'
    ) THEN
        ALTER TABLE public.agent_passports 
        DROP CONSTRAINT check_user_or_agent;
        
        RAISE NOTICE 'Removed check_user_or_agent constraint';
    END IF;
END $$;

-- Remove unique index for agent_id if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'agent_passports' 
        AND indexname = 'agent_passports_agent_id_key'
    ) THEN
        DROP INDEX IF EXISTS public.agent_passports_agent_id_key;
        
        RAISE NOTICE 'Removed unique index agent_passports_agent_id_key';
    END IF;
END $$;

-- Remove index for agent_id if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'agent_passports' 
        AND indexname = 'idx_agent_passports_agent_id'
    ) THEN
        DROP INDEX IF EXISTS public.idx_agent_passports_agent_id;
        
        RAISE NOTICE 'Removed index idx_agent_passports_agent_id';
    END IF;
END $$;

-- Remove agent_id column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_passports' 
        AND column_name = 'agent_id'
    ) THEN
        ALTER TABLE public.agent_passports 
        DROP COLUMN agent_id;
        
        RAISE NOTICE 'Removed agent_id column from agent_passports';
    ELSE
        RAISE NOTICE 'agent_id column does not exist - nothing to remove';
    END IF;
END $$;

