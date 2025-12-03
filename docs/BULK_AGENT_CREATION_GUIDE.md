# Bulk Agent Creation Guide

## Quick Reference Template

```json
{
  "name": "Agent Name",
  "slug": "agent-slug",
  "description": "Agent description",
  "domain": "DOMAIN_NAME",
  "status": "EXPERIMENTAL",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "agent-function-name",
    "endpoint": "/functions/v1/agent-function-name",
    "method": "POST"
  },
  "type": "tool",
  "supported_task_types": ["TASK_TYPE_1", "TASK_TYPE_2"],
  "input_schema": {},
  "output_schema": {},
  "risk_level": "low",
  "cost_level": "cheap",
  "latency_target_ms": 500,
  "input_format": "standard"
}
```

## Required Fields

### Agents Table (Required)
```json
{
  "name": "Accounting Assistant",           // REQUIRED: Human-readable name
  "slug": "accounting-assistant",          // REQUIRED: URL-friendly identifier (lowercase, hyphens)
  "description": "Helps with tax calculations",  // Optional: Description
  "domain": "ACCOUNTING",                   // Optional: Domain (EVENT_PLANNING, ACCOUNTING, etc.)
  "invocation_type": "INTERNAL_FUNCTION",  // REQUIRED: "INTERNAL_FUNCTION" or "HTTP_ENDPOINT"
  "invocation_config": {                    // REQUIRED: Configuration for invocation
    "function_name": "accounting-agent",    // For INTERNAL_FUNCTION
    "endpoint": "/functions/v1/accounting-agent",
    "method": "POST"
  },
  "status": "EXPERIMENTAL"                  // Optional: "ACTIVE", "EXPERIMENTAL", "DISABLED" (default: "EXPERIMENTAL")
}
```

### Agent Capabilities / Passport (Optional but Recommended)

```json
{
  // Basic capabilities
  "supported_task_types": ["ACCOUNTING", "TAX_CALCULATION"],  // Array of task types agent handles
  "type": "tool",                            // Agent type: "tool", "workflow", "qa", "persona"
  
  // Standard Task Spec System (NEW!)
  "input_format": "standard",                 // How agent wants to receive tasks:
                                              // - "standard" (default): Gets standard format as-is
                                              // - "nlp_create": For NLP extraction (like Prime)
                                              // - "structured": Gets extracted_entities in context
                                              // - "raw_message": Gets standard format, focuses on raw_message
                                              // - "custom": Uses custom mapping (see input_transformation)
  
  "preferred_fields": {                      // Default values for transformation
    "action": "calculate",                   // Preferred action value
    "auto_invite": false                     // Agent-specific defaults
  },
  
  "input_transformation": {                  // For "custom" input_format
    "mapping": {
      "context.tax_period": "extracted_entities.period",
      "context.revenue": "extracted_entities.revenue",
      "context.expenses": "extracted_entities.expenses"
    }
  },
  
  // Schemas
  "input_schema": {                          // What the agent expects
    "type": "object",
    "properties": {
      "raw_message": {"type": "string"},
      "extracted_entities": {
        "type": "object",
        "properties": {
          "period": {"type": "string"},
          "revenue": {"type": "number"},
          "expenses": {"type": "number"}
        }
      }
    }
  },
  
  "output_schema": {                         // What the agent returns
    "type": "object",
    "properties": {
      "tax_amount": {"type": "number"},
      "tax_rate": {"type": "number"},
      "breakdown": {"type": "object"}
    }
  },
  
  // Performance & Safety
  "risk_level": "low",                       // "low", "medium", "high"
  "cost_level": "cheap",                     // "cheap", "medium", "heavy"
  "latency_target_ms": 2000,                 // Target response time in milliseconds
  "constraints": {                           // Agent constraints
    "max_context_tokens": 4000,
    "max_attendees": 50                      // Domain-specific constraints
  },
  "required_trust_threshold": 0.5            // Minimum trust score required
}
```

## Complete Example: Accounting Agent

```json
{
  "name": "Tax Calculator",
  "slug": "tax-calculator",
  "description": "Calculates quarterly and annual taxes",
  "domain": "ACCOUNTING",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "tax-calculator-agent",
    "endpoint": "/functions/v1/tax-calculator-agent",
    "method": "POST"
  },
  "status": "EXPERIMENTAL",
  "supported_task_types": ["ACCOUNTING", "TAX_CALCULATION"],
  "type": "tool",
  "input_format": "standard",
  "input_schema": {
    "type": "object",
    "properties": {
      "raw_message": {"type": "string"},
      "extracted_entities": {
        "type": "object",
        "properties": {
          "period": {"type": "string"},
          "revenue": {"type": "number"},
          "expenses": {"type": "number"}
        }
      }
    }
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "tax_amount": {"type": "number"},
      "tax_rate": {"type": "number"},
      "breakdown": {"type": "object"}
    }
  },
  "risk_level": "low",
  "cost_level": "cheap",
  "latency_target_ms": 1500
}
```

## Example: Prime Agent (NLP Format)

```json
{
  "name": "Prime",
  "slug": "prime",
  "description": "Event planning specialist",
  "domain": "EVENT_PLANNING",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "prime-agent",
    "endpoint": "/functions/v1/prime-agent",
    "method": "POST"
  },
  "status": "ACTIVE",
  "supported_task_types": ["EVENT_PLANNING", "EVENT_UPDATE", "EVENT_DELETE"],
  "type": "workflow",
  "input_format": "nlp_create",
  "preferred_fields": {
    "action": "nlp_create",
    "auto_invite": false
  },
  "input_schema": {
    "type": "object",
    "properties": {
      "context": {
        "type": "object",
        "properties": {
          "action": {"type": "string"},
          "message": {"type": "string"}
        }
      }
    }
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "event": {"type": "object"},
      "invites": {"type": "object"},
      "success": {"type": "boolean"}
    }
  },
  "risk_level": "low",
  "cost_level": "medium",
  "latency_target_ms": 3000
}
```

## Field Reference Table

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **name** | ✅ Yes | - | Human-readable agent name |
| **slug** | ✅ Yes | - | URL-friendly identifier |
| **invocation_type** | ✅ Yes | - | "INTERNAL_FUNCTION" or "HTTP_ENDPOINT" |
| **invocation_config** | ✅ Yes | {} | Function/endpoint configuration |
| **description** | ❌ No | null | Agent description |
| **domain** | ❌ No | null | Agent domain (EVENT_PLANNING, ACCOUNTING, etc.) |
| **status** | ❌ No | "EXPERIMENTAL" | "ACTIVE", "EXPERIMENTAL", "DISABLED" |
| **supported_task_types** | ❌ No | [domain] | Array of task types |
| **type** | ❌ No | "tool" | "tool", "workflow", "qa", "persona" |
| **input_format** | ❌ No | "standard" | How agent receives tasks (standard/nlp_create/structured/custom) |
| **preferred_fields** | ❌ No | {} | Default values for transformation |
| **input_transformation** | ❌ No | {} | Custom mapping for "custom" format |
| **input_schema** | ❌ No | {} | JSON schema for input |
| **output_schema** | ❌ No | {} | JSON schema for output |
| **risk_level** | ❌ No | "low" | "low", "medium", "high" |
| **cost_level** | ❌ No | "cheap" | "cheap", "medium", "heavy" |
| **latency_target_ms** | ❌ No | 500 | Target response time |
| **constraints** | ❌ No | {} | Agent-specific constraints |
| **required_trust_threshold** | ❌ No | 0.5 | Minimum trust score |

## Quick Start: Minimal Agent

```json
{
  "name": "My Agent",
  "slug": "my-agent",
  "invocation_type": "INTERNAL_FUNCTION",
  "invocation_config": {
    "function_name": "my-agent",
    "endpoint": "/functions/v1/my-agent",
    "method": "POST"
  }
}
```

This creates an agent with:
- Status: "EXPERIMENTAL"
- Domain: null (will use slug as fallback)
- Input format: "standard" (gets standard task spec)
- All other fields: defaults

