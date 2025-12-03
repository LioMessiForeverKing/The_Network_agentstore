# Agent Learning System - Implementation Summary

## ✅ What's Been Implemented

### 1. Database Schema
- **Migration**: `20250103_add_agent_learning_system.sql`
- **New Fields in `agent_capabilities`**:
  - `recent_success_rate` - Success rate from recent validations (more responsive)
  - `validation_count` - Total number of validations received
  - `last_validation_at` - Timestamp of last validation
  - `trend` - IMPROVING, STABLE, or DECLINING

- **New Table: `agent_validation_history`**:
  - Tracks every learning update
  - Stores reward, success_rate before/after, learning_rate
  - Full audit trail of agent learning

### 2. Automatic Learning Function
- **PostgreSQL Function**: `update_agent_learning()`
  - Calculates reward based on validation outcome
  - Uses Exponential Moving Average (EMA) for smooth learning
  - Adaptive learning rate (higher for new agents, lower for mature)
  - Updates success_rate, recent_success_rate, trend automatically

- **Database Trigger**: `agent_learning_on_validation`
  - Automatically fires when validation event is created
  - Updates agent capabilities in real-time
  - No code changes needed - works automatically!

### 3. Reward System

| Validation | Score Range | Reward | Impact |
|------------|-------------|--------|--------|
| **PASS** | 0.8 - 1.0 | +0.1 to +0.2 | Increases success_rate |
| **NEEDS_REVIEW** | 0.5 - 0.8 | +0.0 to +0.03 | Slight positive |
| **FAIL** | 0.0 - 0.5 | -0.1 to -0.2 | Decreases success_rate |

### 4. Adaptive Learning Rate

- **New Agents** (< 10 validations): 20% learning rate - Fast adaptation
- **Established** (10-100 validations): 10% learning rate - Balanced
- **Mature** (> 100 validations): 5% learning rate - Stable refinement

### 5. Enhanced Routing
- **Gaia Router** now uses:
  - `recent_success_rate` (preferred) over `success_rate`
  - `validation_count` for confidence weighting
  - `trend` for routing decisions
  - Agents with more validations get priority when rates are close

### 6. UI Updates
- **AgentCard** shows:
  - Recent success rate (if available)
  - Trend indicators (↑ improving, ↓ declining)
  - Validation count
  - Color-coded progress bars (green for improving, red for declining)

## How It Works

### Flow Diagram
```
1. Agent Executes Task
   ↓
2. Validator Evaluates (PASS/FAIL/NEEDS_REVIEW)
   ↓
3. Validation Event Stored
   ↓
4. Database Trigger Fires Automatically
   ↓
5. update_agent_learning() Function Called
   ↓
6. Reward Calculated (+0.1 to +0.2 or -0.1 to -0.2)
   ↓
7. Success Rate Updated via EMA
   ↓
8. Recent Success Rate Updated
   ↓
9. Trend Calculated (IMPROVING/STABLE/DECLINING)
   ↓
10. Learning History Stored
   ↓
11. Future Routing Uses Updated Metrics
```

### Example Learning Progression

**Agent starts:**
- success_rate: 0.5 (50%)
- validation_count: 0

**After 5 PASS validations (score 0.9 each):**
- Reward: +0.15 per validation
- Learning rate: 0.2 (new agent)
- After 5 validations: success_rate ≈ 0.65 (65%)
- Trend: IMPROVING

**After 20 PASS validations:**
- success_rate: ≈ 0.80 (80%)
- recent_success_rate: ≈ 0.85 (85%)
- validation_count: 20
- Trend: IMPROVING

**After 1 FAIL validation:**
- Reward: -0.15
- Learning rate: 0.1 (established agent)
- success_rate: ≈ 0.785 (78.5%)
- Trend: STABLE (small change)

## Benefits

1. **Self-Improving**: Agents get better automatically
2. **Real-Time**: Updates happen immediately after validation
3. **Fair Competition**: Best agents rise to top naturally
4. **Early Detection**: Declining trends visible immediately
5. **Data-Driven**: Routing based on actual performance, not assumptions

## Next Steps

1. **Run Migration**:
   ```bash
   cd agent_store
   npx supabase db push
   ```

2. **Test the System**:
   - Run synthetic tasks
   - Check validator dashboard for validations
   - Watch agent success rates update in real-time
   - See trends change as agents learn

3. **Monitor Learning**:
   - Check `/agents` page to see learning metrics
   - Look for trend indicators (↑ ↓)
   - Watch validation counts increase

4. **Future Enhancements**:
   - Learning curves visualization
   - A/B testing different learning rates
   - Per-task-type learning (agents learn differently for different tasks)
   - Confidence intervals for success rates

## Technical Details

### Exponential Moving Average Formula
```
new_success_rate = (learning_rate × reward) + ((1 - learning_rate) × old_success_rate)
```

### Reward Calculation
```sql
IF label = 'PASS':
  reward = 0.1 + (score - 0.8) × 0.5  -- 0.1 to 0.2
ELSE IF label = 'NEEDS_REVIEW':
  reward = (score - 0.5) × 0.1  -- 0.0 to 0.03
ELSE:
  reward = -0.1 - (0.5 - score) × 0.2  -- -0.1 to -0.2
```

### Trend Detection
```sql
IF new_rate > old_rate + 0.05: 'IMPROVING'
ELSE IF new_rate < old_rate - 0.05: 'DECLINING'
ELSE: 'STABLE'
```

