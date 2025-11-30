# Deploy Gaia Router - Quick Guide

## The Problem
404 error means `gaia-router` function is **not deployed** to Supabase.

## Solution: Deploy via Supabase Dashboard

### Option 1: Deploy via Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/gjaokfbgwhqbiyjqtnjz
   - Click **Edge Functions** in left sidebar

2. **Create New Function**
   - Click **"Create a new function"** or **"New Function"**
   - Name it exactly: `gaia-router` (with hyphen, lowercase)

3. **Copy Function Code**
   - Open: `supabase/functions/gaia-router/index.ts`
   - Copy ALL the code
   - Paste into the Dashboard editor

4. **Deploy**
   - Click **"Deploy"** button
   - Wait for deployment to complete (should show "Active")

### Option 2: Deploy via CLI (If you have it set up)

```bash
cd /Users/ayenmonasha/Desktop/agent_store

# Link to your project (if not already linked)
supabase link --project-ref gjaokfbgwhqbiyjqtnjz

# Deploy the function
supabase functions deploy gaia-router
```

## Verify Deployment

After deploying, test it:

1. **In Dashboard:**
   - Go to Edge Functions → `gaia-router`
   - Click **"Invoke"** tab
   - Test with sample payload

2. **Or via curl:**
```bash
curl -X POST \
  'https://gjaokfbgwhqbiyjqtnjz.supabase.co/functions/v1/gaia-router' \
  -H 'Authorization: Bearer YOUR_SERVICE_KEY' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_SERVICE_KEY' \
  -d '{
    "task_spec": {
      "type": "EVENT_PLANNING",
      "user_id": "test-id",
      "stella_handle": "@test",
      "context": {
        "event_details": {
          "date": "2025-12-06",
          "location": "SF"
        }
      }
    }
  }'
```

## Important Notes

- ✅ Function name MUST be exactly: `gaia-router` (with hyphen)
- ✅ Make sure it shows as "Active" status
- ✅ Wait 10-30 seconds after deployment for propagation

## After Deployment

Once deployed, the 404 error should be resolved. Stella chat will be able to call Gaia router successfully.

