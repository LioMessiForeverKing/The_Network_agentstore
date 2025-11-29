# Agent Handles

## What is an Agent Handle?

An **Agent Handle** is a unique identifier for each user's Stella (AI companion) instance. Think of it as Stella's "username" or "identity" in the agent ecosystem.

## Format

```
@firstname.lastname.network
```

**Examples:**
- `@ayen.monasha.network`
- `@sophia.green.network`
- `@john.doe.network`

## Purpose

1. **Identity**: Each user has ONE Stella instance, identified by their handle
2. **Scalability**: Different users have different Stella personalities (based on their DNA)
3. **Trust**: Handles can be verified, creating trust signals
4. **External Reference**: Other agents can reference your Stella by handle
5. **Audit Trail**: All agent interactions are logged with the handle

## Database Schema

```sql
CREATE TABLE public.agent_handles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    handle TEXT UNIQUE NOT NULL,  -- @firstname.lastname.network
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_reserved BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_handles_handle ON public.agent_handles(LOWER(handle));
CREATE INDEX idx_agent_handles_user ON public.agent_handles(user_id);
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Links to user's profile (one-to-one) |
| `handle` | TEXT | Unique handle (e.g., `@ayen.monasha.network`) |
| `is_verified` | BOOLEAN | Whether handle is verified (trust signal) |
| `is_premium` | BOOLEAN | Premium handles (future feature) |
| `is_reserved` | BOOLEAN | Reserved handles (brand names, etc.) |
| `metadata` | JSONB | Additional data (source, claim date, etc.) |
| `created_at` | TIMESTAMPTZ | When handle was created |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## How It's Used

### 1. Stella Identity

When a user chats with Stella, the system:
1. Gets user's `agent_handle.handle` (e.g., `@ayen.monasha.network`)
2. Loads user's `agent_passport` (personality, DNA, preferences)
3. Stella responds with personality matching user's DNA

```typescript
// In stella_chat edge function
const { data: handleData } = await supabase
  .from('agent_handles')
  .select('handle')
  .eq('user_id', userId)
  .single();

const stellaHandle = handleData.handle; // "@ayen.monasha.network"
```

### 2. Agent Usage Logging

All agent interactions are logged with the handle:

```sql
INSERT INTO agent_usage_logs (
  stella_handle,  -- "@ayen.monasha.network"
  agent_id,
  task_type,
  ...
) VALUES (...);
```

This allows:
- Tracking all interactions for a specific Stella instance
- Analytics per user
- Debugging user-specific issues

### 3. External Agent Reference

Other agents can reference your Stella by handle:

```json
{
  "stella_handle": "@ayen.monasha.network",
  "task": "collaborate_on_event",
  "context": "..."
}
```

### 4. Trust & Verification

Verified handles create trust signals:

```typescript
const handle = await getAgentHandle(userId);
if (handle.is_verified) {
  // Higher trust score
  // Can access premium features
  // Can collaborate with other verified Stellas
}
```

## Relationship to Other Tables

```
agent_handles (1) ──→ (1) profiles
    │
    │ (via handle_id)
    ▼
agent_passports (user) ──→ Contains handle in passport_data
    │
    │ (via stella_handle)
    ▼
agent_usage_logs ──→ All interactions logged with handle
```

## Example Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "handle": "@ayen.monasha.network",
  "is_verified": true,
  "is_premium": false,
  "is_reserved": false,
  "metadata": {
    "claimed_at": "2024-01-15T10:30:00Z",
    "source": "user_signup",
    "suggested_alternatives": []
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Key Concepts

### One Handle Per User
- Each user has exactly ONE handle
- Handle is unique across all users
- Handle cannot be changed (immutable identity)

### Case-Insensitive
- Handles are stored in lowercase
- `@Ayen.Monasha.Network` = `@ayen.monasha.network`
- Index uses `LOWER(handle)` for efficient lookups

### Verification
- Verified handles have `is_verified = true`
- Verification requires email/phone confirmation
- Verified handles get higher trust scores

### Premium Handles
- Future feature for premium users
- Short handles, custom formats, etc.

## Common Queries

### Get User's Handle
```sql
SELECT handle 
FROM agent_handles 
WHERE user_id = :user_id;
```

### Check if Handle Exists
```sql
SELECT id 
FROM agent_handles 
WHERE LOWER(handle) = LOWER(:handle);
```

### Get All Interactions for a Handle
```sql
SELECT * 
FROM agent_usage_logs 
WHERE stella_handle = :handle 
ORDER BY created_at DESC;
```

## Related Documentation

- [Agent Passports (User)](./02_agent_passports_user.md) - Uses handle in passport_data
- [Agent Usage Logs](./05_agent_usage_logs.md) - Logs interactions with handle
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How handle is used in routing

