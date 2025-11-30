# Create Test User for Prime Agent Testing

## Option 1: Use Existing User (Easiest)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find any existing user
3. Copy their **User UID**
4. Use it in your test task_spec:

```json
{
  "task_spec": {
    "type": "EVENT_PLANNING",
    "user_id": "PASTE_USER_ID_HERE",
    "stella_handle": "@test.network",
    "context": {
      "event_details": {
        "date": "2025-12-06",
        "location": "San Francisco, CA"
      }
    }
  }
}
```

## Option 2: Create New Test User via Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** or **"Create User"**
3. Enter:
   - Email: `test@example.com`
   - Password: `testpassword123`
   - Check **"Auto Confirm User"**
4. Click **"Create User"**
5. Copy the **User UID** from the user list
6. Use it in your test task_spec

## Option 3: Create Test User via API

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "email_confirm": true
  }'
```

The response will include the user `id` - use that in your test task_spec.

## Option 4: Use SQL to Find Users

Run this in Supabase SQL Editor:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

Copy one of the IDs and use it in your test.

