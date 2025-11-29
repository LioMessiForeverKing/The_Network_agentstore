# Mobile App Impact Analysis: Database Schema Changes

## Summary

✅ **The database schema changes are SAFE and will NOT break the mobile app.**

The mobile app uses different tables than the new Agent Store schema, so there's no conflict.

---

## Mobile App Database Usage

### Tables Used by Mobile App

1. **`agent_passports`** ✅ **USED**
   - **Usage:** Mobile app queries user passports by `user_id`
   - **Location:** `lib/services/passport_service.dart` (line 127)
   - **Query:** `.from('agent_passports').select('passport_data').eq('user_id', userId)`
   - **Impact:** ✅ **SAFE** - Schema still supports `user_id` queries

2. **`agent_handles`** ✅ **USED**
   - **Usage:** Mobile app queries handles by `user_id` and `handle`
   - **Location:** `lib/services/agent_handle_service.dart`
   - **Impact:** ✅ **SAFE** - This table is NOT in the new schema (it's separate)

### Tables NOT Used by Mobile App

3. **`agents`** ❌ **NOT USED**
   - Mobile app does NOT query the agents catalog table
   - **Impact:** ✅ **SAFE** - Adding new columns won't affect mobile app

4. **`agent_usage_logs`** ❌ **NOT USED**
   - Mobile app does NOT query usage logs
   - **Impact:** ✅ **SAFE** - New table, no conflicts

5. **`user_weekly_activities`** ❌ **NOT USED**
   - Mobile app does NOT query events table
   - **Impact:** ✅ **SAFE** - New table, no conflicts

6. **`event_attendees`** ❌ **NOT USED**
   - Mobile app does NOT query attendees table
   - **Impact:** ✅ **SAFE** - New table, no conflicts

---

## Schema Changes Breakdown

### 1. `agents` Table Changes

**New Columns Added:**
- `invocation_type` (TEXT)
- `invocation_config` (JSONB)
- `version` (INTEGER)

**Impact on Mobile App:** ✅ **NONE**
- Mobile app doesn't query this table
- New columns are optional/default values

### 2. `agent_passports` Table Changes

**Structure:**
- Supports BOTH user passports (`user_id`) and agent passports (`agent_id`)
- Uses JSONB `passport_data` field
- Constraint: Only one of `user_id` or `agent_id` can be set

**Impact on Mobile App:** ✅ **SAFE**
- Mobile app queries by `user_id` only
- Schema still supports `user_id` queries
- Mobile app doesn't need `agent_id` functionality

**Mobile App Query:**
```dart
.from('agent_passports')
.select('passport_data')
.eq('user_id', userId)
```

**Schema Support:**
```sql
user_id UUID, -- Still exists, still works
agent_id UUID, -- New, doesn't affect user queries
CONSTRAINT check_user_or_agent CHECK (
    (user_id IS NOT NULL AND agent_id IS NULL) OR
    (user_id IS NULL AND agent_id IS NOT NULL)
)
```

### 3. `agent_usage_logs` Table

**Status:** ✅ **NEW TABLE**
- Mobile app doesn't use this table
- No impact on mobile app

### 4. `user_weekly_activities` Table

**Status:** ✅ **NEW TABLE**
- Mobile app doesn't use this table
- No impact on mobile app

### 5. `event_attendees` Table

**Status:** ✅ **NEW TABLE**
- Mobile app doesn't use this table
- No impact on mobile app

---

## Supabase Functions Analysis

### Functions That Use `agent_passports`

1. **`generate_passport`** function
   - **Usage:**** Upserts user passport data
   - **Query:** `.from("agent_passports").upsert({ user_id, handle_id, dna_id, passport_data })`
   - **Impact:** ✅ **SAFE** - Schema still supports this structure

### Functions That DON'T Use New Tables

- `stella_chat` - Doesn't query `agents` or `agent_usage_logs`
- `claim-handle` - Only uses `agent_handles` table
- Other functions - No usage of new tables

---

## Compatibility Matrix

| Table | Mobile App Uses? | Schema Changed? | Impact |
|-------|-----------------|-----------------|--------|
| `agent_passports` | ✅ Yes (user_id queries) | ✅ Yes (added agent_id support) | ✅ **SAFE** - Backward compatible |
| `agent_handles` | ✅ Yes | ❌ No (separate table) | ✅ **SAFE** - Not affected |
| `agents` | ❌ No | ✅ Yes (new columns) | ✅ **SAFE** - Not used by mobile |
| `agent_usage_logs` | ❌ No | ✅ New table | ✅ **SAFE** - Not used by mobile |
| `user_weekly_activities` | ❌ No | ✅ New table | ✅ **SAFE** - Not used by mobile |
| `event_attendees` | ❌ No | ✅ New table | ✅ **SAFE** - Not used by mobile |

---

## Key Points

1. **Backward Compatibility:** ✅ The `agent_passports` table changes are backward compatible
   - User passports still work with `user_id`
   - Agent passports are new and don't affect user queries

2. **No Breaking Changes:** ✅ All mobile app queries will continue to work
   - Mobile app only queries `agent_passports` by `user_id`
   - Schema still supports this

3. **New Functionality:** ✅ New tables and columns don't interfere
   - `agents` table: Not used by mobile app
   - `agent_usage_logs`: Not used by mobile app
   - Event tables: Not used by mobile app

4. **Supabase Functions:** ✅ Functions will continue to work
   - `generate_passport` function uses same structure
   - No changes needed to existing functions

---

## Recommendations

### ✅ Safe to Deploy

The schema changes are **100% safe** to deploy. The mobile app will continue to work without any changes.

### 📝 Optional: Future Integration

If you want the mobile app to use the new Agent Store features in the future, you would need to:

1. **Query `agents` table** - To show available agents
2. **Query `agent_usage_logs`** - To show usage history
3. **Use agent passports** - To get agent capabilities

But these are **optional enhancements**, not required for current functionality.

---

## Testing Checklist

After deploying the schema, verify:

- [ ] Mobile app can still query `agent_passports` by `user_id`
- [ ] `generate_passport` function still works
- [ ] `claim-handle` function still works
- [ ] User passport generation still works
- [ ] No errors in mobile app logs

---

## Conclusion

✅ **The database schema changes will NOT affect the mobile app.**

The mobile app uses a different subset of tables and queries, so the new Agent Store schema is completely safe to deploy.

