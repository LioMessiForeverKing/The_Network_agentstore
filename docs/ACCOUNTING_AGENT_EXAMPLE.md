# Accounting Agent Example - Standard Task Spec

## Scenario: User wants tax calculation help

**User Message to Stella:**
```
"hey can you help me calculate my quarterly taxes for Q1 2024? 
I made about $50,000 in revenue and had $10,000 in expenses"
```

## Flow

### 1. Stella Creates Standard Task Spec

```json
{
  "type": "ACCOUNTING",
  "user_id": "user-uuid",
  "stella_handle": "@user.network",
  "raw_message": "hey can you help me calculate my quarterly taxes for Q1 2024? I made about $50,000 in revenue and had $10,000 in expenses",
  "intent": "calculate_taxes",
  "extracted_entities": {
    "period": "Q1 2024",
    "revenue": 50000,
    "expenses": 10000,
    "task": "tax_calculation"
  },
  "context": {},
  "source": "chat",
  "urgency": "normal"
}
```

### 2. Gaia Routes to Accounting Agent

Gaia finds accounting agent with:
- `supported_task_types: ["ACCOUNTING", "TAX_CALCULATION"]`
- `input_format: "standard"` (or `"raw_message"`)

### 3. Transformation (if needed)

**Option A: `input_format: "standard"`**
- No transformation
- Accounting agent receives standard format as-is
- Agent can access: `raw_message`, `extracted_entities`, `intent`, etc.

**Option B: `input_format: "structured"`**
- Gaia transforms to:
```json
{
  "type": "ACCOUNTING",
  "user_id": "...",
  "context": {
    "action": "calculate_taxes",
    "period": "Q1 2024",
    "revenue": 50000,
    "expenses": 10000
  }
}
```

**Option C: `input_format: "custom"`**
- Accounting agent defines custom mapping:
```json
{
  "input_transformation": {
    "mapping": {
      "context.tax_period": "extracted_entities.period",
      "context.revenue": "extracted_entities.revenue",
      "context.expenses": "extracted_entities.expenses",
      "context.user_message": "raw_message"
    }
  }
}
```
- Gaia transforms using mapping

### 4. Accounting Agent Executes

Agent receives the format it declared and processes the tax calculation.

## Accounting Agent Passport Example

```json
{
  "capabilities": {
    "supported_task_types": ["ACCOUNTING", "TAX_CALCULATION", "FINANCIAL_ANALYSIS"],
    "input_format": "standard",  // Accepts standard format
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
    }
  }
}
```

## Key Points

✅ **Works for ANY agent type**: Accounting, tax, health, career, etc.  
✅ **Agent chooses format**: Declares `input_format` in passport  
✅ **Stella doesn't care**: Always uses standard format  
✅ **Gaia handles transformation**: Based on agent's declaration  
✅ **Flexible**: Agents can use `standard`, `structured`, `custom`, or `raw_message`  

## Different Agent Preferences

| Agent Type | Recommended Format | Why |
|------------|-------------------|-----|
| **Prime (Event Planning)** | `nlp_create` | Needs natural language extraction |
| **Accounting Agent** | `standard` or `structured` | Can work with extracted entities |
| **Tax Calculator** | `structured` | Needs structured financial data |
| **Health Tracker** | `raw_message` | Wants full context for health queries |
| **Code Generator** | `standard` | Needs full context (code, requirements, etc.) |

The system is **truly generic** and works for any agent type! 🎉

