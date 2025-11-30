# Agent Creation Workflow

## Complete Workflow: From Creation to Usage

This guide explains the complete process of creating a new agent and making it functional in the system.

## Step 1: Create Agent in Admin Dashboard

1. **Log in as admin** (`admin@thenetwork.life`)
2. **Navigate to** `/admin/manage`
3. **Click "+ Add Agent"**
4. **Fill in the form**:
   - **Name**: Display name (e.g., "Email Assistant")
   - **Slug**: URL-friendly identifier (e.g., "email-assistant")
   - **Description**: What the agent does
   - **Domain**: Task type it handles (e.g., "email_management")
   - **Invocation Type**: `INTERNAL_FUNCTION` (for Supabase Edge Functions)
   - **Function Name**: Edge function name (e.g., "email-assistant")
   - **Endpoint**: `/functions/v1/email-assistant`
   - **Method**: `POST`

5. **Click "Create Agent"**

### What Happens Automatically:
- ✅ Agent record created in `agents` table
- ✅ `agent_capabilities` entry created with:
  - `supported_task_types` set from domain
  - `passport_data` structured for Gaia router
  - Default performance metrics (0 uses, 0% success rate)

## Step 2: Create Edge Function

1. **In Admin Dashboard**, click "+ Create Edge Function"
2. **Enter function name** (should match the function name from Step 1)
3. **Click "Create Edge Function"**

### What Happens:
- ✅ Function file created at: `supabase/functions/{function_name}/index.ts`
- ✅ Default template code with:
  - Supabase client setup
  - CORS headers
  - Error handling
  - Basic structure

### Manual Step Required:
You need to **implement the actual agent logic** in the function file.

## Step 3: Implement Agent Logic

Edit `supabase/functions/{function_name}/index.ts`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Parse request
    const body = await req.json();
    const taskSpec = body.task_spec || body;
    
    // Validate required fields
    if (!taskSpec.type || !taskSpec.user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // YOUR AGENT LOGIC HERE
    // Process the task and return result
    
    const result = {
      success: true,
      // ... your result data
    };
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
```

## Step 4: Deploy Edge Function

Deploy the function to Supabase:

```bash
supabase functions deploy {function_name}
```

For example:
```bash
supabase functions deploy email-assistant
```

## Step 5: Verify Agent is Discoverable

The agent should now be discoverable by Gaia router when:
- ✅ Status is `ACTIVE`
- ✅ `agent_capabilities` has `supported_task_types` matching the task type
- ✅ `passport_data.capabilities.supported_task_types` is set correctly

### How Gaia Finds Your Agent:

1. **User makes request** → Stella detects task type
2. **Stella routes to Gaia** with `task_spec.type = "EMAIL_MANAGEMENT"` (from your domain)
3. **Gaia queries agents**:
   ```sql
   SELECT * FROM agents 
   WHERE status = 'ACTIVE'
   JOIN agent_capabilities 
   WHERE 'EMAIL_MANAGEMENT' IN (supported_task_types)
   ```
4. **Gaia checks `passport_data`**:
   ```typescript
   const supportedTypes = 
     passportData.capabilities?.supported_task_types || 
     passportData.supported_task_types || 
     []
   ```
5. **If match found** → Gaia routes task to your agent

## Step 6: Test Your Agent

### Option 1: Direct Test
Call your edge function directly:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/email-assistant \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "task_spec": {
      "type": "EMAIL_MANAGEMENT",
      "user_id": "test-user-id",
      "context": {
        "email_action": "send",
        "recipient": "user@example.com",
        "subject": "Test"
      }
    }
  }'
```

### Option 2: Through Stella/Gaia
1. **User chats with Stella**: "Send an email to john@example.com"
2. **Stella detects** email task → routes to Gaia
3. **Gaia finds** your agent → calls your function
4. **Your agent executes** → returns result
5. **Stella responds** to user with result

## Step 7: Update Capabilities (Optional)

As your agent gets used, update its capabilities:

```sql
UPDATE agent_capabilities
SET 
  passport_data = jsonb_set(
    passport_data,
    '{capabilities,supported_task_types}',
    '["EMAIL_MANAGEMENT", "EMAIL_COMPOSE", "EMAIL_SCHEDULE"]'::jsonb
  )
WHERE agent_id = 'your-agent-id';
```

## Common Issues & Solutions

### Issue: Agent Not Found by Gaia

**Symptoms**: "No suitable agent found for this task type"

**Solutions**:
1. **Check task type matches**: 
   - Domain in agent: `email_management`
   - Task type from Stella: `EMAIL_MANAGEMENT` (uppercase)
   - Make sure they match!

2. **Check passport_data structure**:
   ```sql
   SELECT passport_data FROM agent_capabilities WHERE agent_id = 'your-id';
   ```
   Should have:
   ```json
   {
     "capabilities": {
       "supported_task_types": ["EMAIL_MANAGEMENT"]
     }
   }
   ```

3. **Check agent status**: Must be `ACTIVE`

4. **Check capabilities exist**: Agent must have `agent_capabilities` entry

### Issue: Function Not Found (404)

**Symptoms**: "Function responded with 404"

**Solutions**:
1. **Verify function is deployed**:
   ```bash
   supabase functions list
   ```

2. **Check function name matches**:
   - Agent `invocation_config.function_name`: `email-assistant`
   - Deployed function name: `email-assistant`
   - Must match exactly!

3. **Redeploy function**:
   ```bash
   supabase functions deploy email-assistant
   ```

### Issue: Unauthorized (401)

**Symptoms**: "Unauthorized" error

**Solutions**:
1. **Check service key** is passed correctly
2. **Check RLS policies** allow service role access
3. **Verify function accepts service key** in headers

## Task Type Naming Convention

- **Domain** (in agent form): `email_management` (snake_case, lowercase)
- **Task Type** (in task_spec): `EMAIL_MANAGEMENT` (SNAKE_CASE, uppercase)
- **Conversion**: Domain is automatically uppercased when creating capabilities

## Example: Complete Email Agent

### 1. Create Agent
- Name: "Email Assistant"
- Slug: "email-assistant"
- Domain: "email_management"
- Function: "email-assistant"

### 2. Create Function
- Function name: "email-assistant"
- File: `supabase/functions/email-assistant/index.ts`

### 3. Implement Logic
```typescript
// Handle email sending, scheduling, etc.
```

### 4. Deploy
```bash
supabase functions deploy email-assistant
```

### 5. Test
User says: "Send an email to john@example.com"
- Stella → Gaia → Email Assistant → Result

## Next Steps

- Monitor agent usage in admin dashboard
- Update capabilities as agent evolves
- Add more task types to `supported_task_types`
- Improve agent logic based on usage patterns

