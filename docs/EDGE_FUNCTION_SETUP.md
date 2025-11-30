# Prime Agent Edge Function Setup

## What is an Edge Function?

A **Supabase Edge Function** is a serverless TypeScript function that runs on Deno at the edge (globally distributed). It's faster and more scalable than Next.js API routes.

## Why Use Edge Function for Prime?

1. **Performance**: Runs at edge locations worldwide (lower latency)
2. **Scalability**: Auto-scales with demand
3. **Isolation**: Separate from web app (can update independently)
4. **Direct Access**: Uses service role key for database operations
5. **Global**: Available from anywhere (web app, mobile app, external services)

## Setup Instructions

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login**:
   ```bash
   supabase login
   ```

3. **Link to your project**:
   ```bash
   cd /Users/ayenmonasha/Desktop/agent_store
   supabase link --project-ref your-project-ref
   ```
   
   Find your project ref in: Supabase Dashboard → Settings → General → Reference ID

4. **Deploy the function**:
   ```bash
   supabase functions deploy prime-agent
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. Name it: `prime-agent`
5. Copy the contents of `supabase/functions/prime-agent/index.ts`
6. Paste into the editor
7. Click **Deploy**

## Verify Deployment

After deploying, test the function:

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/prime-agent' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "task_spec": {
      "type": "EVENT_PLANNING",
      "user_id": "test-user-id",
      "stella_handle": "@test.network",
      "context": {
        "event_details": {
          "date": "2025-12-06",
          "location": "San Francisco, CA"
        }
      }
    }
  }'
```

## Update Agent Catalog

After deploying, update the `agents` table to use the edge function:

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

## Using from Next.js

Update your Next.js API route to call the edge function:

```typescript
// app/api/agents/prime/execute/route.ts
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/prime-agent`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ task_spec })
  }
);
```

## Benefits

- ✅ **Faster**: Edge functions run closer to users
- ✅ **Scalable**: Auto-scales with traffic
- ✅ **Isolated**: Can update without redeploying web app
- ✅ **Global**: Available from anywhere
- ✅ **Direct**: Uses service role key (no RLS restrictions)

## File Structure

```
supabase/
└── functions/
    └── prime-agent/
        ├── index.ts (Edge function code)
        └── README.md (Documentation)
```

## Next Steps

1. Deploy the edge function
2. Update the `agents` table invocation_config
3. Test from your Next.js app
4. (Optional) Update Next.js API route to proxy to edge function

