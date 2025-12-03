import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdminEmail } from '@/lib/admin-server'

// GET - List validation events with filters
export async function GET(request: Request) {
    try {
        const { data: { user } } = await getCurrentUser()

        if (!isAdminEmail(user?.email)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const supabase = createAdminClient()
        const { searchParams } = new URL(request.url)
        
        const label = searchParams.get('label')
        const agentId = searchParams.get('agent_id')
        const usageLogId = searchParams.get('usage_log_id')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
            .from('agent_validation_events')
            .select(`
                *,
                agent_usage_logs (
                    id,
                    task_type,
                    task_description,
                    agent_id,
                    user_id,
                    success_flag,
                    latency_ms,
                    created_at,
                    agents (
                        id,
                        name,
                        slug
                    )
                ),
                agents!agent_validation_events_validator_agent_id_fkey (
                    id,
                    name,
                    slug
                )
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (label) {
            query = query.eq('label', label)
        }

        if (agentId) {
            query = query.eq('validator_agent_id', agentId)
        }

        if (usageLogId) {
            query = query.eq('usage_log_id', usageLogId)
        }

        const { data: validations, error } = await query

        if (error) {
            console.error('[Validations API] Error fetching validations:', error);
            console.error('[Validations API] Error details:', JSON.stringify(error, null, 2));
            throw new Error(`Error fetching validations: ${error.message}`)
        }

        console.log(`[Validations API] Fetched ${validations?.length || 0} validation events`);

        return NextResponse.json({
            success: true,
            validations: validations || [],
            count: validations?.length || 0
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create manual validation (human override)
export async function POST(request: Request) {
    try {
        const { data: { user } } = await getCurrentUser()

        if (!isAdminEmail(user?.email)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { usage_log_id, score, label, error_type, explanation, notes } = body

        if (!usage_log_id || score === undefined || !label) {
            return NextResponse.json(
                { error: 'Missing required fields: usage_log_id, score, and label are required' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Get validator agent ID
        const { data: validatorAgent } = await supabase
            .from('agents')
            .select('id')
            .eq('slug', 'validator')
            .single()

        if (!validatorAgent) {
            return NextResponse.json(
                { error: 'Validator agent not found' },
                { status: 500 }
            )
        }

        const { data: validation, error } = await supabase
            .from('agent_validation_events')
            .insert({
                usage_log_id,
                validator_agent_id: validatorAgent.id,
                score: Math.max(0, Math.min(1, parseFloat(score))),
                label,
                error_type: error_type || 'NONE',
                explanation: explanation || '',
                notes: notes || '',
                is_human: true
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Error creating validation: ${error.message}`)
        }

        return NextResponse.json({
            success: true,
            validation
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH - Update validation (human correction)
export async function PATCH(request: Request) {
    try {
        const { data: { user } } = await getCurrentUser()

        if (!isAdminEmail(user?.email)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { id, score, label, error_type, explanation, notes } = body

        if (!id) {
            return NextResponse.json(
                { error: 'Missing required field: id' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        const updates: any = {
            is_human: true
        }

        if (score !== undefined) {
            updates.score = Math.max(0, Math.min(1, parseFloat(score)))
        }

        if (label) {
            updates.label = label
        }

        if (error_type) {
            updates.error_type = error_type
        }

        if (explanation !== undefined) {
            updates.explanation = explanation
        }

        if (notes !== undefined) {
            updates.notes = notes
        }

        const { data: validation, error } = await supabase
            .from('agent_validation_events')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw new Error(`Error updating validation: ${error.message}`)
        }

        return NextResponse.json({
            success: true,
            validation
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

