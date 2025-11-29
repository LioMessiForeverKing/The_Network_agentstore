# Graph Nodes & Edges

## What is Graph Nodes & Edges?

The **Graph Nodes & Edges** tables form a network graph representing relationships between users, agents, and twins. Prime can use this graph for network matching.

## Purpose

1. **Network Relationships**: Represent connections between users
2. **Similarity Edges**: Link users with similar interests
3. **Trust Edges**: Represent trust relationships
4. **Collaboration Edges**: Track collaborations

## Database Schema

```sql
-- Graph nodes (users, agents, twins)
CREATE TABLE graph_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'HUMAN',  -- HUMAN, AGENT, TWIN
    entity_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    embedding VECTOR(3072),  -- DNA composite_vector
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Graph edges (relationships)
CREATE TABLE graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_node UUID REFERENCES graph_nodes(id) ON DELETE CASCADE NOT NULL,
    to_node UUID REFERENCES graph_nodes(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,  -- SIMILARITY, TRUST, COLLABORATION
    weight FLOAT DEFAULT 0.0,  -- Relationship strength
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_node, to_node, type)
);
```

## Edge Types

- **SIMILARITY**: Users with similar interests/DNA
- **TRUST**: Trust relationships between users
- **COLLABORATION**: Users who have collaborated
- **CAPABILITY**: Links users to agents
- **HUMAN_AGENT_LINK**: Links users to their Stella

## How Prime Uses This

### 1. Network Traversal

Prime can find users through network:

```typescript
// Find users connected to event host
const connectedUsers = await db.query(`
  SELECT DISTINCT gn2.entity_id
  FROM graph_nodes gn1
  JOIN graph_edges ge ON ge.from_node = gn1.id
  JOIN graph_nodes gn2 ON gn2.id = ge.to_node
  WHERE 
    gn1.entity_id = :hostUserId
    AND ge.type = 'SIMILARITY'
    AND ge.weight > 0.3
`);
```

### 2. Trust-Based Matching

Prime can prioritize trusted connections:

```typescript
// Find users with high trust
const trustedUsers = await db.query(`
  SELECT ge.to_node, ge.weight
  FROM graph_edges ge
  JOIN graph_nodes gn ON gn.id = ge.from_node
  WHERE 
    gn.entity_id = :hostUserId
    AND ge.type = 'TRUST'
    AND ge.weight > 0.7
  ORDER BY ge.weight DESC
`);
```

## Related Documentation

- [Profiles](./08_profiles.md) - User data
- [User Compatibility Vectors](./09_user_compatibility_vectors.md) - Vector embeddings
- [Digital DNA v2](./11_digital_dna_v2.md) - DNA vectors used in graph

