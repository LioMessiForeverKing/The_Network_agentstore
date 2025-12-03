# Validator Agent Flow

## Overview
The Validator Agent automatically evaluates agent outputs after execution to assess quality and catch errors.

## Flow Diagram

```
1. Synthetic Task Generated
   ↓
2. Task Run via Gaia Router
   ↓
3. Gaia Routes to Specialized Agent (e.g., Prime)
   ↓
4. Agent Executes Task
   ↓
5. Agent Output Returned to Gaia
   ↓
6. Usage Log Created in agent_usage_logs
   ↓
7. Validator Agent Called Automatically
   ↓
8. Validator Evaluates Output Using LLM
   ↓
9. Validation Event Stored in agent_validation_events
   ↓
10. Results Visible in Validator Dashboard
```

## When Validator is Called

The validator agent is automatically called in `/api/admin/synthetic-tasks` route when:
- ✅ Task execution succeeds (`gaiaResult.success === true`)
- ✅ Usage log exists (`usageLogs.id` is found)
- ✅ Agent output exists (`gaiaResult.execution_result` is present)
- ✅ Executed agent is not the validator itself

## What the Validator Tests

The validator agent uses an LLM (GPT-4o-mini) to evaluate:

1. **Correctness**: Does the output match the task requirements?
2. **Completeness**: Are all required fields present?
3. **Format**: Does the output match the expected schema?
4. **Policy Compliance**: Does it violate any system policies?
5. **Hallucination**: Did the agent make up information?

## Validation Output

The validator returns:
- **Score**: 0.0 to 1.0 (quality score)
- **Label**: PASS (≥0.8), FAIL (<0.5), or NEEDS_REVIEW (0.5-0.8)
- **Error Type**: HALLUCINATION, MISSING_FIELD, BAD_FORMAT, OFF_POLICY, OTHER, or NONE
- **Explanation**: Detailed reasoning for the evaluation

## Where to See Results

1. **Validator Dashboard** (`/validator`):
   - Lists all validation events
   - Shows score, label, error type, explanation
   - Allows human override/correction
   - Filterable by label, agent, date

2. **Synthetic Task Runner** (`/synthetic`):
   - Shows validation score and label on each task card
   - "View Validation" button links to validator dashboard
   - Expandable details show validation results

3. **Task Details** (expanded view):
   - Shows validation details in the expanded task view
   - Includes score, label, error type, and explanation

## Troubleshooting

### Validator Not Being Called
Check:
- Is the task execution successful? (Check `gaiaResult.success`)
- Does `usageLogs` exist? (Check if agent_usage_logs entry was created)
- Is `execution_result` present? (Check `gaiaResult.execution_result`)
- Check server logs for validator call messages

### No Validation Events in Dashboard
Check:
- Is the validator agent deployed? (`supabase functions deploy validator-agent`)
- Is the validator agent in the database? (Run `insert-validator-agent.sql`)
- Check server logs for validator errors
- Verify `agent_validation_events` table exists

### Validation Events Not Linking to Tasks
- Ensure `usage_log_id` is correctly passed to validator
- Check that `validation_event_id` is stored in `synthetic_tasks` table
- Verify the relationship between `agent_validation_events` and `agent_usage_logs`

