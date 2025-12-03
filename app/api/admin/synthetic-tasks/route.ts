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
                    task_description,
                    success_flag,
                    latency_ms,
                    input_json,
                    output_json,
                    routing_metadata,
                    full_context_json,
                    error_message,
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

        // Use hardcoded user ID for synthetic tasks
        const userId = '89b49bcc-4be4-4d94-aa3e-abdc9367eb60'

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
                    user_id: userId, // Use validated UUID
                    stella_handle: task.task_spec_json.stella_handle || '@synthetic.test.network'
                }

                let gaiaResponse: Response
                let gaiaResult: any
                
                try {
                    gaiaResponse = await fetch(
                        `${supabaseUrl}/functions/v1/gaia-router`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceKey}`,
                                'Content-Type': 'application/json',
                                'apikey': serviceKey
                            },
                            body: JSON.stringify({
                                task_spec: taskSpec
                            })
                        }
                    )

                    // Try to parse response as JSON first
                    const responseText = await gaiaResponse.text()
                    
                    if (!gaiaResponse.ok) {
                        let errorMessage = `HTTP ${gaiaResponse.status}: ${gaiaResponse.statusText}`
                        try {
                            const errorJson = JSON.parse(responseText)
                            // Prioritize details field (Gaia router puts actual error there)
                            const details = errorJson.details || errorJson.error || errorJson.message
                            errorMessage = details || errorMessage
                            
                            // Add additional context
                            if (errorJson.debug) {
                                console.error('Gaia router debug:', JSON.stringify(errorJson.debug, null, 2))
                                errorMessage += ` | Debug: ${JSON.stringify(errorJson.debug)}`
                            }
                            if (errorJson.error && errorJson.error !== details) {
                                errorMessage = `${errorJson.error} | ${errorMessage}`
                            }
                        } catch {
                            // Not JSON, use response text if available
                            if (responseText) {
                                errorMessage += ` | Response: ${responseText.substring(0, 500)}`
                            }
                        }
                        throw new Error(`Gaia router failed: ${errorMessage}`)
                    }

                    // Parse successful response
                    try {
                        gaiaResult = JSON.parse(responseText)
                    } catch (parseError) {
                        throw new Error(`Failed to parse Gaia response: ${responseText.substring(0, 200)}`)
                    }
                    
                    // Check if Gaia actually succeeded
                    if (gaiaResult.success === false || !gaiaResult.success) {
                        const errorMsg = gaiaResult.error || 
                            gaiaResult.execution_result?.error || 
                            gaiaResult.execution_result?.error_message ||
                            'Gaia router returned success: false'
                        throw new Error(`Gaia execution failed: ${errorMsg}`)
                    }
                } catch (fetchError: any) {
                    // Re-throw with more context
                    const errorMsg = fetchError.message || 'Unknown error calling Gaia router'
                    throw new Error(`Gaia router error: ${errorMsg} | Task: ${task.task_type} | Agent: ${task.agent_slug_candidate}`)
                }

                // Find the usage_log_id from the agent execution
                // Agents log their own execution, so we need to find the latest agent execution log
                // (not the routing log, which has agent_id = null)
                // Wait a bit for the agent to finish logging
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const { data: usageLogs } = await supabase
                    .from('agent_usage_logs')
                    .select('id, agent_id, task_type')
                    .eq('user_id', userId)
                    .not('agent_id', 'is', null) // Only agent execution logs, not routing logs
                    .eq('task_type', task.task_type) // Match the task type
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                // Trigger validation if usage log exists
                let validationEventId = null
                if (usageLogs && gaiaResult.execution_result) {
                    // Get the agent that was executed
                    const executedAgentSlug = gaiaResult.routes?.[0]?.agent_slug
                    
                    console.log(`[Synthetic Task ${task.id}] Checking validation:`, {
                        has_usage_log: !!usageLogs,
                        has_execution_result: !!gaiaResult.execution_result,
                        executed_agent: executedAgentSlug
                    })
                    
                    if (executedAgentSlug && executedAgentSlug !== 'validator') {
                        try {
                            console.log(`[Synthetic Task ${task.id}] Calling validator agent for ${executedAgentSlug}`)
                            
                            // Call validator agent
                            const validatorResponse = await fetch(
                                `${supabaseUrl}/functions/v1/validator-agent`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${serviceKey}`,
                                        'Content-Type': 'application/json',
                                        'apikey': serviceKey
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
                                console.log(`[Synthetic Task ${task.id}] Validator response:`, validatorResult)
                                
                                // Check storage status from validator response
                                if (validatorResult.storage) {
                                    if (validatorResult.storage.success) {
                                        console.log(`[Synthetic Task ${task.id}] ✅ Validator confirmed storage successful`)
                                    } else if (validatorResult.storage.error) {
                                        console.error(`[Synthetic Task ${task.id}] ❌ Validator storage failed:`, validatorResult.storage.error)
                                    } else {
                                        console.warn(`[Synthetic Task ${task.id}] ⚠️ Validator storage status unknown`)
                                    }
                                }
                                
                                // Validation event is stored by the validator agent
                                // Wait a bit for the insert to complete, then fetch
                                await new Promise(resolve => setTimeout(resolve, 1000)) // Increased wait time
                                
                                // Try to find the validation event
                                const { data: validationEvents, error: validationError } = await supabase
                                    .from('agent_validation_events')
                                    .select('id, usage_log_id, created_at, score, label')
                                    .eq('usage_log_id', usageLogs.id)
                                    .order('created_at', { ascending: false })
                                    .limit(1)
                                    .maybeSingle()
                                
                                if (validationError) {
                                    console.error(`[Synthetic Task ${task.id}] Error fetching validation event:`, validationError)
                                    // Try to find by checking all recent validation events
                                    const { data: allRecent } = await supabase
                                        .from('agent_validation_events')
                                        .select('id, usage_log_id, created_at')
                                        .order('created_at', { ascending: false })
                                        .limit(5)
                                    console.log(`[Synthetic Task ${task.id}] Recent validation events:`, allRecent)
                                }
                                
                                if (validationEvents) {
                                    validationEventId = validationEvents.id
                                    console.log(`[Synthetic Task ${task.id}] ✅ Validation event found:`, {
                                        id: validationEvents.id,
                                        usage_log_id: validationEvents.usage_log_id,
                                        score: validationEvents.score,
                                        label: validationEvents.label
                                    })
                                } else {
                                    console.warn(`[Synthetic Task ${task.id}] ⚠️ No validation event found after validator call`)
                                    console.warn(`[Synthetic Task ${task.id}] Usage log ID was: ${usageLogs.id}`)
                                    if (validatorResult.storage?.error) {
                                        console.error(`[Synthetic Task ${task.id}] Storage error details:`, validatorResult.storage.error)
                                    }
                                    // Check if validator actually stored it by querying without usage_log_id filter
                                    const { data: recentValidations } = await supabase
                                        .from('agent_validation_events')
                                        .select('id, usage_log_id, created_at')
                                        .order('created_at', { ascending: false })
                                        .limit(3)
                                    console.log(`[Synthetic Task ${task.id}] Most recent validation events (any usage_log_id):`, recentValidations)
                                }
                            } else {
                                const errorText = await validatorResponse.text()
                                console.error(`[Synthetic Task ${task.id}] Validator agent failed:`, validatorResponse.status, errorText)
                            }
                        } catch (validatorError: any) {
                            console.error(`[Synthetic Task ${task.id}] Error calling validator:`, validatorError)
                            // Don't fail the task if validation fails
                        }
                    } else {
                        console.log(`[Synthetic Task ${task.id}] Skipping validation: agent is ${executedAgentSlug || 'unknown'}`)
                    }
                } else {
                    console.log(`[Synthetic Task ${task.id}] Skipping validation:`, {
                        has_usage_log: !!usageLogs,
                        has_execution_result: !!gaiaResult.execution_result
                    })
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
                const errorMessage = error.message || 'Unknown error'
                
                // Update task status to FAILED with error details
                await supabase
                    .from('synthetic_tasks')
                    .update({
                        status: 'FAILED',
                        error_message: errorMessage,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', task.id)

                results.push({
                    task_id: task.id,
                    success: false,
                    error: errorMessage,
                    task_type: task.task_spec_json?.type,
                    agent_slug: task.agent_slug_candidate
                })
            }
        }

        const successCount = results.filter(r => r.success).length
        const failureCount = results.filter(r => !r.success).length
        
        return NextResponse.json({
            success: true,
            executed: results.length,
            success_count: successCount,
            failure_count: failureCount,
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

