# DNA Computation Log

## What is DNA Computation Log?

The **DNA Computation Log** tracks when and why Digital DNA v2 was recomputed. This provides versioning and debugging for DNA updates.

## Purpose

1. **Versioning**: Track DNA computation history
2. **Debugging**: Understand why DNA was recomputed
3. **Performance**: Track computation time
4. **Audit Trail**: Full history of DNA updates

## Database Schema

```sql
CREATE TABLE public.dna_computation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    dna_id UUID REFERENCES public.digital_dna_v2(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 2,
    trigger_source TEXT,  -- MANUAL, INGESTION, GOAL_UPDATE, etc.
    computation_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Trigger Sources

- **MANUAL**: User requested recomputation
- **INGESTION**: New data ingested
- **GOAL_UPDATE**: User updated goals
- **CONSTRAINT_UPDATE**: User updated constraints
- **MONTHLY**: Periodic refresh

## Related Documentation

- [Digital DNA v2](./11_digital_dna_v2.md) - DNA table

