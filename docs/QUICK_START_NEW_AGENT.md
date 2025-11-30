# Quick Start: Create a New Agent

## 5-Minute Guide

### Step 1: Create Agent (2 min)
1. Go to `/admin/manage`
2. Click "+ Add Agent"
3. Fill in:
   - **Name**: "My Agent"
   - **Slug**: "my-agent"
   - **Domain**: "my_task" (this becomes `MY_TASK` task type)
   - **Function Name**: "my-agent"
   - **Endpoint**: "/functions/v1/my-agent"
4. Click "Create Agent"

### Step 2: Create Edge Function (1 min)
1. Click "+ Create Edge Function"
2. Enter: "my-agent"
3. Click "Create Edge Function"

### Step 3: Implement Logic (2 min)
Edit `supabase/functions/my-agent/index.ts`:

```typescript
// ... existing code ...

// YOUR LOGIC HERE
const result = {
  success: true,
  message: "Agent executed successfully",
  data: taskSpec.context
};

return new Response(
  JSON.stringify(result),
  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

### Step 4: Deploy
```bash
supabase functions deploy my-agent
```

### Step 5: Test
Your agent is now ready! When a user requests a task of type `MY_TASK`, Gaia will route it to your agent.

## How It Works

```
User Request → Stella → Gaia Router → Your Agent → Result
```

1. **User**: "Do my task"
2. **Stella**: Detects task type `MY_TASK`
3. **Gaia**: Finds your agent (matches `MY_TASK` in `supported_task_types`)
4. **Your Agent**: Executes logic
5. **Result**: Returns to user

## Troubleshooting

**Agent not found?**
- Check domain matches task type (uppercase)
- Verify agent status is `ACTIVE`
- Check `agent_capabilities` exists

**Function 404?**
- Verify function is deployed: `supabase functions list`
- Check function name matches exactly

**Not routing?**
- Check `passport_data.capabilities.supported_task_types` contains task type
- Verify task type is uppercase (e.g., `MY_TASK` not `my_task`)

