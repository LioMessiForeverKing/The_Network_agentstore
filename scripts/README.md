# Database Schema Scripts

## Quick Start

**Just run `complete-schema.sql` - it handles everything!**

The schema script creates all required tables and sets up Prime agent automatically.

## Files

### `complete-schema.sql` ⭐ **MAIN SCHEMA FILE**
Complete database schema that creates:
- ✅ `agents` table - Agent catalog registry
- ✅ `agent_passports` table - **User passports only** (for Stella instances)
- ✅ `agent_capabilities` table - **Agent capabilities** (for Prime, etc.)
- ✅ `agent_usage_logs` table - Complete audit trail
- ✅ `user_weekly_activities` table - Events (for Prime)
- ✅ `event_attendees` table - Invites (for Prime)
- ✅ Automatically creates Prime agent and capabilities
- ✅ Sets up RLS policies
- ✅ Creates indexes for performance

**Key Structure:**
- `agent_passports` - For user passports only (mobile app uses this)
- `agent_capabilities` - For agent capabilities (Prime, etc.) - separate table

### `remove-agent-id-from-passports.sql` ⚠️ **ONLY IF NEEDED**
If you previously ran `fix-agent-passports.sql` and added `agent_id` to `agent_passports`, run this to clean up before running `complete-schema.sql`.

### `create-agent-capabilities-table.sql`
Standalone script to create just the `agent_capabilities` table (if needed separately).

## How to Use

### For New Installations

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `scripts/complete-schema.sql`
5. Copy the entire contents
6. Paste into SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

### For Existing Databases (If You Added agent_id to agent_passports)

1. **First, clean up:** Run `remove-agent-id-from-passports.sql`
   - This removes `agent_id` and related constraints from `agent_passports`

2. **Then, create schema:** Run `complete-schema.sql`
   - This creates the new `agent_capabilities` table
   - Creates all other tables
   - Sets up Prime agent

## Table Structure

### `agent_passports` (User Passports Only)
- `user_id` - Links to user
- `passport_data` - User's DNA, preferences, trust
- **NO `agent_id`** - This is for users only

### `agent_capabilities` (Agent Capabilities - NEW)
- `agent_id` - Links to agents table (unique)
- `passport_data` - Agent capabilities, metrics, constraints
- `success_rate`, `average_latency_ms`, `total_uses` - Performance metrics

## Verification

After running the schema:

1. **Verify tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('agents', 'agent_passports', 'agent_capabilities', 'agent_usage_logs', 'user_weekly_activities', 'event_attendees');
   ```

2. **Verify Prime agent exists:**
   ```sql
   SELECT * FROM public.agents WHERE slug = 'prime';
   ```

3. **Verify Prime capabilities exist:**
   ```sql
   SELECT ac.* 
   FROM public.agent_capabilities ac
   JOIN public.agents a ON a.id = ac.agent_id
   WHERE a.slug = 'prime';
   ```

## Troubleshooting

### Error: "column agent_id does not exist"
- Good! This means `agent_id` was successfully removed from `agent_passports`
- Now run `complete-schema.sql` to create `agent_capabilities` table

### Error: "relation agent_capabilities does not exist"
- Run `complete-schema.sql` - it creates this table

### Foreign key constraint errors
- Make sure you run `remove-agent-id-from-passports.sql` first if you previously added `agent_id`
- Then run `complete-schema.sql`

## Next Steps

After running the schema:

1. Verify tables were created
2. Check that Prime agent exists
3. Check that Prime capabilities exist in `agent_capabilities` table
4. Update your `.env.local` with Supabase credentials
5. Start building Prime agent implementation

See [BUILD_PLAN.md](../docs/BUILD_PLAN.md) for next steps.
