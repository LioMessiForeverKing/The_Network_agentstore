# How Prime Agent Works

## 🤖 Is Prime AI?

**Short answer:** Prime is a **specialized agent** that uses **structured logic** primarily, with **optional AI/LLM** for certain tasks.

### Prime's Architecture

```
Prime Agent
├── Structured Logic (70%)
│   ├── Database operations (create event, create invites)
│   ├── Data validation
│   ├── Business rules (capacity limits, constraints)
│   └── Query logic (find matches by location/interests)
│
└── Pattern Recognition & NLP (30%)
    ├── ✅ Extract event details from natural language (pattern matching)
    ├── ✅ Enhanced network matching with compatibility scoring
    ├── ✅ Generate personalized invite messages (template-based)
    └── 🔮 Suggest event improvements (future: LLM-based)
```

## 🧠 How Prime Works

### 1. **Structured Operations (Current Implementation)**

Prime primarily uses **deterministic, rule-based logic**:

**Event Creation:**
- ✅ Parse date/time from input
- ✅ Validate required fields
- ✅ Create database record
- ✅ Set metadata, tags, capacity
- ✅ Calculate week_start date

**Network Matching:**
- ✅ Query `profiles` table
- ✅ Filter by location (SQL `ILIKE`)
- ✅ Filter by interests (SQL array overlap)
- ✅ Return top N matches
- ✅ (Future: Use vector similarity for better matching)

**Invite Creation:**
- ✅ Check event capacity
- ✅ Create invite records
- ✅ Set status to 'pending'
- ✅ (Future: Generate personalized messages with LLM)

### 2. **Enhanced Pattern Recognition & NLP (Now Available!)**

Prime now uses advanced pattern recognition and natural language processing:

**Natural Language Extraction:**
```typescript
// ✅ NOW AVAILABLE: Extract event details from natural language
const extracted = extractEventDetailsFromText(
  "I want to host a dinner next Friday at 7pm in SF for entrepreneurs"
)
// Returns: { 
//   date: "2025-12-06", 
//   time: "19:00", 
//   location: "San Francisco, CA", 
//   theme: ["entrepreneurship"],
//   confidence: 0.85
// }
```

**Enhanced Network Matching:**
```typescript
// ✅ NOW AVAILABLE: Pattern-based matching with compatibility scoring
const matches = await findNetworkMatchesEnhanced(supabase, taskSpec, eventId)
// Returns matches with:
// - compatibility_score (0-1)
// - match_reasons (why they matched: location, interests, etc.)
// - Sorted by best compatibility first
```

**Personalized Messages:**
```typescript
// ✅ NOW AVAILABLE: Generate personalized invite messages
const message = generateInviteMessage(
  eventDetails,
  { name: "Sarah", compatibility_score: 0.85, match_reasons: ["location_match", "2_interest_match"] },
  { name: "Host Name" }
)
// Returns: "Hey Sarah! I noticed we share similar interests and you're in San Francisco. 
// I'm hosting 'Entrepreneurs & Music Networking' on Friday, December 6th at 7:00 PM - 
// it seems perfect for you! Want to join?"
```

**Smart Suggestions:**
```typescript
// Future: Suggest event improvements
const suggestions = await suggestEventImprovements({
  event: eventDetails,
  userHistory: pastEvents,
  networkActivity: recentActivity
})
// Uses AI to suggest: "Based on your past events, you might want to 
// add 'networking' tag and increase capacity to 15"
```

## 🔄 Prime Execution Flow

### Current Flow (Structured Logic)

```
1. Receive Task Spec
   ↓
2. Validate Input
   ↓
3. Create Event (Database INSERT)
   ↓
4. Find Matches (SQL Queries)
   ↓
5. Create Invites (Database INSERT)
   ↓
6. Log Execution (Database INSERT)
   ↓
7. Return Result
```

### Future Flow (With AI)

```
1. Receive Task Spec
   ↓
2. Validate Input
   ↓
3. Create Event (Database INSERT)
   ↓
4. Find Matches (SQL Queries + Vector Similarity)
   ↓
5. Generate Personalized Messages (LLM)
   ↓
6. Create Invites (Database INSERT)
   ↓
7. Log Execution (Database INSERT)
   ↓
8. Return Result
```

## 💡 Key Points

### Prime is NOT:
- ❌ A general-purpose AI chatbot
- ❌ A language model itself
- ❌ A learning system (doesn't train on data)

### Prime IS:
- ✅ A **specialized agent** for event planning
- ✅ Uses **structured logic** for reliability
- ✅ Can **optionally use AI/LLM** for specific tasks
- ✅ **Deterministic** - same input = same output (mostly)
- ✅ **Fast** - no LLM calls for basic operations
- ✅ **Reliable** - database operations are transactional

## 🎯 Why This Architecture?

### Benefits of Structured Logic First:

1. **Reliability**: Database operations are predictable
2. **Speed**: No LLM latency for basic operations
3. **Cost**: Only use AI when needed
4. **Debugging**: Easy to trace execution
5. **Scalability**: Can handle high volume

### When to Use AI:

1. **Personalization**: Generate unique messages
2. **Extraction**: Parse natural language input
3. **Suggestions**: Recommend improvements
4. **Matching**: Advanced compatibility scoring (vector similarity)

## 📊 Prime's Intelligence Level

```
Intelligence Level: High
├── Structured Logic: ⭐⭐⭐⭐⭐ (5/5)
├── Pattern Recognition: ⭐⭐⭐⭐⭐ (5/5) - Enhanced matching with scoring
├── Natural Language: ⭐⭐⭐⭐ (4/5) - Pattern-based extraction & message generation
└── Learning: ⭐ (1/5) - No training, rule-based (future: learn from patterns)
```

## 🔮 Future Enhancements

### Phase 1: Current (Structured Logic)
- ✅ Create events
- ✅ Find matches (location + interests)
- ✅ Create invites

### Phase 2: ✅ COMPLETE - Enhanced Pattern Recognition & NLP
- ✅ Generate personalized invite messages (pattern-based templates)
- ✅ Extract event details from natural language (pattern matching)
- ✅ Enhanced network matching with compatibility scoring

### Phase 3: Add AI for Matching (Future)
- [ ] Use vector similarity for better matching (user_compatibility_vectors)
- [ ] Learn from past successful events
- [ ] ML-based compatibility prediction

### Phase 4: Add AI for Planning (Future)
- [ ] LLM-based event title/description generation
- [ ] Suggest optimal times/locations based on network activity
- [ ] Advanced compatibility scoring using Digital DNA v2

## 🎬 Example: Prime in Action

**User Request:**
```
"Create an event next Friday at 7pm in SF for entrepreneurs who love music, invite 10 people"
```

**Prime's Process:**
1. **Parse** (Enhanced NLP): Extract date, time, location, theme, max_attendees using pattern recognition
2. **Create Event** (Structured): INSERT into `user_weekly_activities`
3. **Find Matches** (Enhanced Pattern Recognition): Query `profiles` with compatibility scoring based on location, interests, profile completeness
4. **Create Invites** (Structured): INSERT into `event_attendees`
5. **Generate Messages** (✅ Pattern-Based): Generate personalized messages using compatibility score and match reasons
6. **Return Result** (Structured): Return event ID, invites sent, matches found with compatibility scores

**Result:**
```json
{
  "success": true,
  "event": {
    "id": "event-uuid",
    "title": "Entrepreneurs & Music Networking",
    "date": "2025-12-06T19:00:00Z",
    "location": "San Francisco, CA"
  },
  "invites": {
    "sent": 10,
    "matches_found": 10
  }
}
```

## 🏗️ Architecture Summary

**Prime = Structured Logic + Optional AI**

- **Core**: Database operations, queries, business rules
- **Enhancement**: AI/LLM for personalization and intelligence
- **Balance**: Fast, reliable operations with smart enhancements

This makes Prime:
- ✅ **Fast** (no LLM latency for basic ops)
- ✅ **Reliable** (deterministic database operations)
- ✅ **Scalable** (can handle high volume)
- ✅ **Extensible** (can add AI features incrementally)

