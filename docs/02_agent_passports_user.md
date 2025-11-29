# Agent Passports (User)

## What is a User Agent Passport?

A **User Agent Passport** is a machine-readable identity card for each user's Stella instance. It contains:
- Digital DNA v2 (personality vectors)
- Trust score
- Capabilities
- Preferences (autonomy level, privacy settings)
- Verification status

Think of it as Stella's "resume" that other agents can read to understand the user's personality and preferences.

## Purpose

1. **Personalization**: Agents use passport to personalize responses
2. **Trust**: Agents check trust score before executing sensitive tasks
3. **Context**: Agents understand user's goals, constraints, traits
4. **Proactivity**: Autonomy score determines how proactive Stella can be
5. **External Sharing**: Can be shared with external agents (future)

## Database Schema

```sql
CREATE TABLE public.agent_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    handle_id UUID REFERENCES public.agent_handles(id) ON DELETE SET NULL,
    dna_id UUID REFERENCES public.digital_dna_v2(id) ON DELETE SET NULL,
    
    -- Passport data (JSON-LD format)
    passport_data JSONB NOT NULL,
    
    -- Permission settings
    public_fields JSONB DEFAULT '["handle", "composite_dna", "trust_score"]',
    authenticated_fields JSONB DEFAULT '["goals", "constraints", "capabilities"]',
    
    version INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Passport Data Structure

```json
{
  "@context": "https://thenetwork.ai/passport/v1",
  "@type": "AgentIdentity",
  "id": "https://thenetwork.ai/passport/@ayen.monasha.network",
  "handle": "@ayen.monasha.network",
  "owner_id": "user-uuid",
  "created_at": "2024-01-15T10:30:00Z",
  "version": "2.0",
  
  "identity": {
    "name": "Ayen Monasha",
    "avatar": "https://...",
    "star_color": "#8E5BFF",
    "verified": true
  },
  
  "digital_dna": {
    "version": 2,
    "vectors": {
      "composite": [0.123, 0.456, ...],  // 3072 dimensions
      "traits": [0.789, 0.012, ...],
      "goals": [0.345, 0.678, ...],
      "constraints": [0.901, 0.234, ...],
      "behavioral": [0.567, 0.890, ...],
      "temporal": [0.123, 0.456, ...],
      "risk": [0.789, 0.012, ...]
    },
    "metadata": {
      "last_computed_at": "2024-01-15T10:00:00Z",
      "component_weights": {
        "behavioral": 0.35,
        "temporal": 0.20,
        "goals": 0.15,
        "traits": 0.15,
        "risk": 0.10,
        "constraints": 0.05
      }
    }
  },
  
  "trust": {
    "score": 0.85,
    "verification_level": "verified",
    "history_length": "45 days",
    "reputation_rank": 1250,
    "factors": {
      "email_verified": true,
      "phone_verified": true,
      "account_age_days": 45,
      "total_interactions": 150,
      "successful_interactions": 142
    }
  },
  
  "capabilities": {
    "can_chat": true,
    "can_route_tasks": true,
    "can_execute_actions": true,
    "supported_interfaces": ["chat", "voice"]
  },
  
  "preferences": {
    "autonomy": 0.7,  // 0 = always ask, 1 = fully autonomous
    "privacy_mode": "standard",
    "communication_style": "direct",
    "ethics": ["privacy_first", "transparency"]
  }
}
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Links to user's profile (one-to-one) |
| `handle_id` | UUID | Links to agent_handles table |
| `dna_id` | UUID | Links to digital_dna_v2 table |
| `passport_data` | JSONB | Complete passport in JSON-LD format |
| `public_fields` | JSONB | Fields visible to anyone |
| `authenticated_fields` | JSONB | Fields visible to authenticated users |
| `version` | INTEGER | Passport version (for versioning) |
| `last_updated` | TIMESTAMPTZ | Last update timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

## Permission Levels

### Public Fields
Anyone can read these fields:
- `handle`
- `composite_dna` (summary, not full vector)
- `trust_score` (basic score)

### Authenticated Fields
Requires authentication:
- `goals`
- `constraints`
- `capabilities`
- `preferences` (partial)

### Private Fields
Only user's Stella can access:
- Full DNA vectors (all 3072 dimensions)
- Detailed trust history
- Private preferences

## Key Components

### 1. Digital DNA v2
Personality vectors computed from user's behavior:
- **Composite Vector**: Overall personality (3072 dims)
- **Traits Vector**: Personality traits (3072 dims)
- **Goals Vector**: User's goals (3072 dims)
- **Constraints Vector**: User's constraints (3072 dims)
- **Behavioral Vector**: Behavior patterns (3072 dims)
- **Temporal Vector**: Time-based patterns (3072 dims)
- **Risk Vector**: Risk tolerance (3072 dims)

See: [Digital DNA v2](./11_digital_dna_v2.md)

### 2. Trust Score
Calculated from:
- Verification status (email, phone)
- Account age
- Interaction history
- Success rate
- Reputation rank

**Trust Score Ranges:**
- `0.0 - 0.3`: New user, low trust
- `0.4 - 0.6`: Established user, medium trust
- `0.7 - 0.9`: Trusted user, high trust
- `0.9 - 1.0`: Verified, premium user

### 3. Autonomy Score
Determines how proactive Stella can be:
- `0.0 - 0.3`: Always ask for confirmation
- `0.4 - 0.6`: Ask for important decisions
- `0.7 - 0.9`: Act proactively, confirm after
- `0.9 - 1.0`: Fully autonomous (future)

**Example:**
```typescript
if (passport.preferences.autonomy >= 0.7) {
  // Stella can proactively create events
  // Stella can send invites without asking
  // Stella can make suggestions
} else {
  // Stella must ask first
  // Stella needs confirmation
}
```

## How It's Used

### 1. Stella Personalization

When user chats with Stella:
```typescript
// Load user's passport
const passport = await getAgentPassport(userId);

// Stella uses DNA vectors to personalize responses
const systemPrompt = `
You are Stella (@${passport.handle}).

User's personality (from DNA):
- Goals: ${summarizeVector(passport.digital_dna.vectors.goals)}
- Traits: ${summarizeVector(passport.digital_dna.vectors.traits)}
- Constraints: ${summarizeVector(passport.digital_dna.vectors.constraints)}

User's preferences:
- Autonomy: ${passport.preferences.autonomy} (${passport.preferences.autonomy >= 0.7 ? 'proactive' : 'conservative'})
- Communication style: ${passport.preferences.communication_style}
`;
```

### 2. Agent Routing

When Gaia routes a task:
```typescript
// Gaia reads user's passport
const passport = await getAgentPassport(userId);

// Check trust requirements
if (passport.trust.score < requiredTrustThreshold) {
  // Require confirmation or reject
}

// Check autonomy level
if (passport.preferences.autonomy >= 0.7) {
  // Can execute without confirmation
} else {
  // Need confirmation first
}

// Use DNA vectors for agent matching
const bestAgent = findBestMatchingAgent(
  taskSpec,
  passport.digital_dna.vectors.composite
);
```

### 3. Agent Personalization

When Prime creates an event:
```typescript
// Prime receives passport
const passport = taskSpec.user_passport;

// Prime uses DNA to personalize event
const eventTheme = extractThemeFromDNA(
  passport.digital_dna.vectors.goals,
  passport.digital_dna.vectors.traits
);

// Prime uses preferences
if (passport.preferences.autonomy >= 0.7) {
  // Auto-invite people
  // Auto-set capacity
  // Auto-generate title
}
```

## Relationship to Other Tables

```
agent_passports (user)
    │
    ├──→ agent_handles (via handle_id)
    ├──→ digital_dna_v2 (via dna_id)
    ├──→ profiles (via user_id)
    │
    └──→ Used by:
         - Stella (personalization)
         - Gaia (routing decisions)
         - Agents (Prime, etc.) (personalization)
```

## Example Data

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "handle_id": "550e8400-e29b-41d4-a716-446655440000",
  "dna_id": "770e8400-e29b-41d4-a716-446655440000",
  "passport_data": {
    "@context": "https://thenetwork.ai/passport/v1",
    "handle": "@ayen.monasha.network",
    "digital_dna": {...},
    "trust": {...},
    "capabilities": {...},
    "preferences": {...}
  },
  "public_fields": ["handle", "composite_dna", "trust_score"],
  "authenticated_fields": ["goals", "constraints", "capabilities"],
  "version": 1,
  "last_updated": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Common Queries

### Get User's Passport
```sql
SELECT passport_data 
FROM agent_passports 
WHERE user_id = :user_id;
```

### Get Public Passport (for external agents)
```sql
SELECT 
  jsonb_extract_path(passport_data, VARIADIC public_fields) as public_data
FROM agent_passports 
WHERE handle_id = (
  SELECT id FROM agent_handles WHERE handle = :handle
);
```

### Update Passport
```sql
UPDATE agent_passports 
SET 
  passport_data = :new_passport_data,
  last_updated = NOW(),
  version = version + 1
WHERE user_id = :user_id;
```

## Related Documentation

- [Agent Handles](./01_agent_handles.md) - Handle identity
- [Digital DNA v2](./11_digital_dna_v2.md) - DNA vectors
- [Agent Passports (Agent)](./03_agent_passports_agent.md) - Specialist agent passports
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How passport is used

