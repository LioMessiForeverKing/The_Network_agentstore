# Edge Functions Deployment Checklist

## Verify Functions Are Deployed

### 1. Check Deployed Functions

In Supabase Dashboard:
1. Go to **Edge Functions**
2. Verify these functions exist:
   - ✅ `gaia-router`
   - ✅ `prime-agent`
   - ✅ `stella_chat`

### 2. Deploy Functions

If functions are missing, deploy them:

```bash
# Navigate to project root
cd /Users/ayenmonasha/Desktop/agent_store

# Deploy each function
supabase functions deploy gaia-router
supabase functions deploy prime-agent
supabase functions deploy stella_chat
```

### 3. Verify Function Names Match

**Important:** Function names in code must match deployed function names exactly.

**Function calls:**
- `/functions/v1/gaia-router` ✅
- `/functions/v1/prime-agent` ✅
- `/functions/v1/stella_chat` ✅

**Deployment names:**
- `supabase functions deploy gaia-router` ✅
- `supabase functions deploy prime-agent` ✅
- `supabase functions deploy stella_chat` ✅

### 4. Test Function Endpoints

After deployment, test each function:

```bash
# Test gaia-router
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/gaia-router' \
  -H 'Authorization: Bearer YOUR_SERVICE_KEY' \
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

### 5. Common Issues

**404 Error:**
- Function not deployed
- Function name mismatch
- Wrong project URL

**401 Error:**
- Missing or invalid service key
- Wrong authentication header format

**Solution:**
1. Check Supabase Dashboard → Edge Functions
2. Verify function names match exactly
3. Redeploy if needed: `supabase functions deploy <function-name>`

## Quick Deploy All

```bash
cd /Users/ayenmonasha/Desktop/agent_store

# Deploy all functions
supabase functions deploy gaia-router
supabase functions deploy prime-agent
supabase functions deploy stella_chat
```

## Verify Deployment

After deploying, check the Supabase Dashboard:
- Edge Functions → Should see all 3 functions
- Each function should show "Active" status
- Check logs for any deployment errors

