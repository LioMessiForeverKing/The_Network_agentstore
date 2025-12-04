Making Agentic Web v0 Investable
Build Plan & Definitions of “Done”
1. Objective

The goal of this document is simple:

Define exactly what needs to be built, at a minimum, for TheNetwork’s Agentic Web v0 to be credible and investable to institutional seed investors today.

Not “perfect,” not “v1,” but sufficient evidence that:

You’ve built a real Agent OS (not just a wrapper around LLMs).

You have a real-enterprise-use-case with a believable path to revenue.

You have a consumer identity/context wedge no one else has.

You can ship insanely fast and compound.

Everything below is in service of those four claims.

2. What “Investable Today” Actually Means

For a seed investor evaluating you in 20–30 minutes, “investable” ≈ “these are outliers worth betting on.” In practice, that means you need:

A Proprietary Engine (Agent OS)

Clear: routing, ranking, passports, learning.

Defensible: not trivial to copy in a weekend.

Already running in production for something.

A Credible Money Flow (Enterprise Workflow)

One real workflow where you can clearly charge:

“If we do X at Y accuracy, you save Z hours/$.”

Even better: a design partner or LOI-ready workflow.

A Sticky Wedge (Consumer Layer)

A way to collect digital DNA + context at scale.

A UX where it’s obvious users aren’t just “chatting with GPT.”

Evidence of Velocity (Execution)

The surface area of what you’ve built in a very short time.

A dashboard / demo that shows you are building an OS, not just a demo.

This build plan is structured around those four pillars.

3. Current State (Short Snapshot)

(Currently, roughly:)

✅ Gaia Router: working routing, capability filtering, invocation, logging.

✅ Agent registry + passports: 590+ agents with capabilities JSON.

✅ Validator + basic learning: success rates, latency, validation counts.

✅ Logging: agent_usage_logs with full routing/execution history.

✅ A few production agents (Prime, Atlas, Validator).

⚠️ AgentRank v0: only a primitive ranking heuristic.

❌ No end-to-end enterprise workflow (Accounting v1 not implemented).

❌ No shipped consumer app vertical slice.

⚠️ Dashboard: basic agent listing, no AgentRank/learning view.

You are ~45% of the way to an investable v0.

4. What Must Exist Before You Raise

To be investable today, you need four concrete end products:

Agent OS (Gaia + AgentRank v0) – “The Brain”

Accounting Workflow v1 – “The Money”

Student App v0 – “The Wedge”

AgentRank Dashboard + Demo Script – “The Story”

Each has a clear “Definition of Done” below.

5. Agent OS: AgentRank v0 (The Brain)
5.1 Goal

Upgrade from “basic sorting” to a real, explainable ranking system that:

Combines multiple metrics into a single score.

Is visible and interpretable in a dashboard.

Actually influences routing behavior.

This is your PageRank moment.

5.2 Build Items

Formalize AgentRank v0 metrics

For each candidate agent in routing, fetch:

SRr = recent success rate (last N tasks)

SRg = global success rate

V = average validator score (0–1)

L = normalized latency score (0–1, lower latency → higher score)

D = domain alignment term (1 if agent.domain == task.domain, else 0)

N = newness flag (1 if total_uses < threshold, else 0)

Implement AgentRank v0 formula in Gaia

Exact scoring function:

agent_rank_score =
  0.30 * SRr +
  0.20 * SRg +
  0.20 * V +
  0.15 * L +
  0.10 * D -
  0.05 * N


Integrate into routing

For each filtered candidate agent:

compute agent_rank_score

sort descending

choose highest score as primary

Persist ranking signals

Store agent_rank_score in agent_capabilities.passport_data.ranking_signals.agent_rank_score.

Tie-breaking & fallback

If scores are equal within epsilon:

prefer higher validation_events

then lower latency

then created_at (older agent wins, unless explicitly EXPERIMENTAL).

5.3 Definition of Done

For any task_type, Gaia:

fetches ≥2 candidate agents

computes v0 formula

routes deterministically based on score

agent_rank_score is visible in DB + dashboard.

A simple log or endpoint can show:

top 5 agents for a given task_type with their scores and components.

Once this is done, you can truthfully say:

“We have AgentRank v0: a ranking system that learns from performance and chooses agents accordingly.”

6. Enterprise Workflow: Accounting v1 (The Money)
6.1 Goal

A single, real, demo-ready workflow that:

Takes an invoice/transaction as input.

Runs through a chain of specialized agents.

Produces normalized accounting entries + validation.

Is obviously billable to an accounting firm.

This is your “we can sell this tomorrow” proof.

6.2 Build Items
6.2.1 Define two core task types

INVOICE_EXTRACTION

ACCOUNTING_CLASSIFICATION

6.2.2 Create two specialized agents

Invoice Extractor Agent (invoice-extractor-v1)

domain: FINANCE

supported_task_types: [INVOICE_EXTRACTION]

Output JSON:

{
  "vendor": "string",
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "line_items": [
    {
      "description": "string",
      "quantity": 1,
      "unit_price": 100.0,
      "total": 100.0
    }
  ],
  "subtotal": 100.0,
  "tax": 8.88,
  "total": 108.88,
  "currency": "USD",
  "confidence": 0.0
}


Accounting Classifier Agent (accounting-classifier-v1)

domain: FINANCE

supported_task_types: [ACCOUNTING_CLASSIFICATION]

Inputs:

extractor output

client’s chart of accounts (can be hard-coded JSON for now)

Output JSON:

{
  "entries": [
    {
      "account_code": "6100",
      "account_name": "Office Supplies",
      "debit": 108.88,
      "credit": 0.0,
      "description": "Invoice #12345 - Vendor X",
      "tags": ["invoice", "office"]
    }
  ],
  "confidence": 0.0,
  "anomalies": []
}

6.2.3 Implement a hard-coded workflow edge function

Create accounting-workflow edge function:

Accepts:

PDF / raw text / structured JSON.

Normalizes to an internal invoice_representation.

Calls Gaia with:

task_type = INVOICE_EXTRACTION

Passes output to Gaia again with:

task_type = ACCOUNTING_CLASSIFICATION

Sends final combined result to Validator.

Returns:

{
  "normalized_invoice": { ... },
  "accounting_entries": { ... },
  "validator": {
    "score": 0.94,
    "label": "PASS",
    "rationale": "All totals matched, mapping consistent with history."
  },
  "metrics": {
    "latency_ms": 900,
    "agents_used": [
      "invoice-extractor-v1",
      "accounting-classifier-v1",
      "validator"
    ]
  }
}


Logs everything to agent_usage_logs.

6.3 Definition of Done

You can call POST /accounting-workflow (or similar) with an invoice.

The system reliably returns:

normalized invoice JSON

accounting entries JSON

validator result

You have:

5–10 test invoices

observed accuracy qualitatively “good enough to be useful”

You can show this live in a demo to an accounting firm and say:

“We can plug your chart of accounts into this in days, not months.”

At that point, an LOI conversation becomes credible.

7. Consumer Layer: Student App v0 (The Wedge)
7.1 Goal

A minimal but real student-facing app that:

Onboards real users (20–50 students).

Captures some digital DNA.

Routes their queries through Gaia.

Shows a clear “this is not just ChatGPT” experience.

This proves you can:

Collect context at scale.

Use that context to route to agents.

7.2 Build Items
7.2.1 Onboarding

Sign-in (Google or email sign-in).

Collect:

name

school

year

Simple interests survey:

“Rate from 1–5: startups, math, music, F1, fitness, etc.”

Write this into agent_passports.passport_data.digital_dna.

7.2.2 Home Screen

Show:

a minimal “identity” view (e.g., a simple graph or tags of top interests).

Main CTA:

“Ask TheNetwork” / “Send a Pulse”.

7.2.3 Ask/Pulse Flow

Text input box.

On submit:

Construct task_spec:

user_id

task_type (e.g., GENERAL_QA or STUDENT_HELP)

raw_message

Call Gaia router.

Display:

user message

answer

“Handled by: {agent_name}” (from routing metadata).

7.2.4 Profile View

Name, school, year.

Top 3–5 interests (from passport).

Count of interactions.

7.2.5 Analytics

Track at least:

app_open

question_sent

agent_response_received

7.3 Definition of Done

You have a TestFlight build / IPA that can be installed.

20–50 students have:

onboarded,

asked at least 1–3 questions each.

You have:

screenshots of real conversations,

a list of qualitative feedback points (what they liked / didn’t like).

Now you can tell investors:

“We already have users feeding digital DNA into our Agent OS.”

8. Observability & Story: AgentRank Dashboard + Demo
8.1 Goal

Give investors and enterprise partners a single screen where they see:

Agents ranked.

Performance metrics.

Evidence that the system learns.

This is where you make it obvious this is not “just a chat app.”

8.2 Build Items
8.2.1 AgentRank Dashboard Page

Route: /dashboard/agentrank (or similar).

Table showing:

agent_name

slug

domain

status (ACTIVE/EXPERIMENTAL)

success_rate_global

success_rate_recent

average_latency_ms

total_uses

agent_rank_score (from v0 formula)

Sort by any column, especially agent_rank_score.

8.2.2 Agent Detail View

On click:

show last 20 agent_usage_logs rows for that agent

simple chart:

success_rate_recent over time

list:

last 10 validation results (score, label)

8.2.3 Routing History View (even minimal)

Simple list:

timestamp

task_type

selected agent_slug

validator_score

8.3 Definition of Done

In a live demo, you can:

Open /dashboard/agentrank.

Show:

“Here are 600+ agents, this is how we rank them.”

Click into one:

show its logs, validation, learning curve.

Run a live query:

show which agent was chosen and why.

This is the “X-ray” of your Agent OS.

9. Explicit Non-Goals Before the Raise

To stay focused, you do not need before fundraising:

A general-purpose workflow engine (DAG builder, visual orchestrator).

ML-based learning-to-rank (v0.5+).

Agent marketplace / tokenomics / protocol layer.

Third-party agent onboarding system.

Perfect UX or pixel-perfect design.

End-to-end coverage of all domains.

You just need:

a real brain (AgentRank v0),

a real money path (Accounting v1),

a real wedge (student app feeding digital DNA),

and a clear window into the system (dashboard + demo).

10. How to Use This Doc

Concretely:

Paste this into Cursor as investable_v0_build_plan.md.

Under each section, you can add:

Owner (Ayen / Tristan)

ETA

Implementation notes

Break each into tasks in your project tool (or just keep it in Cursor).

Once pieces are implemented, update the “Definition of Done” checkboxes.