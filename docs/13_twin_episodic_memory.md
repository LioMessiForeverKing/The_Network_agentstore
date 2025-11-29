# Twin Episodic Memory

## What is Twin Episodic Memory?

**Twin Episodic Memory** stores detailed memories of specific events and interactions. This is Stella's long-term memory for detailed context.

## Purpose

1. **Detailed Memories**: Store specific events, conversations, interactions
2. **Vector Search**: Use embeddings for semantic search
3. **Context Retrieval**: Stella can retrieve relevant memories
4. **Long-Term Memory**: Persistent memory across sessions

## Database Schema

```sql
CREATE TABLE public.twin_episodic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(3072),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## How Stella Uses This

Stella can retrieve relevant memories:

```typescript
// Search for relevant memories
const memories = await db.query(`
  SELECT content, metadata
  FROM twin_episodic_memory
  WHERE twin_id = :userId
  ORDER BY embedding <=> :queryVector
  LIMIT 5
`);
```

## Related Documentation

- [Twin Semantic Memory](./14_twin_semantic_memory.md) - Summarized facts
- [Twin Actions](./15_twin_actions.md) - Action log

