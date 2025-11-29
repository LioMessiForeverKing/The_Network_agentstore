# Weekly Activities (Events)

## What is Weekly Activities?

The **Weekly Activities** table stores all events and activities that users create or share with Stella. This is where Prime (event planning agent) creates events.

## Purpose

1. **Event Storage**: Store all events created by Prime
2. **Calendar Integration**: Events appear in user's calendar
3. **Event Discovery**: Other users can discover events
4. **Activity Tracking**: Track user's weekly plans and activities

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.user_weekly_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Activity Info
  activity_description TEXT NOT NULL,
  event_name TEXT,
  location TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  week_start DATE NOT NULL,  -- Monday of the week
  
  -- Event-Specific Fields
  tags TEXT[],  -- ["entrepreneurs", "music", "networking"]
  is_hosting BOOLEAN DEFAULT true,  -- true = hosting, false = attending
  event_image_url TEXT,
  event_title TEXT,
  max_capacity INTEGER,  -- Maximum attendees
  metadata JSONB,  -- Additional Prime-generated data
  
  -- Timestamps
  shared_with_stella_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_weekly_activities_user_week 
  ON public.user_weekly_activities(user_id, week_start DESC);
CREATE INDEX idx_weekly_activities_location 
  ON public.user_weekly_activities(location) 
  WHERE location IS NOT NULL;
CREATE INDEX idx_weekly_activities_tags 
  ON public.user_weekly_activities USING GIN(tags)
  WHERE tags IS NOT NULL;
CREATE INDEX idx_weekly_activities_hosting 
  ON public.user_weekly_activities(is_hosting, start_date)
  WHERE is_hosting = true AND start_date IS NOT NULL;
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key (event ID) |
| `user_id` | UUID | User who created/is hosting the event |
| `activity_description` | TEXT | Description of the activity |
| `event_name` | TEXT | Name of the event |
| `location` | TEXT | Event location (e.g., "San Francisco, CA") |
| `start_date` | TIMESTAMPTZ | Event start time |
| `end_date` | TIMESTAMPTZ | Event end time |
| `week_start` | DATE | Monday of the week (for grouping) |
| `tags` | TEXT[] | Event tags (for matching) |
| `is_hosting` | BOOLEAN | true = user is hosting, false = attending |
| `event_image_url` | TEXT | URL to event image |
| `event_title` | TEXT | Title of the event post |
| `max_capacity` | INTEGER | Maximum number of attendees |
| `metadata` | JSONB | Additional Prime-generated data |
| `shared_with_stella_at` | TIMESTAMPTZ | When shared with Stella |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

## Example Data

### Event Created by Prime

```json
{
  "id": "event-uuid-123",
  "user_id": "user-uuid",
  "activity_description": "Entrepreneurs & Music Networking Dinner",
  "event_name": "Entrepreneurs & Music Networking",
  "location": "San Francisco, CA",
  "start_date": "2025-12-06T19:00:00Z",
  "end_date": "2025-12-06T22:00:00Z",
  "week_start": "2025-12-01",
  "tags": ["entrepreneurship", "music", "networking", "dinner"],
  "is_hosting": true,
  "event_image_url": "https://...",
  "event_title": "Entrepreneurs & Music Networking",
  "max_capacity": 10,
  "metadata": {
    "created_by": "prime-agent",
    "auto_invited": true,
    "theme": ["entrepreneurship", "music"],
    "venue_type": "restaurant",
    "dress_code": "casual",
    "prime_confidence": 0.95
  },
  "shared_with_stella_at": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-15T10:00:00Z"
}
```

## How Prime Uses This

### 1. Creating Events

When Prime creates an event:

```typescript
// Prime creates event
const event = await db.from('weekly_activities').insert({
  user_id: taskSpec.user_id,
  activity_description: "Entrepreneurs & Music Networking Dinner",
  event_name: "Entrepreneurs & Music Networking",
  location: "San Francisco, CA",
  start_date: "2025-12-06T19:00:00Z",
  end_date: "2025-12-06T22:00:00Z",
  week_start: getWeekStart(new Date("2025-12-06")),
  tags: ["entrepreneurship", "music", "networking"],
  is_hosting: true,
  event_title: "Entrepreneurs & Music Networking",
  max_capacity: 10,
  metadata: {
    created_by: "prime-agent",
    auto_invited: true,
    theme: ["entrepreneurship", "music"]
  }
}).select().single();
```

### 2. Finding Events

Prime can query events for matching:

```typescript
// Find events matching user's interests
const events = await db
  .from('weekly_activities')
  .select('*')
  .eq('is_hosting', true)
  .gte('start_date', new Date().toISOString())
  .overlaps('tags', userInterests)
  .ilike('location', `%${userLocation}%`)
  .limit(10);
```

### 3. Event Discovery

Users can discover events:

```sql
-- Find upcoming events in a location
SELECT *
FROM user_weekly_activities
WHERE 
  is_hosting = true
  AND start_date >= NOW()
  AND location ILIKE '%San Francisco%'
ORDER BY start_date ASC
LIMIT 20;
```

## Tags System

Tags are used for:
1. **Matching**: Find events matching user interests
2. **Discovery**: Users can search by tags
3. **Network Matching**: Prime uses tags to find invitees

**Tag Structure:**
- Array of strings: `["entrepreneurship", "music", "networking"]`
- Typically 3-6 tags per event
- Mix of user interests + event-specific tags

**Example:**
```typescript
// Prime generates tags from:
// 1. User's interests (from profiles.interests)
// 2. Event description (extracted via LLM)
// 3. Event theme (from user request)

const tags = [
  ...userInterests.slice(0, 3),  // Top 3 user interests
  "networking",  // Always include networking
  ...extractedEventTags  // From event description
].slice(0, 6);  // Max 6 tags
```

## Metadata Field

The `metadata` JSONB field stores flexible data:

```json
{
  "created_by": "prime-agent",
  "auto_invited": true,
  "theme": ["entrepreneurship", "music"],
  "venue_type": "restaurant",
  "dress_code": "casual",
  "prime_confidence": 0.95,
  "invite_count": 10,
  "confirmed_count": 0,
  "venue_details": {
    "name": "Chinese Restaurant",
    "address": "123 Main St, SF"
  }
}
```

## Relationship to Other Tables

```
weekly_activities
    │
    ├──→ profiles (via user_id) - Event host
    │
    ├──→ event_attendees (via id = event_id) - Invites/attendees
    │
    └──→ agent_usage_logs (via resulting_event_id) - Creation log
```

## Common Queries

### Get User's Events
```sql
SELECT *
FROM user_weekly_activities
WHERE user_id = :user_id
ORDER BY start_date DESC;
```

### Get Upcoming Events
```sql
SELECT *
FROM user_weekly_activities
WHERE 
  is_hosting = true
  AND start_date >= NOW()
ORDER BY start_date ASC;
```

### Find Events by Tags
```sql
SELECT *
FROM user_weekly_activities
WHERE 
  tags && ARRAY['entrepreneurship', 'music']
  AND start_date >= NOW()
ORDER BY start_date ASC;
```

### Get Events in Location
```sql
SELECT *
FROM user_weekly_activities
WHERE 
  location ILIKE '%San Francisco%'
  AND start_date >= NOW()
ORDER BY start_date ASC;
```

## Related Documentation

- [Event Attendees](./07_event_attendees.md) - Invites and attendance
- [Agent Usage Logs](./05_agent_usage_logs.md) - Event creation logs
- [Profiles](./08_profiles.md) - User data
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How Prime creates events

