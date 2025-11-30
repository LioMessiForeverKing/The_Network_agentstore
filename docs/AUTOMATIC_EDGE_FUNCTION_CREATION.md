# Automatic Edge Function Creation

## Overview

When you create a new agent through the admin dashboard, the system can **automatically create the edge function file** for you. This eliminates the need to manually create edge functions in Supabase.

## How It Works

### When Creating an Agent

1. **Fill in the agent form** at `/admin/manage`
2. **Check "Automatically create edge function file"** (enabled by default for INTERNAL_FUNCTION)
3. **Click "Create Agent"**

### What Happens Automatically

✅ **Agent record** created in database  
✅ **Agent capabilities** entry created  
✅ **Edge function file** created at `supabase/functions/{function_name}/index.ts`  
✅ **Template code** generated with:
- Supabase client setup
- CORS headers
- Authentication handling
- Error handling
- Basic structure for your logic

### After Creation

You'll see a success message with:
- ✅ Edge function path
- 📝 Deploy command: `supabase functions deploy {function_name}`

## Next Steps

1. **Edit the function file** to add your agent logic
2. **Deploy the function**:
   ```bash
   supabase functions deploy {function_name}
   ```
3. **Test your agent** - it's ready to be routed by Gaia!

## Template Code Structure

The generated function includes:

```typescript
// 1. Environment setup
// 2. Supabase client creation
// 3. CORS handling
// 4. Authentication (service key + user token)
// 5. Request parsing
// 6. Validation
// 7. YOUR LOGIC HERE (TODO section)
// 8. Response formatting
// 9. Error handling
```

## When Edge Function is NOT Created

The edge function is **not** created if:
- ❌ `invocation_type` is `EXTERNAL_API` (not an internal function)
- ❌ `create_edge_function` checkbox is unchecked
- ❌ `function_name` is missing or invalid
- ❌ File system error occurs

In these cases, the agent is still created, but you'll need to manually create the edge function.

## Manual Edge Function Creation

If you prefer to create the edge function separately:
1. Uncheck "Automatically create edge function file"
2. Create agent
3. Use "+ Create Edge Function" button separately

## Benefits

- 🚀 **Faster setup** - One click creates everything
- 📝 **Consistent structure** - All functions follow same pattern
- ✅ **Less errors** - Template includes best practices
- 🔧 **Ready to customize** - Just add your logic

## Example

**Creating "Email Assistant" agent:**

1. Name: "Email Assistant"
2. Slug: "email-assistant"
3. Domain: "email_management"
4. Function Name: "email-assistant"
5. ✅ Check "Automatically create edge function file"
6. Click "Create Agent"

**Result:**
- ✅ Agent created in database
- ✅ `supabase/functions/email-assistant/index.ts` created
- 📝 Deploy: `supabase functions deploy email-assistant`

Then just:
1. Edit the function to add email logic
2. Deploy
3. Done! 🎉

