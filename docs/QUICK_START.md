# Quick Start: Building Prime Agent

## 🎯 Goal

Build the first agent "Prime" - an event planning agent that:
- Creates events
- Finds network matches
- Sends invites

## 📋 Implementation Checklist

### Phase 1: Database Setup (30 minutes)

- [ ] Run `scripts/complete-schema.sql` in Supabase SQL Editor
- [ ] Verify all tables created (agents, agent_capabilities, agent_usage_logs, user_weekly_activities, event_attendees)
- [ ] Verify Prime agent and capabilities created

### Phase 2: Prime Implementation (4-6 hours)

- [ ] Create `/api/agents/prime/execute` route
- [ ] Implement `createEvent()` function
- [ ] Implement network matching (location + interests)
- [ ] Implement `createInvites()` function
- [ ] Implement logging to `agent_usage_logs`

### Phase 3: Testing Interface (2-3 hours)

- [ ] Create `/agents/prime/test` page
- [ ] Create test form
- [ ] Create `/api/agents/prime/test` route

## 🚀 Next Steps

1. **Run database schema:** `scripts/complete-schema.sql`
2. **Verify setup:** Check tables and Prime agent
3. **Build Prime agent:** See Phase 2 above
4. **Test:** See Phase 3 above

## 📚 Full Details

See [BUILD_PLAN.md](./BUILD_PLAN.md) for complete documentation.

