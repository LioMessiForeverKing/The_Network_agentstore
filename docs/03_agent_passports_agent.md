# Agent Capabilities (Agent Passports)

## What is Agent Capabilities?

**Agent Capabilities** is a machine-readable description of a specialist agent's capabilities, performance metrics, and trust scores. This is stored in a **separate table** from user passports.

**Key Difference:**
- **User Agent Passport** (`agent_passports` table): Describes USER's Stella (personality, DNA, preferences)
- **Agent Capabilities** (`agent_capabilities` table): Describes SPECIALIST AGENT (Prime, Study Planner, etc.)

## Purpose

1. **Routing Decisions**: Gaia uses agent capabilities to choose which agent to route to
2. **Performance Tracking**: Track success rate, latency, total uses
3. **Capability Matching**: Match task requirements to agent capabilities
4. **Trust & Safety**: Check agent trust scores before routing
5. **Future Marketplace**: Agents can be priced/ranked based on performance

## Database Schema

**Note:** Agent capabilities are stored in a **separate table** `agent_capabilities`, not in `agent_passports`:

```sql
CREATE TABLE public.agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Passport data (JSONB format)
    passport_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Performance metrics (can also be in passport_data, but stored here for easy querying)
    success_rate DECIMAL(5, 4) DEFAULT 0.0 CHECK (success_rate >= 0 AND success_rate <= 1),
    average_latency_ms INTEGER DEFAULT 0,
    total_uses INTEGER DEFAULT 0,
    
    version INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Passport Data Structure (for Agents)

```json
{
  "@context": "https://thenetwork.ai/passport/v1",
  "@type": "SpecialistAgent",
  "agent_id": "prime-uuid",
  "agent_slug": "prime",
  "name": "Prime",
  "domain": "EVENT_PLANNING",
  
  "capabilities": {
    "supported_task_types": [
      "EVENT_PLANNING",
      "EVENT_UPDATE",
      "EVENT_DELETE",
      "NETWORK_MATCHING"
    ],
    "input_schema": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "required": true
        },
        "date": {
          "type": "string",
          "format": "ISO8601",
          "required": true
        },
        "theme": {
          "type": "array",
          "items": {"type": "string"}
        },
        "max_attendees": {
          "type": "number",
          "maximum": 50
        }
      }
    },
    "output_schema": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "UUID"
        },
        "invites_sent": {
          "type": "number"
        },
        "matches_found": {
          "type": "number"
        }
      }
    }
  },
  
  "trust_metrics": {
    "success_rate": 0.95,
    "average_latency_ms": 1250,
    "total_uses": 1500,
    "human_approved_corrections": 12,
    "last_30_days": {
      "success_rate": 0.97,
      "average_latency_ms": 1100,
      "total_uses": 450
    }
  },
  
  "constraints": {
    "max_attendees": 50,
    "jurisdictions": ["US", "CA"],
    "complexity_limits": {
      "max_events_per_day": 5,
      "max_invites_per_event": 50
    },
    "safety_rules": {
      "requires_confirmation_for": ["event_deletion", "bulk_invites"],
      "blocked_task_types": []
    }
  },
  
  "preferences": {
    "preferred_task_types": ["EVENT_PLANNING", "NETWORK_MATCHING"],
    "cost_hints": {
      "estimated_tokens": 2000,
      "estimated_cost_usd": 0.01
    }
  },
  
  "version": "1.0",
  "last_updated": "2024-01-15T10:30:00Z"
}
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `agent_id` | UUID | Links to agents table (specialist agent) |
| `passport_data` | JSONB | Complete passport in JSON-LD format |
| `success_rate` | DECIMAL | Success rate (0.0 to 1.0) |
| `average_latency_ms` | INTEGER | Average response time in milliseconds |
| `total_uses` | INTEGER | Total number of times agent was used |
| `version` | INTEGER | Passport version |
| `last_updated` | TIMESTAMPTZ | Last update timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

## Key Components

### 1. Supported Task Types

List of task types the agent can handle:
```json
"supported_task_types": [
  "EVENT_PLANNING",
  "EVENT_UPDATE",
  "EVENT_DELETE",
  "NETWORK_MATCHING"
]
```

**How Gaia uses this:**
```typescript
// Gaia queries agents that support the task type
const agents = await db.query(`
  SELECT a.*, ac.passport_data
  FROM agents a
  JOIN agent_capabilities ac ON ac.agent_id = a.id
  WHERE 
    a.status = 'ACTIVE'
    AND ac.passport_data->'capabilities'->'supported_task_types' 
        @> :taskType::jsonb
`, [taskSpec.type]);
```

### 2. Input/Output Schemas

Define what the agent expects and returns:
```json
"input_schema": {
  "location": "string (required)",
  "date": "ISO8601 (required)",
  "theme": "array of strings",
  "max_attendees": "number (max 50)"
}

"output_schema": {
  "event_id": "UUID",
  "invites_sent": "number",
  "matches_found": "number"
}
```

**How it's used:**
- Stella validates task spec against input schema
- Agents validate their output against output schema
- Type safety and error prevention

### 3. Trust Metrics

Performance data updated from `agent_usage_logs`:
```json
"trust_metrics": {
  "success_rate": 0.95,  // 95% of calls succeed
  "average_latency_ms": 1250,  // Average response time
  "total_uses": 1500,  // Total number of calls
  "human_approved_corrections": 12  // Times human fixed agent output
}
```

**How it's calculated:**
```sql
-- Update trust metrics from usage logs
UPDATE agent_capabilities ac
SET 
  success_rate = (
      SELECT AVG(success_flag::int)
      FROM agent_usage_logs
    WHERE agent_id = ac.agent_id
      AND created_at > NOW() - INTERVAL '30 days'
    ),
  average_latency_ms = (
      SELECT AVG(latency_ms)
      FROM agent_usage_logs
    WHERE agent_id = ac.agent_id
      AND created_at > NOW() - INTERVAL '30 days'
    ),
  total_uses = (
      SELECT COUNT(*)
      FROM agent_usage_logs
    WHERE agent_id = ac.agent_id
  )
WHERE ac.agent_id IS NOT NULL;
```

### 4. Constraints

Limits and safety rules:
```json
"constraints": {
  "max_attendees": 50,
  "jurisdictions": ["US", "CA"],
  "complexity_limits": {
    "max_events_per_day": 5
  },
  "safety_rules": {
    "requires_confirmation_for": ["event_deletion"]
  }
}
```

**How Gaia uses this:**
```typescript
// Check constraints before routing
if (taskSpec.max_attendees > agentCapabilities.constraints.max_attendees) {
  // Reject or find alternative agent
  return { error: "Agent cannot handle this many attendees" };
}
```

## How It's Used

### 1. Gaia Routing

When Gaia routes a task:
```typescript
// 1. Query agents that support the task type
const candidates = await getAgentsByTaskType(taskSpec.type);

// 2. Filter by constraints
const validAgents = candidates.filter(agent => 
  checkConstraints(agent.capabilities.constraints, taskSpec)
);

// 3. Rank by performance
const rankedAgents = validAgents.sort((a, b) => {
  // Higher success rate = better
  if (a.capabilities.success_rate !== b.capabilities.success_rate) {
    return b.capabilities.success_rate - a.capabilities.success_rate;
  }
  // Lower latency = better
  return a.capabilities.average_latency_ms - b.capabilities.average_latency_ms;
});

// 4. Route to best agent
const chosenAgent = rankedAgents[0];
```

### 2. Agent Discovery

Stella can discover available agents:
```typescript
// Get all active agents with their capabilities
const agents = await db.query(`
  SELECT 
    a.name,
    a.slug,
    ac.passport_data->'capabilities' as capabilities,
    ac.success_rate,
    ac.average_latency_ms
  FROM agents a
  JOIN agent_capabilities ac ON ac.agent_id = a.id
  WHERE a.status = 'ACTIVE'
`);

// Stella can suggest agents to user
stellaResponse = `I can help with that! I have access to:
- Prime (Event Planning) - 95% success rate
- Study Planner (Study Plans) - 92% success rate
- Ledger (Financial Insights) - 88% success rate
`;
```

### 3. Performance Monitoring

Track agent performance over time:
```sql
-- Get agent performance trends
SELECT 
  DATE_TRUNC('day', created_at) as day,
  AVG(success_flag::int) as success_rate,
  AVG(latency_ms) as avg_latency,
  COUNT(*) as total_calls
FROM agent_usage_logs
WHERE agent_id = :agent_id
GROUP BY day
ORDER BY day DESC;
```

## Relationship to Other Tables

```
agent_capabilities
    │
    ├──→ agents (via agent_id)
    │
    └──→ Updated from:
         - agent_usage_logs (performance metrics)
```

## Example Data

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "agent_id": "990e8400-e29b-41d4-a716-446655440000",
  "passport_data": {
    "@context": "https://thenetwork.ai/passport/v1",
    "agent_slug": "prime",
    "name": "Prime",
    "capabilities": {...},
    "trust_metrics": {...},
    "constraints": {...}
  },
  "success_rate": 0.95,
  "average_latency_ms": 1250,
  "total_uses": 1500,
  "version": 1,
  "last_updated": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Common Queries

### Get Agent Capabilities
```sql
SELECT passport_data 
FROM agent_capabilities 
WHERE agent_id = :agent_id;
```

### Get Agents by Task Type
```sql
SELECT a.*, ac.passport_data, ac.success_rate, ac.average_latency_ms
FROM agents a
JOIN agent_capabilities ac ON ac.agent_id = a.id
WHERE 
  a.status = 'ACTIVE'
  AND ac.passport_data->'capabilities'->'supported_task_types' 
      @> :taskType::jsonb
ORDER BY 
  ac.success_rate DESC,
  ac.average_latency_ms ASC;
```

### Update Trust Metrics
```sql
UPDATE agent_capabilities ac
SET 
  success_rate = :new_success_rate,
  average_latency_ms = :new_latency,
  total_uses = :new_total_uses,
  last_updated = NOW()
WHERE ac.agent_id = :agent_id;
```

## Related Documentation

- [Agents Catalog](./04_agents_catalog.md) - Agent registry
- [Agent Usage Logs](./05_agent_usage_logs.md) - Performance tracking
- [Agent Passports (User)](./02_agent_passports_user.md) - User passports (separate table)
