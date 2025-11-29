# Agents Catalog

## What is the Agents Catalog?

The **Agents Catalog** is a registry of all available specialist agents in the system. Think of it as an "app store" for agents - a central place where all agents are registered, discovered, and managed.

## Purpose

1. **Agent Discovery**: Stella/Gaia can discover available agents dynamically
2. **Centralized Management**: All agent metadata in one place
3. **Versioning**: Track different versions of agents
4. **Status Management**: Enable/disable agents without code changes
5. **Scalability**: Add new agents without modifying Stella/Gaia code

## Database Schema

```sql
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,  -- "Prime", "Study Planner", "Ledger"
    slug TEXT UNIQUE NOT NULL,  -- "prime", "study_planner", "ledger"
    domain TEXT NOT NULL,  -- "EVENT_PLANNING", "STUDY", "ACCOUNTING_TAX"
    description TEXT NOT NULL,
    
    invocation_type TEXT NOT NULL CHECK (invocation_type IN (
        'INTERNAL_FUNCTION',  -- Supabase edge function
        'HTTP_ENDPOINT'       -- External API (future)
    )),
    
    invocation_config JSONB NOT NULL,  -- How to call the agent
    
    status TEXT NOT NULL DEFAULT 'EXPERIMENTAL' CHECK (status IN (
        'ACTIVE',        -- Production ready
        'EXPERIMENTAL',  -- Testing
        'DISABLED'       -- Temporarily disabled
    )),
    
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_slug ON public.agents(slug);
CREATE INDEX idx_agents_domain ON public.agents(domain);
CREATE INDEX idx_agents_status ON public.agents(status);
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Human-readable name (e.g., "Prime") |
| `slug` | TEXT | Unique identifier (e.g., "prime") |
| `domain` | TEXT | Agent domain (EVENT_PLANNING, STUDY, etc.) |
| `description` | TEXT | What the agent does |
| `invocation_type` | TEXT | How to call the agent (INTERNAL_FUNCTION, HTTP_ENDPOINT) |
| `invocation_config` | JSONB | Configuration for calling the agent |
| `status` | TEXT | ACTIVE, EXPERIMENTAL, or DISABLED |
| `version` | INTEGER | Agent version |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Invocation Types

### INTERNAL_FUNCTION

Agent is a Supabase edge function:

```json
{
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "prime-agent",
    "endpoint": "https://[project].supabase.co/functions/v1/prime-agent",
    "method": "POST",
    "auth": "service_role_key",
    "input_schema": {...},
    "output_schema": {...}
  }
}
```

**How it's called:**
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/${agent.invocation_config.function_name}`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(taskSpec)
  }
);
```

### HTTP_ENDPOINT (Future)

Agent is an external API:

```json
{
  "invocation_type": "HTTP_ENDPOINT",
  "invocation_config": {
    "endpoint": "https://external-agent.com/api/v1/execute",
    "method": "POST",
    "auth": {
      "type": "bearer_token",
      "token": "env:EXTERNAL_AGENT_TOKEN"
    },
    "pricing": {
      "cost_per_call": 0.10,
      "currency": "USD"
    }
  }
}
```

## Example Agents

### Prime (Event Planning Agent)

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "name": "Prime",
  "slug": "prime",
  "domain": "EVENT_PLANNING",
  "description": "Creates events, finds network matches, sends invites",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "prime-agent",
    "endpoint": "https://[project].supabase.co/functions/v1/prime-agent",
    "method": "POST",
    "auth": "service_role_key"
  },
  "status": "ACTIVE",
  "version": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Study Planner Agent

```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440000",
  "name": "Study Planner",
  "slug": "study_planner",
  "domain": "STUDY",
  "description": "Generates personalized study plans based on courses and deadlines",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "study-planner-agent",
    "endpoint": "https://[project].supabase.co/functions/v1/study-planner-agent",
    "method": "POST",
    "auth": "service_role_key"
  },
  "status": "ACTIVE",
  "version": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Ledger Agent

```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440000",
  "name": "Ledger",
  "slug": "ledger",
  "domain": "ACCOUNTING_TAX",
  "description": "Financial insights, spending summaries, tax help",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "ledger-agent",
    "endpoint": "https://[project].supabase.co/functions/v1/ledger-agent",
    "method": "POST",
    "auth": "service_role_key"
  },
  "status": "ACTIVE",
  "version": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

## How It's Used

### 1. Agent Discovery

Gaia discovers agents dynamically:

```typescript
// Gaia queries agents catalog
const agents = await db
  .from('agents')
  .select('*, agent_capabilities(*)')
  .eq('status', 'ACTIVE')
  .eq('domain', taskSpec.domain);

// No hardcoded agent list!
// New agents are automatically discovered
```

### 2. Routing Decisions

Gaia uses catalog to route tasks:

```typescript
// Find agents that support the task type
const candidates = await db.query(`
  SELECT a.*, ac.passport_data, ac.success_rate, ac.average_latency_ms
  FROM agents a
  JOIN agent_capabilities ac ON ac.agent_id = a.id
  WHERE 
    a.status = 'ACTIVE'
    AND a.domain = :domain
    AND ac.passport_data->'capabilities'->'supported_task_types' 
        @> :taskType::jsonb
  ORDER BY 
    ac.success_rate DESC,
    ac.average_latency_ms ASC
`, [taskSpec.domain, taskSpec.type]);
```

### 3. Agent Invocation

Gaia calls agents using invocation config:

```typescript
async function callAgent(agent, taskSpec) {
  if (agent.invocation_type === 'INTERNAL_FUNCTION') {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${agent.invocation_config.function_name}`,
      {
        method: agent.invocation_config.method || 'POST',
        headers: {
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskSpec)
      }
    );
    return await response.json();
  } else if (agent.invocation_type === 'HTTP_ENDPOINT') {
    // Call external API
    const response = await fetch(agent.invocation_config.endpoint, {
      method: agent.invocation_config.method || 'POST',
      headers: {
        "Authorization": `Bearer ${agent.invocation_config.auth.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskSpec)
    });
    return await response.json();
  }
}
```

### 4. Status Management

Enable/disable agents without code changes:

```sql
-- Disable an agent
UPDATE agents 
SET status = 'DISABLED' 
WHERE slug = 'prime';

-- Enable an agent
UPDATE agents 
SET status = 'ACTIVE' 
WHERE slug = 'prime';
```

## Agent Domains

Common domains for organizing agents:

- `EVENT_PLANNING` - Event creation, matching, invites
- `STUDY` - Study plans, scheduling
- `ACCOUNTING_TAX` - Financial insights, tax help
- `HEALTH` - Health tracking, wellness (future)
- `CAREER` - Career advice, job matching (future)
- `ROUTING` - Meta-agent for routing (Gaia)

## Agent Statuses

### ACTIVE
- Production ready
- Used in routing decisions
- Fully tested and stable

### EXPERIMENTAL
- In testing
- May have bugs
- Can be used but with caution
- Users can opt-in

### DISABLED
- Temporarily disabled
- Not used in routing
- May be under maintenance
- Can be re-enabled later

## Adding New Agents

### Step 1: Create Agent Record

```sql
INSERT INTO agents (
  name,
  slug,
  domain,
  description,
  invocation_type,
  invocation_config,
  status
) VALUES (
  'Venue Finder',
  'venue_finder',
  'EVENT_PLANNING',
  'Finds and recommends venues for events',
  'INTERNAL_FUNCTION',
  '{
    "function_name": "venue-finder-agent",
    "endpoint": "https://[project].supabase.co/functions/v1/venue-finder-agent",
    "method": "POST"
  }'::jsonb,
  'EXPERIMENTAL'
);
```

### Step 2: Create Agent Capabilities

```sql
INSERT INTO agent_capabilities (
  agent_id,
  passport_data
) VALUES (
  :agent_id,
  '{
    "capabilities": {
      "supported_task_types": ["VENUE_SEARCH", "VENUE_RECOMMENDATION"],
      "input_schema": {...},
      "output_schema": {...}
    },
    "trust_metrics": {
      "success_rate": 0.0,
      "average_latency_ms": 0,
      "total_uses": 0
    },
    "constraints": {
      "jurisdictions": ["US", "CA"]
    }
  }'::jsonb
);
```

### Step 3: Create Edge Function

Create `supabase/functions/venue-finder-agent/index.ts` with agent logic.

### Step 4: Test

Test the agent, then update status to `ACTIVE` when ready.

**No code changes to Stella or Gaia needed!** Agents are discovered dynamically.

## Relationship to Other Tables

```
agents
    │
    ├──→ agent_capabilities (via agent_id) - Agent capabilities
    │
    └──→ agent_usage_logs (via agent_id) - Performance tracking
```

## Common Queries

### Get All Active Agents
```sql
SELECT * 
FROM agents 
WHERE status = 'ACTIVE'
ORDER BY name;
```

### Get Agents by Domain
```sql
SELECT * 
FROM agents 
WHERE domain = :domain 
AND status = 'ACTIVE';
```

### Get Agent by Slug
```sql
SELECT * 
FROM agents 
WHERE slug = :slug;
```

### Get Agents with Performance Metrics
```sql
SELECT 
  a.*,
  ac.passport_data->'trust_metrics' as trust_metrics,
  ac.success_rate,
  ac.average_latency_ms
FROM agents a
JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.status = 'ACTIVE'
ORDER BY 
  ac.success_rate DESC,
  ac.average_latency_ms ASC;
```

## Related Documentation

- [Agent Capabilities](./03_agent_passports_agent.md) - Agent capabilities (agent_capabilities table)
- [Agent Usage Logs](./05_agent_usage_logs.md) - Performance tracking
- [Routing & Agent System Explained](./WEBAPPAGENTSTORE.md) - How routing works

