# Profiles

## What is Profiles?

The **Profiles** table stores user profile data including interests, location, bio, and other user information. Prime uses this data for network matching.

## Purpose

1. **User Data**: Store user profile information
2. **Network Matching**: Prime uses interests and location for matching
3. **Identity**: User's name, avatar, bio
4. **Preferences**: User's interests, location, communication preferences

## Key Fields for Agent System

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | User ID (primary key) |
| `full_name` | TEXT | User's full name |
| `avatar_url` | TEXT | Profile picture URL |
| `star_color` | TEXT | User's theme color |
| `interests` | TEXT[] | Array of interest tags |
| `location` | TEXT | User's location (e.g., "San Francisco, CA") |
| `bio` | TEXT | User's bio/description |
| `agent_handle_id` | UUID | Links to agent_handles table |

## How Prime Uses This

### 1. Network Matching

Prime queries profiles for matching:

```typescript
// Find users with matching interests and location
const matches = await db
  .from('profiles')
  .select('id, full_name, interests, location, bio')
  .ilike('location', `%${eventLocation}%`)
  .overlaps('interests', eventTags)
  .neq('id', currentUserId)
  .limit(10);
```

### 2. Interest Matching

Prime uses interests array for tag matching:

```typescript
// User's interests: ["entrepreneurship", "music", "technology"]
// Event tags: ["entrepreneurship", "music"]
// Match if interests overlap with event tags
const matchingUsers = profiles.filter(profile => 
  profile.interests.some(interest => eventTags.includes(interest))
);
```

### 3. Location Matching

Prime filters by location:

```typescript
// Find users in same location
const localUsers = await db
  .from('profiles')
  .select('*')
  .ilike('location', `%${location}%`);
```

## Related Documentation

- [User Compatibility Vectors](./09_user_compatibility_vectors.md) - Vector embeddings
- [Graph Nodes & Edges](./10_graph_nodes_edges.md) - Network graph
- [Agent Handles](./01_agent_handles.md) - Links via agent_handle_id

