import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdminEmail } from '@/lib/admin-server'

// GET - List synthetic tasks with filters
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
        
        const status = searchParams.get('status')
        const agentSlug = searchParams.get('agent_slug')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
            .from('synthetic_tasks')
            .select(`
                *,
                agent_usage_logs (
                    id,
                    task_type,
                    success_flag,
                    latency_ms,
                    created_at
                ),
                agent_validation_events (
                    id,
                    score,
                    label,
                    error_type,
                    explanation,
                    created_at
                )
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (status) {
            query = query.eq('status', status)
        }

        if (agentSlug) {
            query = query.eq('agent_slug_candidate', agentSlug)
        }

        const { data: tasks, error } = await query

        if (error) {
            throw new Error(`Error fetching synthetic tasks: ${error.message}`)
        }

        return NextResponse.json({
            success: true,
            tasks: tasks || [],
            count: tasks?.length || 0
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Run synthetic tasks through Gaia
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
        const { task_ids, batch_size = 5 } = body

        const supabase = createAdminClient()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        // If task_ids provided, run those specific tasks
        // Otherwise, run all PENDING tasks
        let query = supabase
            .from('synthetic_tasks')
            .select('*')
            .eq('status', 'PENDING')
            .limit(batch_size)

        if (task_ids && Array.isArray(task_ids) && task_ids.length > 0) {
            query = query.in('id', task_ids)
        }

        const { data: tasks, error: fetchError } = await query

        if (fetchError) {
            throw new Error(`Error fetching tasks: ${fetchError.message}`)
        }

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No pending tasks to run',
                executed: 0
            })
        }

        const results = []

        // Run tasks in batches
        for (const task of tasks) {
            try {
                // Update status to RUNNING
                await supabase
                    .from('synthetic_tasks')
                    .update({ status: 'RUNNING' })
                    .eq('id', task.id)

                // Call Gaia router
                const taskSpec = {
                    ...task.task_spec_json,
                    user_id: user.id, // Use admin user ID
                    stella_handle: task.task_spec_json.stella_handle || '@synthetic.test.network'
                }

                const gaiaResponse = await fetch(
                    `${supabaseUrl}/functions/v1/gaia-router`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            task_spec: taskSpec
                        })
                    }
                )

                if (!gaiaResponse.ok) {
                    throw new Error(`Gaia router failed: ${gaiaResponse.statusText}`)
                }

                const gaiaResult = await gaiaResponse.json()

                // Find the usage_log_id from the result
                // The gaia router logs to agent_usage_logs, we need to find the latest one
                const { data: usageLogs } = await supabase
                    .from('agent_usage_logs')
                    .select('id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                // Trigger validation if usage log exists
                let validationEventId = null
                if (usageLogs && gaiaResult.execution_result) {
                    // Get the agent that was executed
                    const executedAgentSlug = gaiaResult.routes?.[0]?.agent_slug
                    
                    if (executedAgentSlug && executedAgentSlug !== 'validator') {
                        // Call validator agent
                        const validatorResponse = await fetch(
                            `${supabaseUrl}/functions/v1/validator-agent`,
                            {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${serviceKey}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    original_task_spec: taskSpec,
                                    agent_output: gaiaResult.execution_result,
                                    agent_slug: executedAgentSlug,
                                    usage_log_id: usageLogs.id
                                })
                            }
                        )

                        if (validatorResponse.ok) {
                            const validatorResult = await validatorResponse.json()
                            // Validation event is stored by the validator agent
                            const { data: validationEvents } = await supabase
                                .from('agent_validation_events')
                                .select('id')
                                .eq('usage_log_id', usageLogs.id)
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .single()
                            
                            if (validationEvents) {
                                validationEventId = validationEvents.id
                            }
                        }
                    }
                }

                // Update task status
                await supabase
                    .from('synthetic_tasks')
                    .update({
                        status: gaiaResult.success ? 'COMPLETED' : 'FAILED',
                        usage_log_id: usageLogs?.id || null,
                        validation_event_id: validationEventId,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', task.id)

                results.push({
                    task_id: task.id,
                    success: gaiaResult.success,
                    usage_log_id: usageLogs?.id || null,
                    validation_event_id: validationEventId
                })
            } catch (error: any) {
                console.error(`Error running task ${task.id}:`, error)
                
                // Update task status to FAILED
                await supabase
                    .from('synthetic_tasks')
                    .update({
                        status: 'FAILED',
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', task.id)

                results.push({
                    task_id: task.id,
                    success: false,
                    error: error.message
                })
            }
        }

        return NextResponse.json({
            success: true,
            executed: results.length,
            results
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Clear completed tasks
export async function DELETE(request: Request) {
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
        const status = searchParams.get('status') || 'COMPLETED'

        const { error } = await supabase
            .from('synthetic_tasks')
            .delete()
            .eq('status', status)

        if (error) {
            throw new Error(`Error deleting tasks: ${error.message}`)
        }

        return NextResponse.json({
            success: true,
            message: `Deleted all tasks with status: ${status}`
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

