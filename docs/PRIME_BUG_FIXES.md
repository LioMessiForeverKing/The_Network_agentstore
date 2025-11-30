# Prime Agent Bug Fixes

## Issues Fixed

### 1. ✅ Host Duplicate Issue
**Problem**: Host was appearing twice in event attendees list - once as host and once as attendee.

**Root Cause**: The `createInvites` function was not excluding the host from being added to `event_attendees`. The host should only exist in `user_weekly_activities` with `is_hosting: true`, never in `event_attendees`.

**Fix**: 
- Updated `createInvites` to accept `hostUserId` parameter
- Filter out host from matches before creating invites
- Exclude host from attendee count calculations
- Added validation to ensure host is never added to `event_attendees`

**Files Changed**:
- `supabase/functions/prime-agent/index.ts` - `createInvites` function

### 2. ✅ Invite Specific People to Events
**Problem**: Users couldn't invite specific people to events through Stella/Prime.

**Solution**: 
- Added `findUserByName` function to search for users in network by name
- Added `invitePersonToEvent` function to create invite for specific person
- Updated `executePrime` to handle `action: 'invite'` task type
- Updated Stella to detect invite requests and route them to Prime

**Usage**:
- User says: "Invite Sophia to this event"
- Stella detects invite request, finds most recent event, extracts person name
- Routes to Prime with `action: 'invite'` and `invite_person: 'Sophia'`
- Prime finds Sophia in user's network and creates invite

**Files Changed**:
- `supabase/functions/prime-agent/index.ts` - Added `findUserByName`, `invitePersonToEvent`
- `supabase/functions/stella_chat/index.ts` - Added invite detection and routing

### 3. ✅ Edit Event Functionality
**Problem**: Users couldn't edit events through Stella/Prime.

**Solution**:
- Added `editEvent` function to update event details
- Updated `executePrime` to handle `action: 'edit'` task type
- Updated Stella to detect edit requests and route them to Prime

**Usage**:
- User says: "Edit my event on Friday - change location to Central Park"
- Stella detects edit request, finds most recent event, extracts updates
- Routes to Prime with `action: 'edit'`, `event_id`, and `event_updates`
- Prime verifies user is host and updates event

**Supported Updates**:
- Title (`event_title`, `event_name`)
- Location
- Date and time
- Max attendees (`max_capacity`)
- Theme/tags
- Description (`activity_description`)

**Files Changed**:
- `supabase/functions/prime-agent/index.ts` - Added `editEvent` function
- `supabase/functions/stella_chat/index.ts` - Added edit detection and routing

### 4. ✅ Enhanced Task Routing
**Problem**: Prime only handled event creation, not editing or inviting.

**Solution**:
- Updated `executePrime` to handle multiple action types:
  - `create` (default) - Create new event
  - `edit` - Edit existing event
  - `invite` - Invite specific person to event
- Updated `routeEventTask` in Stella to handle different action types

**Files Changed**:
- `supabase/functions/prime-agent/index.ts` - `executePrime` function
- `supabase/functions/stella_chat/index.ts` - `routeEventTask` function

## Implementation Details

### Host Exclusion Logic
```typescript
// In createInvites:
const actualHostId = event.user_id || hostUserId;
const nonHostMatches = matches.filter(match => match.user_id !== actualHostId);

// In invitePersonToEvent:
if (user.user_id === event.user_id) {
  return { success: false, error: 'You are the host...' };
}
```

### Task Spec Structure
```typescript
// Create event (default)
{
  type: 'EVENT_PLANNING',
  context: {
    action: 'create',
    event_details: { ... }
  }
}

// Edit event
{
  type: 'EVENT_PLANNING',
  context: {
    action: 'edit',
    event_id: '...',
    event_updates: { ... }
  }
}

// Invite person
{
  type: 'EVENT_PLANNING',
  context: {
    action: 'invite',
    event_id: '...',
    invite_person: 'Sophia'
  }
}
```

## Testing

### Test Host Exclusion
1. Create an event as user A
2. Verify user A is NOT in `event_attendees` table
3. Verify user A appears as host in `user_weekly_activities` with `is_hosting: true`

### Test Invite Person
1. User says: "Invite Sophia to this event"
2. Verify Stella detects invite request
3. Verify Prime finds Sophia in network
4. Verify invite created in `event_attendees` with `status: 'pending'`

### Test Edit Event
1. User says: "Edit my event - change location to Central Park"
2. Verify Stella detects edit request
3. Verify Prime finds most recent event
4. Verify event location updated in database

## Notes

- **Network Search**: `findUserByName` searches in `user_connections` table. If table doesn't exist, falls back to searching all profiles (not ideal, but graceful).
- **Event Selection**: For edit/invite, Stella uses the most recent event (`ORDER BY start_date DESC LIMIT 1`). Future: could allow users to specify which event.
- **Error Handling**: All functions return structured error responses that Stella can display to users.

## Related Files

- `supabase/functions/prime-agent/index.ts` - Prime agent logic
- `supabase/functions/stella_chat/index.ts` - Stella routing logic
- `docs/07_event_attendees.md` - Event attendees schema
- `docs/06_weekly_activities.md` - Events schema

