# Stella Routing System Setup

## Overview

The routing system allows **Stella** (the companion interface) to route tasks to appropriate specialist agents like **Prime** through **Gaia** (the router/orchestrator).

## Architecture

```
User → Stella (Companion) → Gaia (Router) → Prime (Specialist Agent)
```

### Components

1. **Stella** - User-facing companion interface
   - Understands user intent
   - Creates task specs
   - Calls Gaia router

2. **Gaia Router** - Task orchestrator
   - Receives task specs from Stella
   - Finds appropriate agents
   - Routes to best agent
   - Logs all decisions

3. **Prime Agent** - Event planning specialist
   - Executes event planning tasks
   - Returns structured results

## Setup

### 1. Deploy Gaia Router Edge Function

```bash
# Using Supabase CLI
supabase functions deploy gaia-router
```

### 2. Update Agent Catalog

Ensure Prime agent is registered with correct invocation config:

```sql
-- Check Prime agent exists
SELECT * FROM agents WHERE slug = 'prime';

-- Update if needed
UPDATE agents
SET 
  invocation_type = 'INTERNAL_FUNCTION',
  invocation_config = jsonb_build_object(
    'function_name', 'prime-agent',
    'endpoint', '/functions/v1/prime-agent',
    'method', 'POST'
  )
WHERE slug = 'prime';
```

### 3. Ensure Agent Capabilities are Set

```sql
-- Check Prime capabilities
SELECT * FROM agent_capabilities WHERE agent_id = (
  SELECT id FROM agents WHERE slug = 'prime'
);
```

## Usage

### From Stella (Companion Interface)

```typescript
// Stella creates task spec from user message
const taskSpec = {
  type: 'EVENT_PLANNING',
  user_id: userId,
  stella_handle: '@user.network',
  context: {
    event_details: {
      date: '2025-12-06',
      location: 'San Francisco, CA',
      theme: ['entrepreneurship', 'music']
    },
    auto_invite: true
  }
}

// Stella calls Gaia router
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/gaia-router`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      task_spec: taskSpec,
      user_passport: userPassport // Optional: Stella's passport
    })
  }
)

const result = await response.json()
// result.routes - Routing decisions
// result.execution_result - Prime's execution result
```

### From Next.js API Route

```typescript
// app/api/gaia/route/route.ts
POST /api/gaia/route
{
  "task_spec": {
    "type": "EVENT_PLANNING",
    "user_id": "user-uuid",
    "stella_handle": "@user.network",
    "context": { ... }
  }
}
```

## How Routing Works

### 1. Gaia Receives Task Spec

```typescript
{
  type: "EVENT_PLANNING",
  user_id: "user-uuid",
  stella_handle: "@user.network",
  context: { ... }
}
```

### 2. Gaia Finds Candidate Agents

- Queries `agents` table
- Filters by `status = 'ACTIVE'`
- Checks `agent_capabilities` for supported task types
- Sorts by success rate and latency

### 3. Gaia Selects Best Agent

- Chooses agent with highest success rate
- Checks constraints (max_attendees, etc.)
- Creates routing decision

### 4. Gaia Executes Agent

- Calls agent's edge function or HTTP endpoint
- Passes task spec to agent
- Returns execution result

### 5. Gaia Logs Everything

- Logs to `agent_usage_logs` table
- Records routing decisions
- Tracks performance

## Routing Decision Format

```typescript
{
  success: true,
  routes: [
    {
      agent_id: "prime-uuid",
      agent_slug: "prime",
      agent_name: "Prime",
      priority: 1,
      role: "primary",
      invocation_config: { ... },
      confidence: 0.95,
      reasoning: [
        "Found 1 candidate agent(s)",
        "Selected Prime as primary agent (success rate: 95.0%)"
      ]
    }
  ],
  execution_result: {
    success: true,
    event: { ... },
    invites: { ... }
  }
}
```

## Testing

### Test Gaia Router Directly

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/gaia-router' \
  -H 'Authorization: Bearer YOUR_SERVICE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "task_spec": {
      "type": "EVENT_PLANNING",
      "user_id": "test-user-id",
      "stella_handle": "@test.network",
      "context": {
        "event_details": {
          "date": "2025-12-06",
          "location": "San Francisco, CA"
        }
      }
    }
  }'
```

### Test from Next.js

```typescript
// Test route
POST /api/gaia/route
{
  "task_spec": {
    "type": "EVENT_PLANNING",
    "context": {
      "event_details": {
        "date": "2025-12-06",
        "location": "SF"
      }
    }
  }
}
```

## Monitoring

### Check Routing Logs

```sql
SELECT 
  stella_handle,
  task_type,
  task_description,
  success_flag,
  latency_ms,
  input_json->'routes' as routes,
  output_json->'execution_result' as result
FROM agent_usage_logs
WHERE task_type = 'ROUTING'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Agent Performance

```sql
SELECT 
  a.name,
  ac.success_rate,
  ac.average_latency_ms,
  ac.total_uses
FROM agents a
JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE a.status = 'ACTIVE'
ORDER BY ac.success_rate DESC;
```

## Next Steps

1. ✅ Gaia router created
2. ✅ Prime agent enhanced
3. ⏭️ **Deploy Gaia router** (`supabase functions deploy gaia-router`)
4. ⏭️ **Test routing** from Stella interface
5. ⏭️ **Monitor routing logs** for performance

## Files

- `supabase/functions/gaia-router/index.ts` - Gaia router edge function
- `app/api/gaia/route/route.ts` - Next.js API route wrapper
- `docs/STELLA_ROUTING_SETUP.md` - This file

Ready to route! 🚀

