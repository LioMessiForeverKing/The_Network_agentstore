# Quick Fix: 404 Error on gaia-router

## The Issue
`stella_chat` is trying to call `gaia-router` but getting 404 = function not deployed.

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/gjaokfbgwhqbiyjqtnjz/functions

### Step 2: Check if gaia-router exists
- Look for `gaia-router` in the functions list
- If it's missing → Continue to Step 3
- If it exists but shows 404 → Check the function name matches exactly

### Step 3: Create/Deploy gaia-router

**If function doesn't exist:**
1. Click **"Create a new function"**
2. Name: `gaia-router` (exactly, with hyphen)
3. Copy code from: `supabase/functions/gaia-router/index.ts`
4. Paste into editor
5. Click **"Deploy"**

**If function exists but wrong name:**
- Delete the incorrectly named function
- Create new one with exact name: `gaia-router`

### Step 4: Verify
- Function should show status: **"Active"**
- Test it works (should not return 404)

## That's It!

Once `gaia-router` is deployed, the 404 error will be fixed and Stella can route tasks to Prime.

---

**Need help?** Check `DEPLOY_GAIA_ROUTER.md` for detailed instructions.

