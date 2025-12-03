# Standard Task Spec Format

## Overview

All agents receive tasks in a **standardized format** that Stella always uses. Gaia transforms this standard format to agent-specific formats based on agent passport declarations.

## Standard Task Spec Schema

```typescript
interface StandardTaskSpec {
  // Core identification
  type: string;                    // Task type: "EVENT_PLANNING", "GOAL_PLANNING", etc.
  user_id: string;                 // User who requested the task
  stella_handle: string;           // User's Stella handle
  
  // Original user input (always preserved)
  raw_message: string;             // Original user message to Stella
  
  // Intent classification
  intent: string;                  // Stella's intent classification: "create_event", "edit_event", etc.
  
  // Optional: Stella's basic extraction (if available)
  extracted_entities?: {
    location?: string;
    date?: string;
    time?: string;
    [key: string]: any;            // Flexible for different task types
  };
  
  // Context (flexible, task-type specific)
  context?: {
    [key: string]: any;            // Additional context as needed
  };
  
  // Metadata
  source: "chat" | "api" | "synthetic";
  requires_confirmation?: boolean;
  urgency?: "low" | "normal" | "high";
}
```

## Agent Passport Input Format Declaration

Each agent declares in its passport how it wants to receive the standard format:

```json
{
  "capabilities": {
    "input_format": "nlp_create" | "structured" | "raw_message" | "standard" | "custom",
    "preferred_fields": {
      "action": "nlp_create",                // Preferred action value
      "auto_invite": false                    // Default values (agent-specific)
    },
    "input_transformation": {
      // For "custom" format: field mapping
      "mapping": {
        "context.message": "raw_message",           // Map raw_message to context.message
        "context.amount": "extracted_entities.amount",  // Map extracted amount
        "context.quarter": "extracted_entities.quarter"
      }
    }
  }
}
```

### Format Options Explained

- **`standard`** (default): Agent receives standard format as-is. Best for most agents.
- **`raw_message`**: Agent receives standard format, but focuses on `raw_message` field.
- **`nlp_create`**: For agents that extract from natural language (like Prime). Transforms to `{ context: { action: "nlp_create", message: "<raw_message>" } }`
- **`structured`**: For agents that need structured data. Maps `extracted_entities` to `context`.
- **`custom`**: Agent defines custom transformation using `input_transformation.mapping`.

## Transformation Rules

### Format: "nlp_create"
Transforms to:
```json
{
  "type": "EVENT_PLANNING",
  "user_id": "...",
  "stella_handle": "...",
  "context": {
    "action": "nlp_create",
    "message": "<raw_message>",
    "auto_invite": <preferred_fields.auto_invite>
  }
}
```

### Format: "structured"
Transforms to:
```json
{
  "type": "EVENT_PLANNING",
  "user_id": "...",
  "stella_handle": "...",
  "context": {
    "action": "create",
    "event_details": {
      // From extracted_entities or context
    }
  }
}
```

### Format: "raw_message"
Passes through standard format as-is (agent handles internally)

### Format: "standard"
No transformation needed (agent accepts standard format)

## Benefits

1. **Scalability**: Stella doesn't need to know agent formats
2. **Flexibility**: Agents declare their preferences
3. **Consistency**: All tasks go through same format
4. **Maintainability**: Changes to agent formats don't affect Stella
5. **Testability**: Synthetic tasks use same standard format

