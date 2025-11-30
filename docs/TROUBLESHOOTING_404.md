# Troubleshooting 404 Error on Gaia Router

## Problem
Getting `404` error when calling `/functions/v1/gaia-router`

## Quick Fixes

### 1. Verify Function is Deployed

**In Supabase Dashboard:**
1. Go to **Edge Functions** (left sidebar)
2. Look for `gaia-router` in the list
3. If it's missing, deploy it:

```bash
cd /Users/ayenmonasha/Desktop/agent_store
supabase functions deploy gaia-router
```

### 2. Check Function Name

**Important:** Function names are case-sensitive and must match exactly.

**Correct:**
- Function folder: `supabase/functions/gaia-router/`
- Deploy command: `supabase functions deploy gaia-router`
- URL: `/functions/v1/gaia-router`

**Wrong:**
- ❌ `gaia_router` (underscore)
- ❌ `GaiaRouter` (camelCase)
- ❌ `gaia-router-v1` (extra suffix)

### 3. Verify Project URL

Make sure you're using the correct Supabase project URL:

```typescript
// Should be: https://YOUR_PROJECT_REF.supabase.co
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
```

### 4. Test Deployment

Run the test script:

```bash
./scripts/test-gaia-deployment.sh
```

Or test manually:

```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/gaia-router' \
  -H 'Authorization: Bearer YOUR_SERVICE_KEY' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SERVICE_KEY' \
  -d '{
    "task_spec": {
      "type": "EVENT_PLANNING",
      "user_id": "test-id",
      "stella_handle": "@test.network",
      "context": {
        "event_details": {
          "date": "2025-12-06",
          "location": "SF"
        }
      }
    }
  }'
```

### 5. Check Deployment Logs

In Supabase Dashboard:
1. Go to **Edge Functions** → `gaia-router`
2. Click **Logs** tab
3. Look for deployment errors

### 6. Redeploy Function

If function exists but still getting 404:

```bash
# Redeploy with explicit name
supabase functions deploy gaia-router --no-verify-jwt

# Or delete and redeploy
supabase functions delete gaia-router
supabase functions deploy gaia-router
```

### 7. Verify All Functions

Make sure all three functions are deployed:

```bash
supabase functions list
```

Should show:
- ✅ `gaia-router`
- ✅ `prime-agent`
- ✅ `stella_chat`

## Common Issues

### Issue: Function deployed but still 404
**Solution:** Check function name in Supabase Dashboard matches exactly

### Issue: 404 on first call after deployment
**Solution:** Wait 10-30 seconds for function to propagate

### Issue: Works in dashboard but not from code
**Solution:** Check URL format - must be `/functions/v1/function-name`

## Still Not Working?

1. Check Supabase Dashboard → Edge Functions
2. Verify function name matches exactly (no typos)
3. Check deployment status (should be "Active")
4. Review deployment logs for errors
5. Try redeploying: `supabase functions deploy gaia-router`

