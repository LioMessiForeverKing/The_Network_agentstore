# Database Setup Guide

This guide will help you set up the Supabase database tables for the Agentic App Store web application.

## Prerequisites

- A Supabase project created at [supabase.com](https://supabase.com)
- Your Supabase project URL and anon key

## Setup Steps

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Schema SQL

1. Open the `supabase-schema.sql` file in this project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### 3. Verify Tables Were Created

1. Go to **Table Editor** in the Supabase dashboard
2. You should see three tables:
   - `agents`
   - `agent_passports`
   - `agent_usage_logs`

### 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in:
- Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key

## Database Schema Overview

### `agents` Table
Stores information about available AI agents.

**Columns:**
- `id` (UUID) - Primary key
- `name` (TEXT) - Agent name
- `slug` (TEXT) - URL-friendly identifier (unique)
- `description` (TEXT) - Agent description
- `domain` (TEXT) - Category/domain (e.g., "education", "finance")
- `status` (TEXT) - Status (e.g., "ACTIVE", "INACTIVE")
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### `agent_passports` Table
Stores performance metrics for each agent.

**Columns:**
- `id` (UUID) - Primary key
- `agent_id` (UUID) - Foreign key to `agents.id`
- `success_rate` (DECIMAL) - Success rate (0.0 to 1.0)
- `average_latency_ms` (INTEGER) - Average response time in milliseconds
- `total_uses` (INTEGER) - Total number of times agent was used
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### `agent_usage_logs` Table
Stores individual usage records for each user.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to `auth.users.id`
- `agent_id` (UUID) - Foreign key to `agents.id`
- `task_type` (TEXT) - Type of task performed
- `success_flag` (BOOLEAN) - Whether the task succeeded
- `latency_ms` (INTEGER) - Response time in milliseconds
- `created_at` (TIMESTAMPTZ) - When the usage occurred

## Row Level Security (RLS)

The schema includes Row Level Security policies:

- **agents**: Public read access (anyone can view)
- **agent_passports**: Public read access (anyone can view)
- **agent_usage_logs**: Users can only view/insert their own logs

## Sample Data

The schema includes sample data for testing:
- 3 sample agents (Study Planner, Financial Advisor, Code Review)
- Sample agent passports with random performance metrics

You can remove the sample data insertion statements from the SQL file if you don't want them.

## Next Steps

After setting up the database:

1. Update your `.env.local` with Supabase credentials
2. Run `npm run dev` to start the development server
3. Visit `http://localhost:3000` and test the application

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire SQL schema file
- Check that you're connected to the correct Supabase project

### "permission denied" error
- Verify RLS policies are correctly set up
- Check that your Supabase anon key has the correct permissions

### Authentication not working
- Ensure Supabase Auth is enabled in your project
- Check that email authentication is enabled in Authentication → Providers


