# Agentic Web v0 - Execution Plan

**Goal**: Reach "Investable v0" status by building the 4 pillars defined in `whattobuild.md`.
**Timeline**: Target 4-day build sprint.

---

## 🧠 Phase 1: The Brain (AgentRank v0)
**Objective**: Upgrade from basic sorting to a real, explainable ranking system that influences routing.

### 1.1 Database Schema Updates
- [ ] **Migration**: Update `agent_capabilities` table/schema to support ranking signals.
  - Add `ranking_signals` JSONB field if not explicitly present (or ensure structure exists).
  - Ensure fields for `agent_rank_score`, `domain_alignment`, `freshness_penalty`.

### 1.2 Gaia Router Logic (`gaia-router/index.ts`)
- [ ] **Metric Fetching**: Update `findCandidateAgents` to fetch/calculate:
  - `SRr`: Recent success rate (last N tasks).
  - `SRg`: Global success rate.
  - `V`: Average validator score.
  - `L`: Normalized latency (0-1).
  - `D`: Domain alignment (1 or 0).
  - `N`: Newness penalty.
- [ ] **Formula Implementation**:
  ```typescript
  score = (0.30 * SRr) + (0.20 * SRg) + (0.20 * V) + (0.15 * L) + (0.10 * D) - (0.05 * N)
  ```
- [ ] **Sorting & Fallback**:
  - Sort by `agent_rank_score` descending.
  - Implement tie-breaking: Validation Events > Latency > Created Date.
- [ ] **Persistence**:
  - Write calculated score back to `agent_capabilities` (or log it with the routing decision for async update).

### 1.3 Definition of Done
- [ ] Gaia logs show the full score breakdown for every routing decision.
- [ ] Routing is deterministic based on the formula.

---

## 💰 Phase 2: The Money (Accounting v1)
**Objective**: A demo-ready enterprise workflow that processes an invoice and produces accounting entries.

### 2.1 Specialized Agents
- [ ] **Invoice Extractor Agent** (`invoice-extractor-v1`)
  - Task: `INVOICE_EXTRACTION`
  - Input: Raw text/PDF/JSON.
  - Output: Structured invoice JSON (vendor, dates, line items, totals).
- [ ] **Accounting Classifier Agent** (`accounting-classifier-v1`)
  - Task: `ACCOUNTING_CLASSIFICATION`
  - Input: Extracted invoice + Chart of Accounts.
  - Output: Ledger entries (debit/credit, account codes).

### 2.2 Workflow Orchestration
- [ ] **Edge Function**: `accounting-workflow`
  - Hard-coded orchestration logic (not a generic DAG engine yet).
  - Step 1: Call Gaia (Extractor).
  - Step 2: Call Gaia (Classifier) using output of Step 1.
  - Step 3: Call Validator.
  - Step 4: Return combined result.

### 2.3 Definition of Done
- [ ] `POST /accounting-workflow` with a sample invoice returns valid JSON with ledger entries.
- [ ] Latency is acceptable for a demo (<5s ideal, <10s acceptable).

---

## 📊 Phase 3: The Story (Dashboard)
**Objective**: A single screen ("The Brain") to show investors how the system thinks.

### 3.1 Dashboard Views (`agent_store/app/(dashboard)`)
- [ ] **AgentRank Table** (`/dashboard/agentrank`)
  - Columns: Name, Domain, Status, SR(g), SR(r), Latency, **Rank Score**.
  - Sorting: By Rank Score default.
- [ ] **Agent Detail View**
  - Charts: Success rate over time.
  - Logs: Last 10 routing decisions involving this agent.
- [ ] **Routing Trace** (Optional but powerful)
  - View recent routing decisions and *why* an agent was picked.

### 3.2 Definition of Done
- [ ] Can open dashboard and see 600+ agents ranked.
- [ ] Can click an agent and see its learning curve (even if synthetic data initially).

---

## 📱 Phase 4: The Wedge (Consumer App)
**Objective**: Mobile app to capture "Digital DNA" and context.

### 4.1 Flutter/iOS App
- [ ] **Onboarding**:
  - Sign in (Google/Anon).
  - "Digital DNA" Survey (Interests: Startups, Music, etc.).
  - Sync to `agent_passports` table.
- [ ] **Home Feed**:
  - Visual representation of identity (Graph/Tags).
  - "Pulse" button (Ask TheNetwork).
- [ ] **Chat/Query Interface**:
  - Send raw message -> Gaia Router.
  - Display response + "Handled by {Agent}".

### 4.2 Definition of Done
- [ ] TestFlight build available.
- [ ] 20-50 users onboarded.
- [ ] Analytics tracking `question_sent`.

---

## Execution Order (Critical Path)

1. **Phase 1 (Brain)**: This unblocks the core value proposition. We can't claim "Agent OS" without it.
2. **Phase 2 (Money)**: This gives us the specific demo to show investors.
3. **Phase 3 (Story)**: This makes the backend visible.
4. **Phase 4 (Wedge)**: Parallelizable, but requires the Router to be stable.

