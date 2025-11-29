# Twin Actions

## What is Twin Actions?

**Twin Actions** logs all actions that Stella (twin) takes or proposes. This provides an audit trail of Stella's actions.

## Purpose

1. **Action Logging**: Track all Stella actions
2. **User Approval**: Track which actions user approved
3. **Status Tracking**: Track action status (PENDING, SUCCESS, FAILED)
4. **Audit Trail**: Full history of Stella's actions

## Database Schema

```sql
CREATE TABLE public.twin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,  -- create_event, route_task, etc.
    action_spec JSONB NOT NULL,
    result JSONB,
    status TEXT DEFAULT 'PENDING',  -- SUCCESS, FAILED, PENDING
    user_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Action Types

- **create_event**: Stella created an event
- **route_task**: Stella routed a task
- **propose_pulse**: Stella proposed a pulse
- **send_invite**: Stella sent an invite

## Related Documentation

- [Twin Episodic Memory](./13_twin_episodic_memory.md) - Detailed memories
- [Twin Semantic Memory](./14_twin_semantic_memory.md) - Summarized facts
- [Agent Usage Logs](./05_agent_usage_logs.md) - Agent interaction logs

