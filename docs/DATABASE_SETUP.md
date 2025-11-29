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

1. Open the `scripts/complete-schema.sql` file in this project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

**Note:** This will create all required tables including:
- `agents` - Agent catalog registry
- `agent_passports` - User passports only (for Stella instances)
- `agent_capabilities` - Agent capabilities & performance (for Prime, etc.)
- `agent_usage_logs` - Complete audit trail
- `user_weekly_activities` - Events table (for Prime)
- `event_attendees` - Invites table (for Prime)

It will also automatically create the Prime agent and its capabilities.

### 3. Verify Tables Were Created

1. Go to **Table Editor** in the Supabase dashboard
2. You should see these tables:
   - `agents`
   - `agent_passports` (for user passports)
   - `agent_capabilities` (for agent capabilities)
   - `agent_usage_logs`
   - `user_weekly_activities`
   - `event_attendees`

3. Verify Prime agent was created:
   - Go to `agents` table
   - You should see a row with `slug = 'prime'`
   - Go to `agent_capabilities` table
   - You should see a row with the Prime agent's capabilities data

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
Stores information about available AI agents (the catalog).

**Key Columns:**
- `id` (UUID) - Primary key
- `name` (TEXT) - Agent name (e.g., "Prime")
- `slug` (TEXT) - URL-friendly identifier (unique, e.g., "prime")
- `domain` (TEXT) - Category/domain (e.g., "EVENT_PLANNING", "STUDY")
- `description` (TEXT) - Agent description
- `invocation_type` (TEXT) - How to call agent ("INTERNAL_FUNCTION" or "HTTP_ENDPOINT")
- `invocation_config` (JSONB) - Configuration for calling the agent
- `status` (TEXT) - Status ("ACTIVE", "EXPERIMENTAL", "DISABLED")
- `version` (INTEGER) - Agent version
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### `agent_passports` Table
Stores user passports only (for Stella instances).

**Key Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to `profiles.id` (for user passports)
- `passport_data` (JSONB) - Complete passport in JSON-LD format
  - Contains: digital_dna, trust, preferences
- `version` (INTEGER) - Passport version
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `last_updated` (TIMESTAMPTZ) - Last update timestamp

### `agent_capabilities` Table
Stores agent capabilities and performance metrics (for specialist agents like Prime).

**Key Columns:**
- `id` (UUID) - Primary key
- `agent_id` (UUID) - Foreign key to `agents.id` (unique, one per agent)
- `passport_data` (JSONB) - Complete passport in JSON-LD format
  - Contains: capabilities, trust_metrics, constraints
- `success_rate` (DECIMAL) - Success rate (0.0 to 1.0)
- `average_latency_ms` (INTEGER) - Average response time in milliseconds
- `total_uses` (INTEGER) - Total number of times agent was used
- `version` (INTEGER) - Capabilities version
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `last_updated` (TIMESTAMPTZ) - Last update timestamp

### `agent_usage_logs` Table
Complete audit trail for all agent interactions.

**Key Columns:**
- `id` (UUID) - Primary key
- `stella_handle` (TEXT) - Stella instance identifier (@firstname.lastname.network)
- `agent_id` (UUID) - Specialist agent (Prime, etc.) or NULL for Stella
- `user_id` (UUID) - User who initiated the request
- `task_type` (TEXT) - Type of task (e.g., "EVENT_PLANNING", "routing")
- `full_context_json` (JSONB) - Complete context from Stella
- `input_json` (JSONB) - Input sent to agent
- `output_json` (JSONB) - Output from agent
- `resulting_event_id` (UUID) - Event created (if applicable)
- `success_flag` (BOOLEAN) - Whether task succeeded
- `latency_ms` (INTEGER) - Response time in milliseconds
- `parent_usage_log_id` (UUID) - Links to parent log (for multi-agent chains)
- `created_at` (TIMESTAMPTZ) - When interaction occurred

### `user_weekly_activities` Table
Stores events created by Prime and other activities.

**Key Columns:**
- `id` (UUID) - Primary key (event ID)
- `user_id` (UUID) - User who created/is hosting the event
- `event_name` (TEXT) - Name of the event
- `event_title` (TEXT) - Title of the event post
- `location` (TEXT) - Event location
- `start_date` (TIMESTAMPTZ) - Event start time
- `end_date` (TIMESTAMPTZ) - Event end time
- `tags` (TEXT[]) - Event tags (for matching)
- `is_hosting` (BOOLEAN) - true = hosting, false = attending
- `max_capacity` (INTEGER) - Maximum number of attendees
- `metadata` (JSONB) - Additional Prime-generated data
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### `event_attendees` Table
Tracks who is invited to and attending events.

**Key Columns:**
- `id` (UUID) - Primary key
- `event_id` (UUID) - Links to `user_weekly_activities.id`
- `user_id` (UUID) - Invited/attending user
- `status` (TEXT) - 'pending', 'confirmed', 'maybe', 'declined'
- `confirmed_at` (TIMESTAMPTZ) - When status changed to 'confirmed'
- `created_at` (TIMESTAMPTZ) - When invite was created

## Row Level Security (RLS)

The schema includes Row Level Security policies:

- **agents**: Public read access (anyone can view)
- **agent_passports**: Public read access (anyone can view user passports)
- **agent_capabilities**: Public read access (anyone can view agent capabilities)
- **agent_usage_logs**: Users can only view/insert their own logs

## Sample Data

The schema automatically creates:
- **Prime agent** in the `agents` table
- **Prime agent capabilities** in the `agent_capabilities` table with:
  - Capabilities (supported task types, input/output schemas)
  - Trust metrics (initialized to 0)
  - Constraints (max attendees, jurisdictions)

You can verify this by checking the tables after running the schema.

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




