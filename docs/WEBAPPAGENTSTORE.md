# Complete Routing & Agent System Explained
## How Stella Routes to Agents & Creates the "Aha Moment"

---

## 🎯 Core Concept: Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: STELLA (Companion Interface)                      │
│  - User talks to ONE interface (Stella)                     │
│  - Stella understands intent, context, emotion               │
│  - Stella NEVER does work - only orchestrates              │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ Task Spec
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: GAIA (Router/Orchestrator)                       │
│  - Receives task specs from Stella                         │
│  - Routes to appropriate agent(s)                          │
│  - Can orchestrate MULTIPLE agents in sequence/parallel    │
│  - Logs all routing decisions                               │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ Routes to Agent(s)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: SPECIALIST AGENTS (Prime, Study Planner, etc.)  │
│  - Each agent does ONE thing exceptionally well            │
│  - Agents are isolated, testable, scalable                  │
│  - Agents write to database, return structured results     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Components Explained

### 1. Agent Handles (`agent_handles` table)

**What it is:**
- Every user has ONE Stella instance
- Identified by a unique handle: `@ayen.monasha.network`
- This is Stella's "identity" - like a username for your AI companion

**Why it matters:**
- **Scalability:** Each Stella instance is independent
- **Identity:** External agents can reference your Stella by handle
- **Trust:** Handles can be verified, creating trust signals
- **Multi-user:** Different users have different Stella personalities (based on their DNA)

**How it's used:**
```typescript
// When user chats with Stella:
1. Get user's agent_handle: "@ayen.monasha.network"
2. Load user's Digital DNA v2 (personality, preferences)
3. Load user's agent_passport (capabilities, trust score)
4. Stella responds with personality matching user's DNA
```

**Example:**
- User A has handle `@sophia.green.network` → Stella A (personality based on Sophia's DNA)
- User B has handle `@ayen.monasha.network` → Stella B (personality based on Ayen's DNA)
- Each Stella instance is unique, but they all route to the same specialist agents

---

### 2. Agent Passports (`agent_passports` table)

**What it is:**
- Machine-readable identity card for each user's Stella instance
- Contains: Digital DNA v2, trust score, capabilities, preferences
- Think of it as Stella's "resume" that other agents can read

**Structure:**
```json
{
  "handle": "@ayen.monasha.network",
  "digital_dna": {
    "composite_vector": [0.123, 0.456, ...],  // 3072 dimensions
    "goals": [0.789, 0.012, ...],
    "traits": [0.901, 0.234, ...],
    "constraints": [0.345, 0.678, ...]
  },
  "trust": {
    "score": 0.85,
    "verified_credentials": ["email", "phone"]
  },
  "capabilities": {
    "can_route_tasks": true,
    "supported_interfaces": ["chat", "voice"]
  },
  "preferences": {
    "autonomy": 0.7,  // How proactive Stella can be (0-1)
    "privacy_mode": "standard"
  }
}
```

**Why it matters:**
- **Context:** Agents can read passport to understand user's personality
- **Trust:** Agents can check trust score before executing sensitive tasks
- **Personalization:** Agents use DNA vectors to personalize responses
- **Proactivity:** Autonomy score determines how proactive Stella can be

**How it's used:**
```typescript
// When routing a task:
1. Gaia reads user's agent_passport
2. Gaia checks: trust score, capabilities, preferences
3. Gaia uses DNA vectors to find best-matching agents
4. Gaia routes task with full context
```

---

### 3. Agents Catalog (`agents` table)

**What it is:**
- Registry of ALL available specialist agents
- Like an app store for agents
- Each agent has: name, slug, domain, capabilities, invocation config

**Example agents:**
- **Prime** (slug: `prime`) - Event planning agent
- **Study Planner** (slug: `study_planner`) - Study plan generation
- **Ledger** (slug: `ledger`) - Financial insights
- **Network Matcher** (slug: `network_matcher`) - Finds people to invite

**Structure:**
```sql
agents:
  - id: UUID
  - name: "Prime"
  - slug: "prime"
  - domain: "EVENT_PLANNING"
  - description: "Creates events, finds matches, sends invites"
  - invocation_type: "INTERNAL_FUNCTION"
  - invocation_config: {
      "function_name": "prime-agent",
      "input_schema": {...},
      "output_schema": {...}
    }
  - status: "ACTIVE" | "EXPERIMENTAL" | "DISABLED"
```

**Why it matters:**
- **Scalability:** Add new agents without changing Stella code
- **Discovery:** Stella can discover new agents dynamically
- **Versioning:** Agents can be updated independently
- **A/B Testing:** Run multiple versions of same agent

---

### 4. Agent Passports (for Agents) (`agent_passports` - different from user passports!)

**Wait, there are TWO types of passports?**

Yes! This is important:

1. **User Agent Passports** (`agent_passports` where `user_id` is set)
   - Identity card for USER's Stella instance
   - Contains user's DNA, trust, preferences
   - Used by Stella to understand user

2. **Agent Passports** (for catalog agents - stored in `agent_passports` table with `agent_id`)
   - Identity card for SPECIALIST AGENTS (Prime, Study Planner, etc.)
   - Contains agent capabilities, performance metrics, trust scores
   - Used by Gaia to route tasks

**Agent Passport Structure (for specialist agents):**
```json
{
  "agent_id": "prime-uuid",
  "supported_task_types": ["EVENT_PLANNING", "EVENT_UPDATE", "EVENT_DELETE"],
  "input_schema": {
    "location": "string",
    "date": "ISO8601",
    "theme": ["string"],
    "max_attendees": "number"
  },
  "output_schema": {
    "event_id": "UUID",
    "invites_sent": "number",
    "matches_found": "number"
  },
  "trust_metrics": {
    "success_rate": 0.95,
    "average_latency_ms": 1250,
    "total_uses": 1500
  },
  "constraints": {
    "max_attendees": 50,
    "jurisdictions": ["US", "CA"]
  }
}
```

**Why this matters:**
- Gaia can check agent performance before routing
- Agents can be ranked by success rate, latency
- Future: Agents can be priced based on performance
- Future: Users can choose which agent version to use

---

## 🔄 Complete Routing Flow Explained

### Step-by-Step: How Stella Routes a Task

```
USER: "book an event for next friday at 7 pm in SF and invite 10 people 
       from network who are in SF who are very entrepreneurial and like music"
```

#### **STEP 1: Stella Receives Request**

**What happens:**
1. User sends message to `stella_chat` edge function
2. Stella loads:
   - User's `agent_handle`: `@ayen.monasha.network`
   - User's `agent_passport` (DNA, preferences, trust)
   - Conversation history
   - User's calendar, recent events

**Stella's System Prompt includes:**
```
You are Stella (@ayen.monasha.network), a memory-rich AI companion.

User's Digital DNA:
- Goals: [entrepreneurship, networking, music]
- Traits: [proactive, social, ambitious]
- Constraints: [prefers evening events, max 20 people]
- Autonomy level: 0.7 (can be proactive)

Recent context:
- User created 3 events last month
- User prefers SF Bay Area
- User's network: 150 connections, 45 in SF
```

**Stella's Intent Detection:**
```typescript
// Stella analyzes message and determines:
intent = "create_event"
confidence = 0.95

// Stella extracts structured data:
extracted = {
  date: "next friday",  // → "2025-12-06"
  time: "7 pm",          // → "19:00"
  location: "SF",        // → "San Francisco"
  max_attendees: 10,
  theme: ["entrepreneurship", "music"],
  auto_invite: true
}
```

---

#### **STEP 2: Stella Generates Task Spec**

**Stella creates a structured task spec (NOT doing the work, just describing it):**

```typescript
const taskSpec = {
  type: "EVENT_PLANNING",
  user_id: "ayen-uuid",
  stella_handle: "@ayen.monasha.network",
  
  context: {
    // What user wants
    event_details: {
      date: "2025-12-06",
      time: "19:00",
      location: "San Francisco, CA",
      max_attendees: 10,
      theme: ["entrepreneurship", "music"]
    },
    
    // User's context (from passport)
    user_dna: {
      goals_vector: [...],  // From agent_passport
      traits_vector: [...],
      constraints_vector: [...]
    },
    
    // User's preferences
    preferences: {
      autonomy: 0.7,  // Stella can be proactive
      privacy_mode: "standard"
    },
    
    // Network context
    network_stats: {
      total_connections: 150,
      sf_connections: 45,
      entrepreneurial_matches: 23
    }
  },
  
  urgency: "normal",
  source: "chat",
  requires_confirmation: false  // User was explicit, no need to confirm
}
```

**Key Point:** Stella does NOT create the event. Stella just creates a task spec describing what needs to be done.

---

#### **STEP 3: Stella Calls Gaia (Router)**

**Stella makes HTTP call to `route-task` edge function:**

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/route-task`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    task_spec: taskSpec,
    user_passport: userAgentPassport,  // Stella's passport
    stella_handle: "@ayen.monasha.network"
  })
});
```

**What Stella logs (agent_usage_logs):**
```sql
INSERT INTO agent_usage_logs (
  stella_handle,
  agent_id,  -- NULL (Stella is not an agent, it's the interface)
  user_id,
  task_type,
  full_context_json,  -- Complete user message + context
  input_json,  -- Task spec
  created_at
) VALUES (
  '@ayen.monasha.network',
  NULL,
  'ayen-uuid',
  'routing_request',
  {...},
  {...},
  NOW()
);
```

---

#### **STEP 4: Gaia Analyzes Task**

**Gaia receives task spec and analyzes:**

```typescript
// Gaia's routing logic:
function routeTask(taskSpec, userPassport) {
  // 1. Check task type
  if (taskSpec.type === "EVENT_PLANNING") {
    
    // 2. Query agents catalog
    const candidates = await db.query(`
      SELECT a.*, ap.*
      FROM agents a
      JOIN agent_passports ap ON ap.agent_id = a.id
      WHERE 
        a.status = 'ACTIVE'
        AND 'EVENT_PLANNING' = ANY(ap.supported_task_types)
      ORDER BY ap.success_rate DESC, ap.average_latency_ms ASC
    `);
    
    // 3. Check agent performance
    const prime = candidates.find(a => a.slug === 'prime');
    
    // 4. Check constraints
    if (taskSpec.context.event_details.max_attendees > prime.constraints.max_attendees) {
      // Reject or find alternative
    }
    
    // 5. Check user's trust requirements
    if (userPassport.trust.score < prime.required_trust_threshold) {
      // Reject or require confirmation
    }
    
    // 6. Determine if multi-agent is needed
    const routes = [];
    
    // Primary agent: Prime (event creation)
    routes.push({
      agent: prime,
      priority: 1,
      role: "primary"
    });
    
    // Secondary agent: Network Matcher (finding people)
    // But wait - Prime can do this! Let's check Prime's capabilities...
    
    // Actually, Prime handles both event creation AND network matching
    // So we only need Prime
    
    return routes;
  }
}
```

**Gaia's Decision:**
```typescript
const routingDecision = {
  chosen_agents: [
    {
      agent_slug: "prime",
      agent_id: "prime-uuid",
      priority: 1,
      role: "primary",
      confidence: 0.95,
      reasoning: "Prime handles EVENT_PLANNING tasks with network matching"
    }
  ],
  
  routing_metadata: {
    alternatives_considered: ["study_planner", "ledger"],  // Rejected
    decision_factors: {
      task_type_match: true,
      agent_performance: 0.95,  // Prime's success rate
      latency_acceptable: true,
      trust_threshold_met: true
    },
    estimated_latency_ms: 1200,
    requires_confirmation: false
  }
};
```

**Gaia logs routing decision:**
```sql
INSERT INTO agent_usage_logs (
  stella_handle,
  agent_id,  -- Gaia's UUID
  user_id,
  task_type,
  routing_metadata,  -- Gaia's analysis
  input_json,
  output_json,  -- Routing decision
  created_at
) VALUES (
  '@ayen.monasha.network',
  'gaia-uuid',
  'ayen-uuid',
  'routing',
  {...routingDecision...},
  {...taskSpec...},
  {...routingDecision...},
  NOW()
);
```

---

#### **STEP 5: Gaia Calls Prime Agent**

**Gaia invokes Prime agent:**

```typescript
// Gaia calls Prime's edge function
const primeResponse = await fetch(`${SUPABASE_URL}/functions/v1/prime-agent`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    task_spec: taskSpec,
    user_passport: userAgentPassport,
    routing_context: routingDecision
  })
});
```

**What Prime receives:**
- Full task spec (event details, user context)
- User's agent passport (DNA, preferences)
- Routing context (why Gaia chose Prime)

---

#### **STEP 6: Prime Executes (Multi-Step Process)**

**Prime does the actual work:**

**6a. Prime Creates Event**
```typescript
// Prime creates event in database
const event = await db.from('weekly_activities').insert({
  user_id: taskSpec.user_id,
  event_name: "Entrepreneurs & Music Networking",
  location: "San Francisco, CA",
  start_date: "2025-12-06T19:00:00Z",
  tags: ["entrepreneurship", "music", "networking"],
  is_hosting: true,
  max_capacity: 10,
  event_title: "Entrepreneurs & Music Networking",
  metadata: {
    created_by: "prime-agent",
    auto_invited: true,
    theme: ["entrepreneurship", "music"]
  }
}).select().single();
```

**6b. Prime Finds Network Matches**
```typescript
// Prime queries for matching users
const matches = await db.query(`
  SELECT 
    p.id,
    p.full_name,
    p.interests,
    p.location,
    ucv.combined_vector,
    -- Calculate compatibility score
    cosine_similarity(
      (SELECT combined_vector FROM user_compatibility_vectors WHERE user_id = $1),
      ucv.combined_vector
    ) as compatibility_score
  FROM profiles p
  JOIN user_compatibility_vectors ucv ON ucv.user_id = p.id
  WHERE 
    p.location ILIKE '%San Francisco%'
    AND p.id != $1
    AND (
      p.interests && ARRAY['entrepreneurship', 'music']
      OR cosine_similarity(...) > 0.3
    )
  ORDER BY compatibility_score DESC
  LIMIT 10
`, [taskSpec.user_id]);
```

**6c. Prime Creates Invites**
```typescript
// Prime creates invite records
const invites = await Promise.all(
  matches.map(match => 
    db.from('event_attendees').insert({
      event_id: event.id,
      user_id: match.id,
      status: 'pending',  // User needs to confirm
      created_at: new Date()
    })
  )
);
```

**6d. Prime Generates Personalized Invite Messages**
```typescript
// Prime uses LLM to generate personalized invite messages
const inviteMessages = await Promise.all(
  matches.map(async (match) => {
    const message = await generateInviteMessage({
      event: event,
      invitee: match,
      host: userProfile,
      compatibility_score: match.compatibility_score
    });
    
    // Store in messages/notifications system
    await db.from('messages').insert({
      from_user_id: taskSpec.user_id,
      to_user_id: match.id,
      content: message,
      type: 'event_invite',
      metadata: { event_id: event.id }
    });
    
    return { user_id: match.id, message };
  })
);
```

**6e. Prime Returns Results**
```typescript
const primeResult = {
  success: true,
  event: {
    id: event.id,
    title: event.event_title,
    date: event.start_date,
    location: event.location
  },
  invites: {
    sent: invites.length,
    matches_found: matches.length,
    details: matches.map(m => ({
      user_id: m.id,
      name: m.full_name,
      compatibility_score: m.compatibility_score,
      invite_sent: true
    }))
  },
  summary: `Created event "Entrepreneurs & Music Networking" for Dec 6 at 7pm in SF. 
            Found 10 perfect matches and sent invites.`
};
```

**Prime logs execution:**
```sql
INSERT INTO agent_usage_logs (
  stella_handle,
  agent_id,  -- Prime's UUID
  user_id,
  task_type,
  full_context_json,
  routing_metadata,  -- From Gaia
  task_steps,  -- Array of steps Prime took
  input_json,
  output_json,
  resulting_event_id,
  success_flag,
  latency_ms,
  parent_usage_log_id,  -- Links to Gaia's routing log
  created_at
) VALUES (
  '@ayen.monasha.network',
  'prime-uuid',
  'ayen-uuid',
  'EVENT_PLANNING',
  {...fullContext...},
  {...routingMetadata...},
  [
    "analyzed_network",
    "found_10_matches",
    "created_event",
    "sent_invites",
    "generated_personalized_messages"
  ],
  {...taskSpec...},
  {...primeResult...},
  'event-uuid',
  true,
  1250,  -- milliseconds
  'gaia-routing-log-uuid',
  NOW()
);
```

---

#### **STEP 7: Gaia Returns to Stella**

**Gaia receives Prime's result and returns to Stella:**

```typescript
const gaiaResponse = {
  success: true,
  agent_results: [
    {
      agent: "prime",
      result: primeResult,
      latency_ms: 1250
    }
  ],
  summary: "Event created successfully with 10 invites sent"
};
```

---

#### **STEP 8: Stella Formats Response for User**

**Stella receives result and creates natural language response:**

```typescript
// Stella's system prompt includes Prime's result:
const stellaResponse = `Perfect! I've created your event "Entrepreneurs & Music Networking" 
for next Friday (Dec 6) at 7pm in San Francisco. 

I found 10 amazing people in your network who are entrepreneurial and love music. 
I've sent them personalized invites - they'll see them in their inbox shortly.

The event is now in your calendar, and as people confirm, you'll see the attendee list 
grow. Want me to help you plan anything else for the event?`;

return {
  response: stellaResponse,
  intent: "create_event",
  events: [event],  // For UI to display
  matches: matches,  // For UI to show invitees
  agent_result: primeResult  // For debugging/analytics
};
```

**Stella logs final response:**
```sql
INSERT INTO agent_usage_logs (
  stella_handle,
  agent_id,  -- NULL (Stella is interface)
  user_id,
  task_type,
  full_context_json,
  input_json,
  output_json,  -- Stella's formatted response
  parent_usage_log_id,  -- Links to Prime's execution log
  created_at
) VALUES (
  '@ayen.monasha.network',
  NULL,
  'ayen-uuid',
  'response_formatting',
  {...},
  {...primeResult...},
  {...stellaResponse...},
  'prime-execution-log-uuid',
  NOW()
);
```

---

## 🚀 Making Stella Proactive: The "Aha Moment"

### What Makes Users Say "Wow"?

**The "Aha Moment" happens when:**
1. Stella anticipates needs (proactive)
2. Stella executes complex tasks in one request
3. Stella learns from patterns
4. Stella connects dots user didn't see

### How to Make Stella Proactive

**1. Autonomy Score (from agent_passport)**
```json
{
  "preferences": {
    "autonomy": 0.7  // 0 = always ask, 1 = fully autonomous
  }
}
```

**How it works:**
- `autonomy: 0.0-0.3` → Stella always asks for confirmation
- `autonomy: 0.4-0.6` → Stella asks for important decisions
- `autonomy: 0.7-0.9` → Stella acts proactively, confirms after
- `autonomy: 0.9-1.0` → Stella fully autonomous (future)

**Example:**
```
User: "I'm going to SF next week"
Stella (autonomy 0.7): "Great! I see you're going to SF. 
                        Would you like me to find events happening there 
                        that match your interests? I can also check if any 
                        of your network connections are in SF and suggest 
                        meetups."

[User doesn't respond for 2 hours]

Stella (proactive): "I went ahead and found 3 events in SF next week 
                     that match your interests. I also found 12 people 
                     in your network who are in SF. Want me to set up 
                     some introductions?"
```

**2. Pattern Recognition (from Digital DNA v2)**
```typescript
// Stella learns patterns:
const patterns = {
  "user_creates_events_fridays": 0.8,  // 80% of events are Fridays
  "user_prefers_evening": 0.9,  // 90% prefer evening
  "user_likes_networking": 0.95,  // 95% of events are networking
  "user_invites_10_people": 0.7  // 70% invite ~10 people
};

// Stella can proactively suggest:
if (userMentionsLocation && patterns.user_creates_events_fridays > 0.7) {
  stellaSuggests = "I notice you usually create events on Fridays. 
                    Want me to set one up for this Friday?";
}
```

**3. Context Awareness**
```typescript
// Stella tracks context:
const context = {
  recent_events: [...],  // Last 5 events user created
  calendar_conflicts: [...],  // Upcoming conflicts
  network_activity: [...],  // What network is doing
  user_mood: "excited"  // From conversation tone
};

// Stella proactively suggests:
if (context.calendar_conflicts.length > 0) {
  stellaSuggests = "I noticed you have a conflict on Friday. 
                    Want me to reschedule your SF event to Saturday?";
}
```

**4. Multi-Agent Orchestration (The Real Power)**

**Example: Complex Request**
```
User: "I want to host a dinner next Friday in SF for entrepreneurs 
       who love music, invite 10 people, and make sure they're all 
       available that night"
```

**Stella's Proactive Multi-Agent Flow:**

```typescript
// Stella generates task spec:
const taskSpec = {
  type: "EVENT_PLANNING_WITH_AVAILABILITY_CHECK",
  context: {
    event_details: {...},
    requires_availability_check: true,
    requires_personalized_invites: true
  }
};

// Gaia routes to MULTIPLE agents:
const routes = [
  {
    agent: "prime",
    priority: 1,
    role: "event_creation"
  },
  {
    agent: "calendar_agent",  // NEW agent
    priority: 2,
    role: "availability_check",
    depends_on: ["prime"]  // Runs after Prime creates event
  },
  {
    agent: "network_matcher",
    priority: 3,
    role: "find_matches",
    depends_on: ["prime"]
  },
  {
    agent: "invite_agent",  // NEW agent
    priority: 4,
    role: "send_invites",
    depends_on: ["calendar_agent", "network_matcher"]
  }
];

// Execution flow:
// 1. Prime creates event
// 2. Calendar Agent checks availability of network
// 3. Network Matcher finds 10 best matches
// 4. Invite Agent sends personalized invites only to available people
// 5. Stella reports: "Created event, found 10 matches, checked 
//    their calendars, and sent invites to 8 who are available"
```

---

## 📈 Scalability from Day One

### 1. Agent Isolation

**Each agent is independent:**
- Prime agent: `supabase/functions/prime-agent/index.ts`
- Study Planner: `supabase/functions/study-planner-agent/index.ts`
- Network Matcher: `supabase/functions/network-matcher-agent/index.ts`

**Benefits:**
- Deploy agents independently
- Test agents in isolation
- Scale agents separately (some need more resources)
- Update agents without affecting others

### 2. Agent Registry (Dynamic Discovery)

**Agents are registered in database:**
```sql
-- New agent? Just insert into agents table:
INSERT INTO agents (name, slug, domain, status) VALUES
  ('Venue Finder', 'venue_finder', 'EVENT_PLANNING', 'EXPERIMENTAL');
```

**Stella/Gaia automatically discover new agents:**
```typescript
// Gaia queries agents dynamically:
const availableAgents = await db
  .from('agents')
  .select('*, agent_passports(*)')
  .eq('status', 'ACTIVE')
  .eq('domain', taskSpec.domain);
```

**No code changes needed to add new agents!**

### 3. Agent Versioning

**Agents can have multiple versions:**
```sql
-- Agent versions:
agents:
  - id: prime-v1-uuid, slug: "prime", version: 1
  - id: prime-v2-uuid, slug: "prime", version: 2

-- Gaia can route to specific version:
routing_metadata: {
  agent_version: 2,
  reason: "v2 has better network matching"
}
```

### 4. Agent Performance Tracking

**Every agent call is logged:**
```sql
agent_usage_logs:
  - success_flag
  - latency_ms
  - error_message
  - user_feedback
```

**Gaia uses performance data for routing:**
```typescript
// Route to best-performing agent:
const agents = await db.query(`
  SELECT a.*, 
    AVG(aul.success_flag::int) as success_rate,
    AVG(aul.latency_ms) as avg_latency
  FROM agents a
  JOIN agent_usage_logs aul ON aul.agent_id = a.id
  WHERE a.slug = 'prime'
  GROUP BY a.id
  ORDER BY success_rate DESC, avg_latency ASC
`);
```

### 5. Multi-Agent Orchestration

**Agents can call other agents:**
```typescript
// Prime can call Network Matcher:
const networkMatches = await callAgent('network_matcher', {
  location: 'SF',
  theme: ['entrepreneurship', 'music'],
  max_results: 10
});

// Or Gaia orchestrates multiple agents:
const results = await Promise.all([
  callAgent('prime', eventTask),
  callAgent('calendar_agent', availabilityTask),
  callAgent('venue_finder', venueTask)
]);
```

### 6. Agent Marketplace (Future)

**Agents can be external (B2B):**
```sql
agents:
  - name: "Tax Advisor Pro"
  - slug: "tax_advisor_pro"
  - invocation_type: "HTTP_ENDPOINT"
  - invocation_config: {
      "endpoint": "https://taxadvisor.com/api/v1/analyze",
      "auth": "bearer_token",
      "pricing": "$0.10 per call"
    }
```

**Users can choose which agent to use:**
```typescript
// User preference:
user_agent_preferences: {
  "tax_help": "tax_advisor_pro",  // Use external agent
  "event_planning": "prime"  // Use internal agent
}
```

---

## 🎯 Complete Example Walkthrough

### User Request:
```
"book an event for next friday at 7 pm in SF and invite 10 people 
 from network who are in SF who are very entrepreneurial and like music"
```

### Step-by-Step Execution:

**1. Stella Receives & Analyzes (index2.ts - companionship layer)**
- Intent: `create_event`
- Extracts: date, time, location, max_attendees, theme
- Loads user's DNA, preferences, network stats
- Generates task spec

**2. Stella Calls Gaia (route-task function)**
- Stella sends task spec to Gaia
- Stella logs: "routing_request" in agent_usage_logs

**3. Gaia Routes (route-task function)**
- Gaia queries agents catalog
- Finds Prime agent (handles EVENT_PLANNING)
- Checks Prime's performance: 95% success rate, 1.2s latency
- Routes to Prime
- Gaia logs: "routing" in agent_usage_logs

**4. Prime Executes (prime-agent function - extracted from index.ts)**
- Prime creates event in `weekly_activities`
- Prime queries network:
  - Location: SF
  - Interests: entrepreneurship, music
  - Compatibility vectors: cosine similarity
- Prime finds 10 best matches
- Prime creates invites in `event_attendees` (status: 'pending')
- Prime generates personalized invite messages
- Prime sends notifications
- Prime logs: "EVENT_PLANNING" in agent_usage_logs

**5. Gaia Returns to Stella**
- Gaia receives Prime's result
- Gaia formats response

**6. Stella Formats for User**
- Stella creates natural language response
- Stella includes event details, invite count
- Stella logs: "response_formatting" in agent_usage_logs

**7. User Sees Result**
- Event appears in calendar
- 10 invites sent (pending confirmation)
- User gets notification: "Event created! 10 people invited."

---

## 🔗 How Everything Connects

```
agent_handles (Stella identity)
    │
    │ @ayen.monasha.network
    ▼
agent_passports (user) (Stella's personality/DNA)
    │
    │ DNA vectors, preferences, trust
    ▼
stella_chat (index2.ts) (Companionship layer)
    │
    │ Task spec
    ▼
route-task (Gaia router)
    │
    │ Routes to agent(s)
    ▼
agents (catalog) → agent_passports (agent) (Agent capabilities)
    │
    │ Prime, Study Planner, etc.
    ▼
prime-agent (Specialist agent)
    │
    │ Creates event, finds matches
    ▼
weekly_activities (Event created)
    │
    │ event_id
    ▼
event_attendees (Invites created)
    │
    │ All logged
    ▼
agent_usage_logs (Full audit trail)
```

---

## 💡 Key Insights for "Aha Moment"

### 1. Single Interface, Multiple Agents
- User talks to ONE thing (Stella)
- Stella orchestrates MANY agents behind the scenes
- User never thinks "which agent should I use?"

### 2. Proactive Intelligence
- Stella learns patterns (autonomy score)
- Stella anticipates needs (pattern recognition)
- Stella connects dots (context awareness)

### 3. Multi-Agent Orchestration
- Complex tasks = multiple agents working together
- Agents can call other agents
- Gaia coordinates everything

### 4. Full Observability
- Every step logged in agent_usage_logs
- Full audit trail from user request to result
- Performance tracking for continuous improvement

### 5. Scalable Architecture
- Add new agents without changing Stella
- Agents are isolated, testable, deployable independently
- Agent marketplace (future) for external agents

---

## 🎬 The "Aha Moment" in Action

**User's First Experience:**
```
User: "I want to host a dinner next Friday"

Stella: "Perfect! I'll set that up. What time and where?"

User: "7pm in SF"

Stella: "Got it! And what's the theme? Who should I invite?"

User: "Entrepreneurs who love music, invite 10 people"

Stella: "On it! Let me find the perfect matches in your network..."

[2 seconds later]

Stella: "✅ Done! I've created your event 'Entrepreneurs & Music Networking' 
        for next Friday at 7pm in SF. I found 10 amazing people in your network 
        who are entrepreneurial and love music - all in SF. I've sent them 
        personalized invites. They'll see them in their inbox shortly.

        The event is in your calendar now. As people confirm, you'll see the 
        attendee list grow. Want me to help you plan anything else?"

User: "Wow, that was so easy! This is exactly what I needed."
```

**The "Aha Moment":**
- User didn't have to think about which agent to use
- User didn't have to manually find people
- User didn't have to write invites
- Everything happened in ONE conversation
- Stella was proactive and helpful

---

## 📝 Summary

**Stella (index2.ts):**
- Pure companionship layer
- Understands intent, context, emotion
- Generates task specs
- Formats responses naturally
- NEVER does work - only orchestrates

**Gaia (route-task):**
- Router/orchestrator
- Routes tasks to appropriate agents
- Can orchestrate multiple agents
- Logs all routing decisions

**Prime (prime-agent - extracted from index.ts):**
- Event planning specialist
- Creates events
- Finds network matches
- Sends invites
- Does the actual work

**Agent Handles:**
- Stella's identity (@ayen.monasha.network)
- Links user to their Stella instance

**Agent Passports (User):**
- Stella's personality (DNA, preferences, trust)
- Used for personalization

**Agent Passports (Agent):**
- Agent capabilities, performance, trust
- Used for routing decisions

**Scalability:**
- Agents are isolated
- Agents are registered dynamically
- Agents can be versioned
- Agents can call other agents
- Full observability via agent_usage_logs

**The "Aha Moment":**
- Single interface (Stella)
- Proactive intelligence
- Multi-agent orchestration
- Full automation
- Natural conversation

---

This architecture makes Stella powerful, scalable, and creates that instant "aha moment" for users! 🚀

