# Environment Variables Setup

## Required Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Where to Find These

### 1. NEXT_PUBLIC_SUPABASE_URL
- Go to **Supabase Dashboard** → **Settings** → **API**
- Copy the **Project URL**

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- Go to **Supabase Dashboard** → **Settings** → **API**
- Copy the **anon/public** key (starts with `eyJ...`)

### 3. SUPABASE_SERVICE_ROLE_KEY
- Go to **Supabase Dashboard** → **Settings** → **API**
- Copy the **service_role** key (starts with `eyJ...`)
- ⚠️ **Keep this secret!** Never commit it to git
- This key bypasses RLS and is needed for admin operations

## File Location

Create or edit `.env.local` in the root of your project:

```
agent_store/
  .env.local          ← Add your variables here
  .env.local.example  ← Template (safe to commit)
```

## Security Notes

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ `NEXT_PUBLIC_*` variables are exposed to the browser (safe for anon key)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is server-side only (never exposed to browser)
- ⚠️ Never commit `.env.local` to git

## After Adding Variables

1. **Restart your Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Verify they're loaded**:
   - Check console for any "Missing environment variables" errors
   - Try creating an agent in the admin dashboard

## Troubleshooting

**Error: "Missing SUPABASE_SERVICE_ROLE_KEY"**
- Make sure you added it to `.env.local`
- Make sure you restarted the dev server
- Check the variable name is exactly `SUPABASE_SERVICE_ROLE_KEY` (no typos)

**Error: "RLS policy violation"**
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Service role key should bypass RLS automatically
- If still failing, run `scripts/fix-agents-rls.sql` in Supabase SQL Editor

