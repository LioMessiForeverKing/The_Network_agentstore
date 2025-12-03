# Agent Learning System (Reinforcement Learning)

## Overview
Agents learn and improve from validator feedback in real-time. Each validation event updates agent performance metrics, which influence future routing decisions.

## Core Concept

```
Agent Executes Task
    ↓
Validator Evaluates (PASS/FAIL/NEEDS_REVIEW)
    ↓
Reward/Penalty Calculated
    ↓
Agent Capabilities Updated (Success Rate, Trust Score)
    ↓
Future Routing Uses Updated Metrics
    ↓
Agents Improve Over Time
```

## Reward System

### Validation Outcomes → Rewards

| Validation Label | Score Range | Reward | Impact |
|-----------------|-------------|--------|--------|
| **PASS** | 0.8 - 1.0 | +0.1 to +0.2 | Increases success_rate |
| **NEEDS_REVIEW** | 0.5 - 0.8 | +0.0 to +0.05 | Neutral/slight positive |
| **FAIL** | 0.0 - 0.5 | -0.1 to -0.2 | Decreases success_rate |

### Reward Calculation
```typescript
function calculateReward(validationScore: number, label: string): number {
  if (label === 'PASS') {
    // Reward based on how high the score is
    return 0.1 + (validationScore - 0.8) * 0.5; // 0.1 to 0.2
  } else if (label === 'NEEDS_REVIEW') {
    // Small positive reward for partial success
    return (validationScore - 0.5) * 0.1; // 0.0 to 0.03
  } else {
    // Penalty for failure
    return -0.1 - (0.5 - validationScore) * 0.2; // -0.1 to -0.2
  }
}
```

## Learning Mechanism

### 1. Exponential Moving Average (EMA)
Update success_rate using EMA to weight recent validations more heavily:

```typescript
new_success_rate = (alpha * reward) + ((1 - alpha) * old_success_rate)
```

Where:
- `alpha = 0.1` (learning rate - 10% weight to new validation)
- Recent validations have more impact
- System adapts quickly to agent improvements/degradations

### 2. Trust Score Calculation
```typescript
trust_score = base_trust * success_rate * recency_factor
```

Where:
- `base_trust`: Initial trust (from passport_data)
- `success_rate`: Learned from validations (0.0 to 1.0)
- `recency_factor`: More weight to recent performance

### 3. Performance Windows
Track performance over different time windows:
- **Last 10 tasks**: Recent performance (high weight)
- **Last 100 tasks**: Medium-term trends
- **All-time**: Long-term reliability

## Implementation Plan

### Phase 1: Update Agent Capabilities on Validation
- When validation event is created, trigger update function
- Calculate reward based on validation score/label
- Update `agent_capabilities.success_rate` using EMA
- Update `agent_capabilities.total_uses`
- Store recent validation history

### Phase 2: Enhanced Metrics
- Add `recent_success_rate` (last 10 validations)
- Add `trend` (improving/declining/stable)
- Add `confidence_score` (based on number of validations)
- Add `last_validation_at` timestamp

### Phase 3: Routing Intelligence
- Gaia router uses updated success_rate for routing decisions
- Prefer agents with higher recent_success_rate
- Consider confidence_score (more validations = more reliable)
- Factor in trend (prefer improving agents)

### Phase 4: Learning Analytics
- Track learning curves per agent
- Identify which agents learn fastest
- Detect performance degradation early
- A/B test different learning rates

## Database Schema Updates

### New Fields in `agent_capabilities`:
```sql
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS recent_success_rate DECIMAL(5,4);
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS validation_count INTEGER DEFAULT 0;
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS last_validation_at TIMESTAMPTZ;
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS trend TEXT CHECK (trend IN ('IMPROVING', 'STABLE', 'DECLINING'));
```

### New Table: `agent_validation_history`
```sql
CREATE TABLE agent_validation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  validation_event_id UUID REFERENCES agent_validation_events(id) ON DELETE CASCADE,
  reward DECIMAL(5,4),
  success_rate_before DECIMAL(5,4),
  success_rate_after DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Learning Rate Configuration

### Adaptive Learning Rate
- High learning rate (0.2) for new agents (< 10 validations)
- Medium learning rate (0.1) for established agents (10-100 validations)
- Low learning rate (0.05) for mature agents (> 100 validations)

This allows:
- New agents to adapt quickly
- Established agents to refine gradually
- Mature agents to maintain stability

## Integration Points

1. **Validator Agent**: After storing validation event, trigger learning update
2. **Gaia Router**: Use updated success_rate for routing decisions
3. **Admin Dashboard**: Show learning curves and trends
4. **Synthetic Task Runner**: Track learning progress over test runs

## Benefits

1. **Self-Improving System**: Agents get better over time
2. **Automatic Quality Control**: Poor agents get deprioritized
3. **Data-Driven Routing**: Decisions based on actual performance
4. **Early Problem Detection**: Declining trends trigger alerts
5. **Fair Competition**: Best agents rise to the top naturally

