# Twin Semantic Memory

## What is Twin Semantic Memory?

**Twin Semantic Memory** stores summarized facts, preferences, and rules. This is Stella's condensed knowledge about the user.

## Purpose

1. **Summarized Facts**: Store condensed knowledge
2. **Preferences**: User preferences and rules
3. **Quick Access**: Fast retrieval of key facts
4. **Pattern Recognition**: Store learned patterns

## Database Schema

```sql
CREATE TABLE public.twin_semantic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    category TEXT,  -- PREFERENCE, FACT, RULE, GOAL, CONSTRAINT
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Categories

- **PREFERENCE**: User preferences
- **FACT**: Facts about the user
- **RULE**: Rules the user follows
- **GOAL**: User's goals
- **CONSTRAINT**: User's constraints

## Related Documentation

- [Twin Episodic Memory](./13_twin_episodic_memory.md) - Detailed memories
- [Twin Actions](./15_twin_actions.md) - Action log

