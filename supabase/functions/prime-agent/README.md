# Prime Agent Edge Function

## Overview

This is the Supabase Edge Function implementation of the Prime agent - an event planning specialist agent.

## How Prime Works

**Prime is a specialized agent that uses structured logic primarily, with optional AI enhancements.**

### Current Implementation (Structured Logic)
- ✅ Creates events in database
- ✅ Finds network matches (location + interests)
- ✅ Creates invite records
- ✅ Logs all operations

### Future Enhancements (AI/LLM)
- 🔮 Generate personalized invite messages
- 🔮 Extract event details from natural language
- 🔮 Suggest event improvements

See [HOW_PRIME_WORKS.md](../../docs/HOW_PRIME_WORKS.md) for detailed explanation.

## Deployment

### Using Supabase CLI

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy prime-agent
   ```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it `prime-agent`
5. Copy the contents of `index.ts` into the editor
6. Click **Deploy**

## Usage

### From Next.js API Route

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/prime-agent`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      task_spec: {
        type: 'EVENT_PLANNING',
        user_id: 'user-uuid',
        stella_handle: '@user.network',
        context: {
          event_details: {
            date: '2025-12-06',
            time: '19:00',
            location: 'San Francisco, CA',
            theme: ['entrepreneurship', 'music'],
            max_attendees: 10
          },
          auto_invite: true
        }
      }
    })
  }
);
```

### From Mobile App

```dart
final response = await supabase.functions.invoke(
  'prime-agent',
  body: {
    'task_spec': {
      'type': 'EVENT_PLANNING',
      'user_id': userId,
      'stella_handle': stellaHandle,
      'context': {
        'event_details': {
          'date': '2025-12-06',
          'time': '19:00',
          'location': 'San Francisco, CA',
          'theme': ['entrepreneurship', 'music'],
          'max_attendees': 10
        },
        'auto_invite': true
      }
    }
  }
);
```

## Environment Variables

The function uses these environment variables (automatically provided by Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for database operations)
- `SUPABASE_ANON_KEY` - Anon key (for authentication)

## Response Format

### Success Response
```json
{
  "success": true,
  "event": {
    "id": "event-uuid",
    "title": "Entrepreneurs & Music Networking",
    "date": "2025-12-06T19:00:00Z",
    "location": "San Francisco, CA"
  },
  "invites": {
    "sent": 10,
    "matches_found": 10,
    "details": [...]
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Missing required fields: date and location are required"
}
```

## Benefits of Edge Function

1. **Global Distribution** - Runs at edge locations worldwide
2. **Low Latency** - Faster than Next.js API routes
3. **Scalability** - Auto-scales with demand
4. **Isolation** - Separate from web app
5. **Direct Database Access** - Uses service role key

## Updating the Agent Catalog

After deploying, update the `agents` table to point to the edge function:

```sql
UPDATE agents
SET 
  invocation_type = 'INTERNAL_FUNCTION',
  invocation_config = jsonb_build_object(
    'function_name', 'prime-agent',
    'endpoint', '/functions/v1/prime-agent',
    'method', 'POST'
  )
WHERE slug = 'prime';
```

