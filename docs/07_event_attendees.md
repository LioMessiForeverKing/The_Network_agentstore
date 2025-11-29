# Event Attendees

## What is Event Attendees?

The **Event Attendees** table tracks who is invited to and attending events. Prime creates invite records here when sending invites.

## Purpose

1. **Invite Tracking**: Track who is invited to events
2. **Attendance Status**: Track confirmed, pending, declined attendees
3. **Event Capacity**: Enforce max_capacity limits
4. **Network Visualization**: Show who's attending events

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.user_weekly_activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'maybe', 'declined')) 
      DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_event_attendees_event 
  ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user 
  ON public.event_attendees(user_id);
CREATE INDEX idx_event_attendees_status 
  ON public.event_attendees(event_id, status);
CREATE INDEX idx_event_attendees_user_status 
  ON public.event_attendees(user_id, status)
  WHERE status = 'confirmed';
```

## Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Links to weekly_activities.id |
| `user_id` | UUID | Invited/attending user |
| `status` | TEXT | 'pending', 'confirmed', 'maybe', 'declined' |
| `confirmed_at` | TIMESTAMPTZ | When status changed to 'confirmed' |
| `created_at` | TIMESTAMPTZ | When invite was created |

## Status Values

### pending
- Initial status when Prime creates invite
- User hasn't responded yet
- Invite is waiting for user action

### confirmed
- User accepted the invite
- User will attend the event
- `confirmed_at` is set when status changes

### maybe
- User is unsure about attending
- User might attend
- Can change to 'confirmed' or 'declined' later

### declined
- User declined the invite
- User will not attend
- Final status (usually)

## Example Data

### Invite Created by Prime

```json
{
  "id": "attendee-uuid-1",
  "event_id": "event-uuid-123",
  "user_id": "invitee-uuid-1",
  "status": "pending",
  "confirmed_at": null,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### User Confirms

```json
{
  "id": "attendee-uuid-1",
  "event_id": "event-uuid-123",
  "user_id": "invitee-uuid-1",
  "status": "confirmed",
  "confirmed_at": "2024-01-15T14:30:00Z",
  "created_at": "2024-01-15T10:00:00Z"
}
```

## How Prime Uses This

### 1. Creating Invites

When Prime finds matches and creates invites:

```typescript
// Prime finds 10 matches
const matches = await findNetworkMatches({
  location: "San Francisco",
  theme: ["entrepreneurship", "music"],
  maxResults: 10
});

// Prime creates invite records
const invites = await Promise.all(
  matches.map(match => 
    db.from('event_attendees').insert({
      event_id: event.id,
      user_id: match.user_id,
      status: 'pending',  // Initial status
      created_at: new Date()
    })
  )
);
```

### 2. Checking Capacity

Before creating invites, Prime checks capacity:

```typescript
// Check current attendee count
const { count } = await db
  .from('event_attendees')
  .select('*', { count: 'exact', head: true })
  .eq('event_id', event.id)
  .in('status', ['pending', 'confirmed', 'maybe']);

// Check if under capacity
if (count >= event.max_capacity) {
  // Stop creating invites
  return { error: "Event at capacity" };
}
```

### 3. Updating Status

When user responds to invite:

```typescript
// User confirms
await db
  .from('event_attendees')
  .update({
    status: 'confirmed',
    confirmed_at: new Date()
  })
  .eq('event_id', eventId)
  .eq('user_id', userId);
```

## Relationship to Other Tables

```
event_attendees
    │
    ├──→ weekly_activities (via event_id) - The event
    │
    └──→ profiles (via user_id) - The attendee
```

## Common Queries

### Get Event Attendees
```sql
SELECT 
  ea.*,
  p.full_name,
  p.avatar_url,
  p.star_color
FROM event_attendees ea
JOIN profiles p ON p.id = ea.user_id
WHERE ea.event_id = :event_id
ORDER BY 
  CASE ea.status
    WHEN 'confirmed' THEN 1
    WHEN 'maybe' THEN 2
    WHEN 'pending' THEN 3
    WHEN 'declined' THEN 4
  END,
  ea.confirmed_at DESC;
```

### Get User's Events
```sql
SELECT 
  ea.*,
  wa.*
FROM event_attendees ea
JOIN user_weekly_activities wa ON wa.id = ea.event_id
WHERE ea.user_id = :user_id
AND ea.status IN ('pending', 'confirmed', 'maybe')
ORDER BY wa.start_date ASC;
```

### Get Confirmed Attendees Count
```sql
SELECT COUNT(*)
FROM event_attendees
WHERE event_id = :event_id
AND status = 'confirmed';
```

### Get Pending Invites
```sql
SELECT 
  ea.*,
  p.full_name,
  wa.event_title
FROM event_attendees ea
JOIN profiles p ON p.id = ea.user_id
JOIN user_weekly_activities wa ON wa.id = ea.event_id
WHERE ea.user_id = :user_id
AND ea.status = 'pending'
ORDER BY ea.created_at DESC;
```

## Status Flow

```
Prime creates invite
    │
    ▼
status: 'pending'
    │
    ├──→ User accepts
    │       │
    │       ▼
    │   status: 'confirmed'
    │   confirmed_at: NOW()
    │
    ├──→ User says maybe
    │       │
    │       ▼
    │   status: 'maybe'
    │
    └──→ User declines
            │
            ▼
        status: 'declined'
```

## Capacity Management

Prime enforces capacity limits:

```typescript
// Before creating invite
const currentCount = await getAttendeeCount(eventId);
if (currentCount >= event.max_capacity) {
  // Cannot create more invites
  return { error: "Event at capacity" };
}

// After user confirms
const confirmedCount = await getConfirmedCount(eventId);
if (confirmedCount >= event.max_capacity) {
  // Event is full
  // Can still have 'pending' and 'maybe' statuses
  // But no more 'confirmed' allowed
}
```

## Related Documentation

- [Weekly Activities](./06_weekly_activities.md) - Events table
- [Profiles](./08_profiles.md) - User data
- [Routing & Agent System Explained](../ROUTING_AND_AGENT_SYSTEM_EXPLAINED.md) - How Prime creates invites

