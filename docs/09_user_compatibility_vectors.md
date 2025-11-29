# User Compatibility Vectors

## What is User Compatibility Vectors?

The **User Compatibility Vectors** table stores vector embeddings (3072 dimensions) computed from user's platform data (YouTube, TikTok, Spotify, Pinterest). Prime uses these vectors for similarity matching.

## Purpose

1. **Similarity Matching**: Calculate compatibility between users using cosine similarity
2. **Network Matching**: Find users with similar interests/behavior
3. **Event Matching**: Match event themes to user vectors

## Database Schema

```sql
CREATE TABLE user_compatibility_vectors (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  combined_vector VECTOR(3072),  -- Combined from all platforms
  platform_weights JSONB,  -- {'youtube': 0.4, 'tiktok': 0.3, ...}
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

## How Prime Uses This

### 1. Similarity Calculation

Prime calculates cosine similarity:

```typescript
// Get user's vector
const { data: userVector } = await db
  .from('user_compatibility_vectors')
  .select('combined_vector')
  .eq('user_id', userId)
  .single();

// Get candidate vectors
const { data: candidateVectors } = await db
  .from('user_compatibility_vectors')
  .select('user_id, combined_vector')
  .in('user_id', candidateIds);

// Calculate similarity
const similarity = cosineSimilarity(
  userVector.combined_vector,
  candidateVector.combined_vector
);

// Higher similarity = better match
```

### 2. Ranking Matches

Prime ranks matches by similarity:

```typescript
const matches = candidates.map(candidate => ({
  user_id: candidate.user_id,
  similarity: cosineSimilarity(userVector, candidate.vector),
  // ... other data
}));

// Sort by similarity (highest first)
matches.sort((a, b) => b.similarity - a.similarity);
```

## Related Documentation

- [Profiles](./08_profiles.md) - User data
- [Graph Nodes & Edges](./10_graph_nodes_edges.md) - Network graph
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How Prime uses vectors

