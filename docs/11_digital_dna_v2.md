# Digital DNA v2

## What is Digital DNA v2?

**Digital DNA v2** is a multi-component personality vector system that represents a user's personality, goals, constraints, traits, and behavior patterns. Stella uses this for personalization.

## Purpose

1. **Personality Representation**: Capture user's personality in vectors
2. **Personalization**: Stella uses DNA to personalize responses
3. **Agent Context**: Agents use DNA to understand user preferences
4. **Proactivity**: DNA determines how proactive Stella can be

## Database Schema

```sql
CREATE TABLE public.digital_dna_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    version INTEGER DEFAULT 2,
    
    -- Component vectors (all 3072 dimensions)
    behavioral_vector VECTOR(3072),
    temporal_vector VECTOR(3072),
    goals_vector VECTOR(3072),
    constraints_vector VECTOR(3072),
    risk_vector VECTOR(3072),
    traits_vector VECTOR(3072),
    composite_vector VECTOR(3072),
    
    -- Metadata
    component_weights JSONB DEFAULT '{
      "behavioral": 0.35,
      "temporal": 0.20,
      "goals": 0.15,
      "traits": 0.15,
      "risk": 0.10,
      "constraints": 0.05
    }',
    computation_metadata JSONB DEFAULT '{}',
    last_computed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Component Vectors

| Vector | Description |
|--------|-------------|
| `behavioral_vector` | Behavior patterns, habits |
| `temporal_vector` | Time-based patterns, schedules |
| `goals_vector` | User's goals, aspirations |
| `constraints_vector` | User's constraints, limitations |
| `risk_vector` | Risk tolerance, preferences |
| `traits_vector` | Personality traits |
| `composite_vector` | Weighted combination of all vectors |

## How Stella Uses This

### 1. Personalization

Stella loads DNA and personalizes responses:

```typescript
// Load user's DNA
const dna = await getDigitalDNA(userId);

// Stella's system prompt includes DNA
const systemPrompt = `
You are Stella. User's personality:
- Goals: ${summarizeVector(dna.goals_vector)}
- Traits: ${summarizeVector(dna.traits_vector)}
- Constraints: ${summarizeVector(dna.constraints_vector)}
`;
```

### 2. Agent Context

Agents receive DNA for context:

```typescript
// Prime receives DNA in task spec
const taskSpec = {
  user_dna: {
    goals_vector: dna.goals_vector,
    traits_vector: dna.traits_vector,
    constraints_vector: dna.constraints_vector
  }
};
```

## Related Documentation

- [Agent Passports (User)](./02_agent_passports_user.md) - DNA stored in passport
- [DNA Computation Log](./12_dna_computation_log.md) - DNA versioning
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How DNA is used

