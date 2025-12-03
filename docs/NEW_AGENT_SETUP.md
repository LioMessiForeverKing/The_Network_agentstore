# New Agent Setup Guide

When you add a new agent, here's what needs to happen for it to work with the entire system:

## ✅ What Works Automatically

Once you add an agent with the proper configuration, **everything works automatically**:

1. **Synthetic Task Generation** - Automatically generates test tasks for EXPERIMENTAL agents
2. **Gaia Router** - Automatically routes tasks to the agent based on task type
3. **Task Transformation** - Automatically transforms standard task specs to agent's preferred format
4. **Validation** - Validator agent automatically validates all agent outputs
5. **Learning System** - Automatically updates agent metrics when validations occur
6. **Learning Curves** - Automatically tracks learning progress over time

## 📋 Required Fields for New Agents

### 1. `agents` Table Entry

```sql
INSERT INTO agents (
  name,           -- Display name (e.g., "My New Agent")
  slug,           -- Unique identifier (e.g., "my-new-agent")
  description,    -- What the agent does
  domain,         -- Domain (e.g., "GOAL_PLANNING", "EVENT_PLANNING", "CODING")
  status,         -- "EXPERIMENTAL" (for testing) or "ACTIVE" (for production)
  invocation_type, -- "INTERNAL_FUNCTION", "EXTERNAL_API", etc.
  invocation_config -- JSON config with function_name, endpoint, etc.
) VALUES (...)
```

**Key Points:**
- `status` must be `EXPERIMENTAL` for synthetic testing
- `status` must be `ACTIVE` for production use
- `invocation_config` must include `function_name` and `endpoint` for edge functions

### 2. `agent_capabilities` Table Entry

```sql
INSERT INTO agent_capabilities (
  agent_id,
  supported_task_types,  -- Array of task types (e.g., ["GOAL_PLANNING"])
  passport_data,         -- JSONB with full passport
  success_rate,          -- Initial success rate (default: 0.5)
  average_latency_ms,    -- Initial latency (default: 0)
  total_uses            -- Initial use count (default: 0)
) VALUES (...)
```

**Required `passport_data` Structure:**

```json
{
  "type": "agent",
  "capabilities": {
    "supported_task_types": ["GOAL_PLANNING"],  // REQUIRED: What task types this agent handles
    "input_format": "standard",                  // How agent wants to receive tasks
                                                 // Options: "nlp_create", "structured", "raw_message", "standard", "custom"
    "preferred_fields": {},                      // Optional: Fields agent prefers
    "input_transformation": {}                   // Optional: Custom transformation rules
  },
  "input_schema": {},                           // Optional: Input schema
  "output_schema": {},                          // Optional: Output schema
  "risk_level": "low",                          // Optional
  "cost_level": "medium",                       // Optional
  "latency_target_ms": 3000,                    // Optional
  "constraints": {},                            // Optional: Agent constraints
  "required_trust_threshold": 0.5              // Optional
}
```

**Critical Fields:**
- `capabilities.supported_task_types` - **REQUIRED** - Gaia uses this to route tasks
- `capabilities.input_format` - **REQUIRED** - Determines how Gaia transforms tasks

## 🎯 Task Type Matching

Gaia router matches tasks to agents by:
1. Checking `supported_task_types` in `passport_data.capabilities.supported_task_types`
2. Fallback: Uses `domain` if `supported_task_types` is empty
3. Only queries agents with matching `status`:
   - `EXPERIMENTAL` for synthetic tasks
   - `ACTIVE` for production tasks

## 🔄 Synthetic Task Generation

**For EXPERIMENTAL agents:**

1. **Prime Agent** (`slug === 'prime'`):
   - Automatically generates natural language prompts
   - Uses OpenAI to create conversational event planning prompts
   - Fallback to hardcoded prompts if OpenAI unavailable

2. **Atlas Agent** (`slug === 'atlas'` OR `supported_task_types` includes `'GOAL_PLANNING'`):
   - Automatically generates natural language prompts
   - Uses OpenAI to create goal planning prompts (podcast, music channel, cohost, etc.)
   - Fallback to hardcoded prompts if OpenAI unavailable

3. **Other Agents**:
   - Uses structured task templates
   - Generates 5 tasks per agent
   - Uses domain-specific templates

**To add custom NLP generation for a new agent:**
- Add a check in `generate-tasks/route.ts`:
  ```typescript
  } else if (agent.slug?.toLowerCase() === 'your-agent-slug') {
    // Generate custom NLP tasks
  }
  ```

## 🚀 What Happens When You Add a New Agent

1. **Agent Creation** → Agent appears in database
2. **Synthetic Task Generation** → If EXPERIMENTAL, tasks are generated automatically
3. **Task Execution** → Gaia routes tasks to agent based on `supported_task_types`
4. **Task Transformation** → Gaia transforms standard format to agent's `input_format`
5. **Agent Execution** → Agent processes the task
6. **Validation** → Validator automatically validates the output
7. **Learning Update** → Trigger automatically updates `agent_capabilities` metrics
8. **Learning History** → Entry created in `agent_validation_history`
9. **Learning Curves** → Data appears in learning curves dashboard

## ⚠️ Common Issues

### Agent Not Found by Gaia
- **Check:** `status` is correct (ACTIVE for production, EXPERIMENTAL for synthetic)
- **Check:** `supported_task_types` includes the task type you're sending
- **Check:** `agent_capabilities` entry exists with proper `passport_data`

### No Synthetic Tasks Generated
- **Check:** Agent `status` is `EXPERIMENTAL`
- **Check:** `supported_task_types` or `domain` is set
- **Check:** Agent is not the validator agent

### Tasks Not Routing to Agent
- **Check:** Task `type` matches `supported_task_types`
- **Check:** Agent `status` matches task source (ACTIVE for production, EXPERIMENTAL for synthetic)
- **Check:** `invocation_config` is properly set

### Validation Events Not Stored
- **Check:** `usage_log_id` is passed to validator agent
- **Check:** RLS policies allow inserts (service role should work)
- **Check:** Trigger function exists (`trigger_agent_learning`)

### Learning Metrics Not Updating
- **Check:** Validation events are being stored
- **Check:** `agent_capabilities` entry exists
- **Check:** Trigger is firing (check logs)

## 📝 Quick Checklist

When adding a new agent, ensure:

- [ ] Agent entry in `agents` table with:
  - [ ] `status` set correctly (EXPERIMENTAL or ACTIVE)
  - [ ] `slug` is unique
  - [ ] `domain` matches task type
  - [ ] `invocation_type` and `invocation_config` are set

- [ ] Capabilities entry in `agent_capabilities` table with:
  - [ ] `supported_task_types` array includes task types
  - [ ] `passport_data.capabilities.input_format` is set
  - [ ] `passport_data` structure is valid JSON

- [ ] For synthetic testing:
  - [ ] Agent `status` is `EXPERIMENTAL`
  - [ ] `supported_task_types` or `domain` is set
  - [ ] (Optional) Add custom NLP generation if needed

- [ ] For production:
  - [ ] Agent `status` is `ACTIVE`
  - [ ] Agent function/endpoint is deployed and working
  - [ ] `invocation_config` points to correct endpoint

## 🎉 That's It!

Once you've set up the agent with these fields, **everything else works automatically**. The system will:
- Generate synthetic tasks
- Route tasks to your agent
- Transform task formats
- Validate outputs
- Update learning metrics
- Track learning curves

No additional code changes needed!

