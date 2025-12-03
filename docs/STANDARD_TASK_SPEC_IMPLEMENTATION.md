# Standard Task Spec Implementation

## Overview

Implemented a **standardized task spec format** that Stella always uses, with Gaia transforming it to agent-specific formats based on agent passport declarations. This scales to 10,000+ agents without Stella needing to know each agent's format.

## Architecture

```
User Message → Stella → Standard Task Spec → Gaia → Agent-Specific Format → Agent
```

### Key Components

1. **Standard Task Spec Format**: Universal format Stella always uses
2. **Agent Passport Declaration**: Agents declare their `input_format` preference
3. **Gaia Transformation Layer**: Transforms standard → agent format automatically
4. **Backward Compatibility**: Detects if task spec is already in agent format

## Standard Task Spec Schema

```typescript
interface StandardTaskSpec {
  type: string;                    // "EVENT_PLANNING", "GOAL_PLANNING", etc.
  user_id: string;
  stella_handle: string;
  raw_message: string;             // Original user message (ALWAYS preserved)
  intent: string;                  // "create_event", "edit_event", etc.
  extracted_entities?: {            // Optional: Stella's basic extraction
    location?: string;
    date?: string;
    time?: string;
    [key: string]: any;
  };
  context?: {                      // Additional context
    [key: string]: any;
  };
  source: "chat" | "api" | "synthetic";
  requires_confirmation?: boolean;
  urgency?: "low" | "normal" | "high";
}
```

## Agent Passport Input Format

Agents declare in their passport how they want to receive tasks:

```json
{
  "capabilities": {
    "input_format": "nlp_create" | "structured" | "raw_message" | "standard",
    "preferred_fields": {
      "action": "nlp_create",
      "auto_invite": false
    },
    "input_transformation": {
      "action_field": "context.action",
      "message_field": "context.message"
    }
  }
}
```

### Supported Formats

- **`nlp_create`**: For agents that extract from natural language (Prime)
  - Transforms to: `{ context: { action: "nlp_create", message: "<raw_message>" } }`
  
- **`structured`**: For agents that need structured data
  - Transforms to: `{ context: { action: "create", event_details: {...} } }`
  
- **`raw_message`**: Agent receives standard format as-is
  
- **`standard`**: No transformation (default)

## Transformation Flow

1. **Stella** creates standard task spec:
   ```json
   {
     "type": "EVENT_PLANNING",
     "raw_message": "hey im going to be in sf...",
     "intent": "create_event",
     ...
   }
   ```

2. **Gaia** receives standard format

3. **Gaia** reads agent passport → sees `input_format: "nlp_create"`

4. **Gaia** transforms to agent format:
   ```json
   {
     "type": "EVENT_PLANNING",
     "context": {
       "action": "nlp_create",
       "message": "hey im going to be in sf..."
     }
   }
   ```

5. **Agent** receives transformed format

## Backward Compatibility

Gaia detects if task spec is already in agent format:
- If `context.action` + `context.message` exists → Skip transformation
- If `raw_message` exists → Transform
- Allows gradual migration

## Benefits

✅ **Scalability**: Stella doesn't need to know agent formats  
✅ **Flexibility**: Agents declare their preferences  
✅ **Consistency**: All tasks use same standard format  
✅ **Maintainability**: Changes to agent formats don't affect Stella  
✅ **Testability**: Synthetic tasks use same standard format  

## Migration Status

- ✅ Standard format defined
- ✅ Gaia transformation implemented
- ✅ Prime passport updated with `input_format: "nlp_create"`
- ✅ Synthetic tasks use standard format
- ⏳ Stella update (in main repo, needs update)
- ⏳ Other agents passport updates

## Next Steps

1. Update Stella to use standard format (in main repo)
2. Update other agents' passports with `input_format`
3. Test end-to-end flow
4. Document agent passport format requirements

