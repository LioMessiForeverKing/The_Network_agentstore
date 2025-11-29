# Build Plan: Agent Store & Prime Agent

## Overview

This document outlines the complete plan for building:
1. **Agent Store Web Application** - The frontend interface for discovering and managing AI agents
2. **Prime Agent** - The first specialist agent, an event planning agent that creates events, finds network matches, and sends invites

---

## Architecture Overview

### Three-Layer System

```
┌─────────────────────────────────────┐
│  LAYER 1: Agent Store (Web App)    │
│  - Browse agents                    │
│  - View agent details               │
│  - Monitor usage                    │
└─────────────────────────────────────┘
                │
                │ (Future: Direct agent calls)
                ▼
┌─────────────────────────────────────┐
│  LAYER 2: Stella (Companion)        │
│  - User interface                   │
│  - Intent detection                 │
│  - Task spec generation             │
└─────────────────────────────────────┘
                │
                │ Task Spec
                ▼
┌─────────────────────────────────────┐
│  LAYER 3: Gaia (Router)             │
│  - Routes tasks to agents           │
│  - Orchestrates multi-agent flows  │
└─────────────────────────────────────┘
                │
                │ Routes to Agent
                ▼
┌─────────────────────────────────────┐
│  LAYER 4: Prime (Event Agent)       │
│  - Creates events                   │
│  - Finds network matches            │
│  - Sends invites                    │
└─────────────────────────────────────┘
```

---

## Phase 1: Database Setup & Schema

### 1.1 Core Tables (Already Defined)

✅ **agents** - Agent catalog registry
✅ **agent_passports** - User passports only (for Stella instances)
✅ **agent_capabilities** - Agent capabilities & performance (for Prime, etc.)
✅ **agent_usage_logs** - Complete audit trail

### 1.2 Event System Tables (Need to Create)

**weekly_activities** (Events table)
- Stores events created by Prime
- Fields: id, user_id, event_name, location, start_date, tags, max_capacity, metadata

**event_attendees** (Invites table)
- Tracks invites and attendance
- Fields: id, event_id, user_id, status (pending/confirmed/maybe/declined)

### 1.3 Supporting Tables (For Full System)

**agent_handles** - Stella identity (@firstname.lastname.network)
**profiles** - User profiles with interests
**user_compatibility_vectors** - Vector embeddings for matching
**digital_dna_v2** - User personality vectors

### 1.4 Database Migration Scripts

**Priority:**
1. Run `complete-schema.sql` - Creates all tables automatically
2. Verify tables created
3. Verify Prime agent and capabilities created

**Note:** All tables are created by `complete-schema.sql`:
- `agents` table (with invocation_type, invocation_config)
- `agent_passports` table (user passports only)
- `agent_capabilities` table (agent capabilities)
- `agent_usage_logs` table
- `user_weekly_activities` table
- `event_attendees` table

---

## Phase 2: Agent Store Web Application

### 2.1 Current State

✅ Basic Next.js app structure
✅ Authentication (Supabase Auth)
✅ Agent listing page (`/agents`)
✅ Agent detail page (`/agents/[slug]`)
✅ Navigation component
✅ Basic UI components (AgentCard, Button, Badge, StatCard)

### 2.2 Enhancements Needed

#### 2.2.1 Agent Catalog Page (`/agents`)

**Current:** Basic listing
**Enhancements:**
- [ ] Filter by domain (EVENT_PLANNING, STUDY, etc.)
- [ ] Search functionality
- [ ] Sort by: popularity, success rate, latency
- [ ] Status badges (ACTIVE, EXPERIMENTAL, DISABLED)
- [ ] Performance metrics display

#### 2.2.2 Agent Detail Page (`/agents/[slug]`)

**Current:** Basic detail view
**Enhancements:**
- [ ] Full agent capabilities display
- [ ] Performance metrics (success rate, latency, total uses)
- [ ] Capabilities list
- [ ] Input/Output schema documentation
- [ ] Usage history (recent logs)
- [ ] Test agent button (for testing)

#### 2.2.3 Prime Agent Detail Page (`/agents/prime`)

**Special Features:**
- [ ] Event creation form (test Prime)
- [ ] Recent events created by Prime
- [ ] Network matching demo
- [ ] Invite statistics

#### 2.2.4 Usage Analytics (`/my-usage`)

**Features:**
- [ ] User's agent usage history
- [ ] Success/failure rates
- [ ] Latency metrics
- [ ] Most used agents
- [ ] Recent activity timeline

#### 2.2.5 Insights Dashboard (`/insights`)

**Features:**
- [ ] System-wide agent performance
- [ ] Popular agents
- [ ] Agent health metrics
- [ ] Usage trends

### 2.3 New Components Needed

- [ ] `AgentFilter.tsx` - Filter/sort agents
- [ ] `AgentMetrics.tsx` - Display performance metrics
- [ ] `UsageChart.tsx` - Chart component for analytics
- [ ] `EventCard.tsx` - Display events created by Prime
- [ ] `TestAgentForm.tsx` - Form to test agents
- [ ] `AgentSchemaViewer.tsx` - Display input/output schemas

### 2.4 API Routes

**Current:**
- ✅ `/api/agents/create-prime` - Creates Prime agent

**Needed:**
- [ ] `/api/agents/[slug]/test` - Test an agent
- [ ] `/api/agents/[slug]/usage` - Get agent usage stats
- [ ] `/api/events` - List/create events (for Prime)
- [ ] `/api/events/[id]/attendees` - Get event attendees
- [ ] `/api/usage/my` - Get user's usage logs

---

## Phase 3: Prime Agent Implementation

### 3.1 Prime Agent Overview

**Purpose:** Event planning specialist agent
**Capabilities:**
1. Create events in `weekly_activities` table
2. Find network matches using compatibility vectors
3. Create invites in `event_attendees` table
4. Generate personalized invite messages
5. Handle event updates and deletions

### 3.2 Prime Agent Structure

#### 3.2.1 Database Registration

**agents table entry:**
```json
{
  "name": "Prime",
  "slug": "prime",
  "domain": "EVENT_PLANNING",
  "description": "Creates events, finds network matches, sends invites",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "prime-agent",
    "endpoint": "/api/agents/prime/execute",
    "method": "POST"
  },
  "status": "ACTIVE"
}
```

#### 3.2.2 Agent Capabilities

**agent_capabilities entry:**
```json
{
  "agent_id": "prime-uuid",
  "passport_data": {
    "capabilities": {
      "supported_task_types": [
        "EVENT_PLANNING",
        "EVENT_UPDATE",
        "EVENT_DELETE",
        "NETWORK_MATCHING"
      ],
      "input_schema": {
        "location": "string (required)",
        "date": "ISO8601 (required)",
        "time": "string (optional)",
        "theme": "array of strings",
        "max_attendees": "number (max 50)"
      },
      "output_schema": {
        "event_id": "UUID",
        "invites_sent": "number",
        "matches_found": "number"
      }
    },
    "trust_metrics": {
      "success_rate": 0.0,
      "average_latency_ms": 0,
      "total_uses": 0
    },
    "constraints": {
      "max_attendees": 50,
      "jurisdictions": ["US", "CA"]
    }
  }
}
```

### 3.3 Prime Agent Implementation

#### 3.3.1 API Route: `/api/agents/prime/execute`

**Location:** `app/api/agents/prime/execute/route.ts`

**Functionality:**
1. Receive task spec from Stella/Gaia
2. Validate input against schema
3. Execute event creation workflow:
   - Parse event details (date, location, theme)
   - Create event in `weekly_activities`
   - Find network matches (if auto_invite enabled)
   - Create invites in `event_attendees`
   - Generate personalized messages
4. Log execution to `agent_usage_logs`
5. Return structured result

**Input Schema:**
```typescript
interface PrimeTaskSpec {
  type: "EVENT_PLANNING" | "EVENT_UPDATE" | "EVENT_DELETE";
  user_id: string;
  stella_handle: string;
  context: {
    event_details: {
      date: string;  // ISO8601
      time?: string;
      location: string;
      theme?: string[];
      max_attendees?: number;
      title?: string;
      description?: string;
    };
    auto_invite?: boolean;
    invite_criteria?: {
      location?: string;
      interests?: string[];
      max_results?: number;
    };
  };
}
```

**Output Schema:**
```typescript
interface PrimeResult {
  success: boolean;
  event?: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
  invites?: {
    sent: number;
    matches_found: number;
    details: Array<{
      user_id: string;
      name: string;
      compatibility_score: number;
    }>;
  };
  error?: string;
}
```

#### 3.3.2 Core Functions

**File:** `lib/agents/prime.ts`

**Functions:**
1. `createEvent(taskSpec)` - Creates event in database
2. `findNetworkMatches(criteria)` - Finds matching users
3. `createInvites(eventId, matches)` - Creates invite records
4. `generateInviteMessage(event, invitee, host)` - Generates personalized message
5. `logExecution(taskSpec, result, latency)` - Logs to agent_usage_logs

#### 3.3.3 Network Matching Logic

**Algorithm:**
1. Query `profiles` table for location match
2. Filter by interests (if provided)
3. Calculate compatibility using `user_compatibility_vectors`
4. Rank by compatibility score
5. Return top N matches

**Note:** For MVP, we can simplify matching to:
- Location-based matching
- Interest-based matching
- Skip vector similarity (add later)

### 3.4 Prime Agent Testing

#### 3.4.1 Test Interface

**Page:** `/agents/prime/test`

**Features:**
- Form to create test event
- Display results
- Show created event
- Show invites sent

#### 3.4.2 Test API Route

**Route:** `/api/agents/prime/test`

**Purpose:** Allow testing Prime without full Stella/Gaia flow

---

## Phase 4: Integration Points

### 4.1 Stella Integration (Future)

**Current:** Not implemented
**Future:** 
- Stella chat interface
- Intent detection
- Task spec generation
- Response formatting

### 4.2 Gaia Router (Future)

**Current:** Not implemented
**Future:**
- Route tasks to appropriate agents
- Multi-agent orchestration
- Performance-based routing

### 4.3 Current Integration

**Direct API Calls:**
- Web app → Prime API route
- Test interface → Prime API route

---

## Phase 5: Implementation Steps

### Step 1: Database Setup (Priority: HIGH)

1. Run `scripts/complete-schema.sql` in Supabase SQL Editor
2. Verify all tables created
3. Verify Prime agent and capabilities created

**Estimated Time:** 15-30 minutes

### Step 2: Prime Agent Registration (Priority: HIGH)

✅ **Already done by complete-schema.sql!**
- Prime agent created in `agents` table
- Prime capabilities created in `agent_capabilities` table

**Estimated Time:** 0 minutes (already done)

### Step 3: Prime Agent Core Logic (Priority: HIGH)

1. Create `/api/agents/prime/execute` route
2. Implement `createEvent()` function
3. Implement basic network matching (location + interests)
4. Implement `createInvites()` function
5. Implement logging to `agent_usage_logs`
6. Add error handling

**Estimated Time:** 4-6 hours

### Step 4: Prime Agent Testing Interface (Priority: MEDIUM)

1. Create `/agents/prime/test` page
2. Create test form component
3. Create `/api/agents/prime/test` route
4. Display results

**Estimated Time:** 2-3 hours

### Step 5: Agent Store Enhancements (Priority: MEDIUM)

1. Add filters to `/agents` page
2. Enhance agent detail pages
3. Add usage analytics to `/my-usage`
4. Add insights dashboard

**Estimated Time:** 4-6 hours

### Step 6: Event Display (Priority: MEDIUM)

1. Create event listing page
2. Create event detail page
3. Display attendees
4. Show Prime-created events

**Estimated Time:** 3-4 hours

### Step 7: Polish & Testing (Priority: LOW)

1. Error handling improvements
2. Loading states
3. Responsive design
4. Performance optimization
5. End-to-end testing

**Estimated Time:** 4-6 hours

---

## Phase 6: MVP Scope

### MVP Includes:

✅ **Agent Store:**
- Browse agents
- View agent details
- Basic usage tracking

✅ **Prime Agent:**
- Create events
- Basic network matching (location + interests)
- Create invites
- Log execution

### MVP Excludes:

❌ **Stella Integration** - Future phase
❌ **Gaia Router** - Future phase
❌ **Advanced Matching** - Vector similarity (future)
❌ **Personalized Messages** - Basic messages (future: LLM-generated)
❌ **Multi-Agent Orchestration** - Future phase
❌ **Real-time Updates** - Future phase

---

## Phase 7: File Structure

```
agent_store/
├── app/
│   ├── api/
│   │   └── agents/
│   │       ├── create-prime/
│   │       │   └── route.ts ✅
│   │       └── prime/
│   │           ├── execute/
│   │           │   └── route.ts (NEW)
│   │           └── test/
│   │               └── route.ts (NEW)
│   ├── (dashboard)/
│   │   ├── agents/
│   │   │   ├── page.tsx ✅
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx ✅
│   │   │   └── prime/
│   │   │       └── test/
│   │   │           └── page.tsx (NEW)
│   │   ├── events/
│   │   │   ├── page.tsx (NEW)
│   │   │   └── [id]/
│   │   │       └── page.tsx (NEW)
│   │   ├── insights/
│   │   │   └── page.tsx ✅
│   │   └── my-usage/
│   │       └── page.tsx ✅
│   └── page.tsx ✅
├── components/
│   ├── AgentCard.tsx ✅
│   ├── AgentFilter.tsx (NEW)
│   ├── AgentMetrics.tsx (NEW)
│   ├── EventCard.tsx (NEW)
│   ├── TestAgentForm.tsx (NEW)
│   └── ... (other components)
├── lib/
│   ├── agents/
│   │   └── prime.ts (NEW)
│   ├── supabase.ts ✅
│   └── ... (other libs)
├── scripts/
│   ├── create-event-tables.sql (NEW)
│   ├── create-prime-agent.sql ✅
│   └── ... (other scripts)
└── docs/
    └── BUILD_PLAN.md (THIS FILE)
```

---

## Phase 8: Testing Strategy

### 8.1 Unit Tests

- Prime agent functions
- Network matching logic
- Event creation logic

### 8.2 Integration Tests

- Prime API route
- Database operations
- Agent usage logging

### 8.3 E2E Tests

- Create event via Prime
- View event in UI
- Check invites created

---

## Phase 9: Deployment Checklist

### 9.1 Database

- [ ] Run all migration scripts
- [ ] Verify tables created
- [ ] Verify indexes created
- [ ] Test RLS policies

### 9.2 Application

- [ ] Build Next.js app
- [ ] Test all routes
- [ ] Verify environment variables
- [ ] Test authentication

### 9.3 Prime Agent

- [ ] Prime registered in database
- [ ] Prime passport created
- [ ] Test event creation
- [ ] Test network matching
- [ ] Test invite creation
- [ ] Verify logging

---

## Phase 10: Next Steps After MVP

1. **Stella Integration**
   - Chat interface
   - Intent detection
   - Task spec generation

2. **Gaia Router**
   - Task routing
   - Multi-agent orchestration

3. **Advanced Features**
   - Vector similarity matching
   - LLM-generated personalized messages
   - Real-time event updates
   - Calendar integration

4. **Additional Agents**
   - Study Planner
   - Ledger (Financial)
   - Network Matcher

---

## Summary

**Total Estimated Time for MVP:** 20-30 hours

**Priority Order:**
1. Database setup (Step 1)
2. Prime agent registration (Step 2)
3. Prime agent core logic (Step 3)
4. Testing interface (Step 4)
5. Agent store enhancements (Step 5)
6. Event display (Step 6)
7. Polish & testing (Step 7)

**Key Deliverables:**
- ✅ Working Agent Store web app
- ✅ Prime agent fully functional
- ✅ Event creation and invite system
- ✅ Usage logging and analytics
- ✅ Test interface for Prime

---

## Questions & Decisions Needed

1. **Network Matching:** For MVP, use simple location + interests matching, or implement vector similarity?
2. **Invite Messages:** Basic template messages or LLM-generated personalized messages?
3. **Event Display:** Separate events page or integrate into existing pages?
4. **Authentication:** Use existing Supabase Auth or need additional setup?
5. **Testing:** Manual testing for MVP or automated tests?

---

## Resources

- [Agent Handles Documentation](./01_agent_handles.md)
- [Agents Catalog Documentation](./04_agents_catalog.md)
- [Agent Passports (User) Documentation](./02_agent_passports_user.md)
- [Agent Capabilities Documentation](./03_agent_passports_agent.md)
- [Agent Usage Logs Documentation](./05_agent_usage_logs.md)
- [Weekly Activities Documentation](./06_weekly_activities.md)
- [Event Attendees Documentation](./07_event_attendees.md)
- [Routing & Agent System Explained](./WEBAPPAGENTSTORE.md)

