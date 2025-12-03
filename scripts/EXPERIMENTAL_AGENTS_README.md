# Experimental Agents Setup Guide

This guide explains how to create ~400+ experimental agents for testing Gaia routing.

## Quick Start

### Option 1: Run via Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste each script in order:
   - `bulk-experimental-agents-part1.sql` (TRAVEL, LIFESTYLE, CREATIVE, GAMING, WELLNESS)
   - `bulk-experimental-agents-part2.sql` (HEALTH, FASHION, FOOD, FITNESS, TECH)
   - `bulk-experimental-agents-part3.sql` (EDUCATION, PRODUCTIVITY, BUSINESS, CAREER)
   - `bulk-experimental-agents-part4.sql` (SOCIAL, COMMUNICATION, WRITING, FINANCE, LEGAL, MARKETING, DESIGN)
   - `bulk-experimental-agents-part5.sql` (ENTERTAINMENT, MUSIC, ART, PHOTOGRAPHY, etc.)
   - `bulk-experimental-agents-capabilities.sql` (Creates agent_capabilities entries)
3. Run each script and verify success

### Option 2: Run via psql

```bash
cd agent_store/scripts
psql -h YOUR_DB_HOST -U postgres -d postgres -f run-all-experimental-agents.sql
```

## What Gets Created

### Agents Table
- ~400+ agents with `status = 'EXPERIMENTAL'`
- Each agent has a unique `slug` for identification
- All agents point to the `experimental-agent` edge function
- Domains include: TRAVEL, LIFESTYLE, CREATIVE, GAMING, WELLNESS, HEALTH, FASHION, FOOD, FITNESS, TECH, EDUCATION, PRODUCTIVITY, BUSINESS, CAREER, SOCIAL, COMMUNICATION, WRITING, FINANCE, LEGAL, MARKETING, DESIGN, ENTERTAINMENT, MUSIC, ART, PHOTOGRAPHY, FILM, NATURE, CULTURE, SPIRITUAL, PETS, HOME, TOOLS, DATA, ANALYSIS, DEBATE, HUMANITIES, ENGINEERING, PRODUCT, PLANNING, EVENT_PLANNING, RELATIONSHIPS, BEAUTY, ADMIN, PERSONA, PRESENTATION

### Agent Capabilities Table
- Each agent gets a corresponding `agent_capabilities` entry
- `supported_task_types` is set to the agent's domain
- `input_format` is set to `"standard"` for Gaia routing compatibility
- Initial `success_rate` is 0.5, will update as validations occur

## Deploy the Experimental Agent Edge Function

After creating the agents, deploy the experimental-agent function:

```bash
cd agent_store
supabase functions deploy experimental-agent --project-ref YOUR_PROJECT_REF
```

## Testing Gaia Routing

1. **Generate Synthetic Tasks**
   - Go to the Admin Dashboard
   - Navigate to the "Generate Tasks" section
   - Click "Generate Synthetic Tasks" to create test tasks for experimental agents

2. **Monitor Routing**
   - Check the "Tasks" dashboard to see tasks being routed
   - Gaia will route tasks to agents based on `supported_task_types` matching

3. **Validate Outputs**
   - The Validator agent will automatically validate experimental agent outputs
   - Learning metrics will update in `agent_capabilities`
   - Check `agent_validation_history` for validation records

## Agent Domains Summary

| Domain | Count (approx) | Description |
|--------|----------------|-------------|
| TRAVEL | 25+ | Trip planning, packing, visas, etc. |
| LIFESTYLE | 30+ | Home, organization, routines |
| WELLNESS | 45+ | Mental health, sleep, habits |
| EDUCATION | 50+ | Learning, tutoring, study planning |
| PRODUCTIVITY | 25+ | Task management, time blocking |
| BUSINESS | 45+ | Startups, strategy, pitching |
| CAREER | 18+ | Resume, interviews, job search |
| SOCIAL | 30+ | Relationships, events, communication |
| CREATIVE | 20+ | Writing, art, brainstorming |
| TECH | 15+ | Software, hardware, troubleshooting |
| FITNESS | 17+ | Workouts, nutrition, form |
| FOOD | 24+ | Recipes, meal planning, cooking |
| HEALTH | 20+ | General health, skincare |
| FASHION | 26+ | Style, wardrobe, shopping |
| FINANCE | 14+ | Budgeting, investing, taxes |
| ... | ... | (See scripts for full list) |

## Customizing Agents

To modify an agent after creation:

```sql
UPDATE agents 
SET description = 'New description'
WHERE slug = 'agent-slug-here';
```

To change an agent's capabilities:

```sql
UPDATE agent_capabilities 
SET passport_data = passport_data || '{"capabilities": {"input_format": "nlp_create"}}'::jsonb
WHERE agent_id = (SELECT id FROM agents WHERE slug = 'agent-slug-here');
```

## Cleanup (if needed)

To remove all experimental agents:

```sql
-- Delete capabilities first (foreign key constraint)
DELETE FROM agent_capabilities 
WHERE agent_id IN (SELECT id FROM agents WHERE status = 'EXPERIMENTAL');

-- Then delete agents
DELETE FROM agents WHERE status = 'EXPERIMENTAL';
```

## Next Steps

1. Run the SQL scripts to create agents
2. Deploy the experimental-agent edge function
3. Generate synthetic tasks from admin dashboard
4. Monitor Gaia routing in action
5. Check validation results and learning metrics

## Troubleshooting

### Agents not showing in Gaia routing
- Check that `agent_capabilities` entry exists
- Verify `supported_task_types` matches the task type
- Ensure agent `status` is `'EXPERIMENTAL'`

### Capabilities not created
- Run `bulk-experimental-agents-capabilities.sql` after the agent scripts
- Check that agents have a non-null `domain`

### Edge function errors
- Check Supabase Edge Function logs
- Verify the function is deployed correctly
- Check CORS headers if calling from browser

