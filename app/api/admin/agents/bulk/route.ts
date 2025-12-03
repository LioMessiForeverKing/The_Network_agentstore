import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdminEmail } from '@/lib/admin-server'

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
        const { agents } = body

        if (!Array.isArray(agents) || agents.length === 0) {
            return NextResponse.json(
                { error: 'Invalid payload: agents array is required' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        }

        for (const agentData of agents) {
            try {
                const {
                    name,
                    slug,
                    description,
                    domain,
                    invocation_type,
                    invocation_config,
                    // Passport fields
                    type = 'tool',
                    capabilities = [],
                    supported_task_types = [],
                    input_schema = {},
                    output_schema = {},
                    risk_level = 'low',
                    cost_level = 'cheap',
                    latency_target_ms = 500
                } = agentData

                if (!name || !slug || !invocation_type) {
                    results.failed++
                    results.errors.push(`Agent ${name || 'unknown'}: Missing required fields`)
                    continue
                }

                // Check if slug exists
                const { data: existing } = await supabase
                    .from('agents')
                    .select('id')
                    .eq('slug', slug)
                    .single()

                if (existing) {
                    results.failed++
                    results.errors.push(`Agent ${name}: Slug '${slug}' already exists`)
                    continue
                }

                // Create agent
                const { data: agent, error: createError } = await supabase
                    .from('agents')
                    .insert({
                        name,
                        slug,
                        description: description || null,
                        domain: domain || null,
                        status: 'ACTIVE',
                        invocation_type,
                        invocation_config: invocation_config || {}
                    })
                    .select()
                    .single()

                if (createError) {
                    throw createError
                }

                // Create capabilities
                const supportedTaskTypes = domain ? [domain.toUpperCase()] : []
                await supabase
                    .from('agent_capabilities')
                    .insert({
                        agent_id: agent.id,
                        supported_task_types: supportedTaskTypes,
                        passport_data: {
                            type,
                            capabilities: {
                                supported_task_types: supportedTaskTypes.length > 0 ? supportedTaskTypes : supported_task_types,
                                ...capabilities
                            },
                            input_schema,
                            output_schema,
                            risk_level,
                            cost_level,
                            latency_target_ms,
                            constraints: {},
                            required_trust_threshold: 0.5
                        },
                        success_rate: 0,
                        average_latency_ms: 0,
                        total_uses: 0
                    })

                results.success++
            } catch (error: any) {
                results.failed++
                results.errors.push(`Agent ${agentData.name}: ${error.message}`)
            }
        }

        return NextResponse.json(results)

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
