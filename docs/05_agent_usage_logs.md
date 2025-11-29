# Agent Usage Logs

## What is Agent Usage Logs?

**Agent Usage Logs** is a comprehensive audit trail table that tracks every interaction between Stella, Gaia, and specialist agents. It provides complete observability into the agent system.

## Purpose

1. **Audit Trail**: Track every agent interaction from start to finish
2. **Performance Monitoring**: Measure success rates, latency, errors
3. **Debugging**: Full context for troubleshooting issues
4. **Analytics**: Understand usage patterns, popular agents, user behavior
5. **Trust Building**: Track agent performance for routing decisions
6. **Multi-Agent Chains**: Link sequential agent calls together

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.agent_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Stella Identifier
    stella_handle TEXT NOT NULL,  -- @ayen.monasha.network
    
    -- Agent Reference
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    -- NULL if this is Stella's own action (not routed to agent)
    
    -- User Reference
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Task Information
    task_type TEXT NOT NULL,  -- "event_planning", "routing", "response_formatting"
    task_description TEXT,  -- Human-readable description
    
    -- Full Context
    full_context_json JSONB NOT NULL,  -- Complete Stella request JSON
    routing_metadata JSONB,  -- Gaia's analysis (if Gaia was involved)
    task_steps JSONB,  -- Array of steps: ["analyzed_network", "created_event"]
    
    -- Input/Output
    input_json JSONB,  -- What was sent to agent
    output_json JSONB,  -- What agent returned
    
    -- Results
    resulting_event_id UUID REFERENCES public.weekly_activities(id) ON DELETE SET NULL,
    success_flag BOOLEAN DEFAULT true,
    latency_ms INTEGER,
    error_message TEXT,
    
    -- Multi-Agent Chain
    parent_usage_log_id UUID REFERENCES public.agent_usage_logs(id) ON DELETE SET NULL,
    chain_position INTEGER,  -- 1, 2, 3... for sequential chains
    
    -- User Feedback
    user_feedback TEXT,  -- "thumbs_up", "thumbs_down", "not_useful"
    user_feedback_text TEXT,  -- Optional text feedback
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_usage_stella_handle ON public.agent_usage_logs(stella_handle);
CREATE INDEX idx_agent_usage_agent ON public.agent_usage_logs(agent_id);
CREATE INDEX idx_agent_usage_user ON public.agent_usage_logs(user_id);
CREATE INDEX idx_agent_usage_event ON public.agent_usage_logs(resulting_event_id);
CREATE INDEX idx_agent_usage_task_type ON public.agent_usage_logs(task_type);
CREATE INDEX idx_agent_usage_created ON public.agent_usage_logs(created_at DESC);
CREATE INDEX idx_agent_usage_parent ON public.agent_usage_logs(parent_usage_log_id);
CREATE INDEX idx_agent_usage_success ON public.agent_usage_logs(success_flag, created_at);
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `stella_handle` | TEXT | Stella instance identifier (@ayen.monasha.network) |
| `agent_id` | UUID | Specialist agent (Prime, Gaia, etc.) or NULL for Stella |
| `user_id` | UUID | User who initiated the request |
| `task_type` | TEXT | Type of task (event_planning, routing, etc.) |
| `task_description` | TEXT | Human-readable description |
| `full_context_json` | JSONB | Complete context from Stella |
| `routing_metadata` | JSONB | Gaia's routing decision |
| `task_steps` | JSONB | Array of steps agent took |
| `input_json` | JSONB | Input sent to agent |
| `output_json` | JSONB | Output from agent |
| `resulting_event_id` | UUID | Event created (if applicable) |
| `success_flag` | BOOLEAN | Whether task succeeded |
| `latency_ms` | INTEGER | Response time in milliseconds |
| `error_message` | TEXT | Error message if failed |
| `parent_usage_log_id` | UUID | Links to parent log (for chains) |
| `chain_position` | INTEGER | Position in multi-agent chain |
| `user_feedback` | TEXT | User feedback (thumbs_up, etc.) |
| `user_feedback_text` | TEXT | Optional text feedback |
| `created_at` | TIMESTAMPTZ | When interaction occurred |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Example Data

### Stella's Initial Request
```json
{
  "id": "log-1-uuid",
  "stella_handle": "@ayen.monasha.network",
  "agent_id": null,  // Stella itself
  "user_id": "user-uuid",
  "task_type": "routing_request",
  "task_description": "User wants to create event",
  "full_context_json": {
    "user_message": "book an event for next friday at 7 pm in SF",
    "conversation_history": [...],
    "user_dna": {...},
    "user_preferences": {...}
  },
  "input_json": {
    "type": "EVENT_PLANNING",
    "context": {
      "date": "2025-12-06",
      "time": "19:00",
      "location": "San Francisco"
    }
  },
  "output_json": null,  // Not yet routed
  "success_flag": true,
  "latency_ms": 50,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Gaia's Routing Decision
```json
{
  "id": "log-2-uuid",
  "stella_handle": "@ayen.monasha.network",
  "agent_id": "gaia-uuid",
  "user_id": "user-uuid",
  "task_type": "routing",
  "task_description": "Gaia routes to Prime",
  "full_context_json": {...},
  "routing_metadata": {
    "chosen_agent": "Prime",
    "confidence": 0.95,
    "reason": "EVENT_PLANNING task",
    "alternatives_considered": ["study_planner", "ledger"],
    "decision_factors": {
      "task_type_match": true,
      "agent_performance": 0.95,
      "latency_acceptable": true
    }
  },
  "input_json": {...taskSpec...},
  "output_json": {
    "routing_decision": {
      "agent": "prime",
      "confidence": 0.95
    }
  },
  "parent_usage_log_id": "log-1-uuid",  // Links to Stella's request
  "chain_position": 2,
  "success_flag": true,
  "latency_ms": 100,
  "created_at": "2024-01-15T10:00:01Z"
}
```

### Prime's Execution
```json
{
  "id": "log-3-uuid",
  "stella_handle": "@ayen.monasha.network",
  "agent_id": "prime-uuid",
  "user_id": "user-uuid",
  "task_type": "EVENT_PLANNING",
  "task_description": "Create event and send invites",
  "full_context_json": {...},
  "routing_metadata": {
    "from_gaia": true,
    "routing_log_id": "log-2-uuid"
  },
  "task_steps": [
    "analyzed_network",
    "found_10_matches",
    "created_event",
    "sent_invites",
    "generated_personalized_messages"
  ],
  "input_json": {...taskSpec...},
  "output_json": {
    "event": {
      "id": "event-uuid",
      "title": "Entrepreneurs & Music Networking",
      "date": "2025-12-06T19:00:00Z"
    },
    "invites": {
      "sent": 10,
      "matches_found": 10
    }
  },
  "resulting_event_id": "event-uuid",
  "parent_usage_log_id": "log-2-uuid",  // Links to Gaia's routing
  "chain_position": 3,
  "success_flag": true,
  "latency_ms": 1250,
  "created_at": "2024-01-15T10:00:02Z"
}
```

## Multi-Agent Chains

### Chain Structure

```
User Request
    │
    ▼
Stella (log-1) ──→ agent_id: NULL
    │
    │ parent_usage_log_id: NULL
    │ chain_position: 1
    ▼
Gaia (log-2) ──→ agent_id: gaia-uuid
    │
    │ parent_usage_log_id: log-1
    │ chain_position: 2
    ▼
Prime (log-3) ──→ agent_id: prime-uuid
    │
    │ parent_usage_log_id: log-2
    │ chain_position: 3
    ▼
Result
```

### Query Full Chain

```sql
WITH RECURSIVE agent_chain AS (
    -- Start with root
    SELECT id, parent_usage_log_id, agent_id, task_type, 1 as depth
    FROM agent_usage_logs
    WHERE id = :root_id
    
    UNION ALL
    
    -- Recursively get children
    SELECT a.id, a.parent_usage_log_id, a.agent_id, a.task_type, ac.depth + 1
    FROM agent_usage_logs a
    JOIN agent_chain ac ON a.parent_usage_log_id = ac.id
)
SELECT * FROM agent_chain ORDER BY depth;
```

## How It's Used

### 1. Performance Tracking

Update agent trust metrics:
```sql
-- Calculate success rate for Prime
SELECT 
  AVG(success_flag::int) as success_rate,
  AVG(latency_ms) as avg_latency,
  COUNT(*) as total_uses
FROM agent_usage_logs
WHERE agent_id = 'prime-uuid'
AND created_at > NOW() - INTERVAL '30 days';
```

### 2. Debugging

Get full context for a failed request:
```sql
SELECT 
  aul.*,
  a.name as agent_name,
  a.slug as agent_slug
FROM agent_usage_logs aul
LEFT JOIN agents a ON a.id = aul.agent_id
WHERE aul.id = :log_id;
```

### 3. Analytics

Track usage patterns:
```sql
-- Most used agents
SELECT 
  a.name,
  COUNT(*) as total_calls,
  AVG(aul.success_flag::int) as success_rate,
  AVG(aul.latency_ms) as avg_latency
FROM agent_usage_logs aul
JOIN agents a ON a.id = aul.agent_id
WHERE aul.created_at > NOW() - INTERVAL '7 days'
GROUP BY a.id, a.name
ORDER BY total_calls DESC;
```

### 4. User Activity

Get all interactions for a user:
```sql
SELECT 
  aul.*,
  a.name as agent_name
FROM agent_usage_logs aul
LEFT JOIN agents a ON a.id = aul.agent_id
WHERE aul.user_id = :user_id
ORDER BY aul.created_at DESC
LIMIT 50;
```

### 5. Event Tracking

Get all actions for an event:
```sql
SELECT 
  aul.*,
  a.name as agent_name
FROM agent_usage_logs aul
LEFT JOIN agents a ON a.id = aul.agent_id
WHERE aul.resulting_event_id = :event_id
ORDER BY aul.created_at;
```

## Common Queries

### Get Agent Performance
```sql
SELECT 
  a.name,
  COUNT(*) as total_calls,
  AVG(aul.success_flag::int) as success_rate,
  AVG(aul.latency_ms) as avg_latency,
  COUNT(*) FILTER (WHERE aul.success_flag = false) as failures
FROM agent_usage_logs aul
JOIN agents a ON a.id = aul.agent_id
WHERE aul.created_at > NOW() - INTERVAL '30 days'
GROUP BY a.id, a.name
ORDER BY success_rate DESC;
```

### Get User's Recent Interactions
```sql
SELECT 
  aul.task_type,
  aul.task_description,
  a.name as agent_name,
  aul.success_flag,
  aul.created_at
FROM agent_usage_logs aul
LEFT JOIN agents a ON a.id = aul.agent_id
WHERE aul.user_id = :user_id
ORDER BY aul.created_at DESC
LIMIT 20;
```

### Get Failed Requests
```sql
SELECT 
  aul.*,
  a.name as agent_name
FROM agent_usage_logs aul
LEFT JOIN agents a ON a.id = aul.agent_id
WHERE aul.success_flag = false
AND aul.created_at > NOW() - INTERVAL '24 hours'
ORDER BY aul.created_at DESC;
```

## Related Documentation

- [Agent Handles](./01_agent_handles.md) - Stella identity
- [Agents Catalog](./04_agents_catalog.md) - Agent registry
- [Agent Passports (Agent)](./03_agent_passports_agent.md) - Performance metrics
- [Weekly Activities](./06_weekly_activities.md) - Events created
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How logging works

