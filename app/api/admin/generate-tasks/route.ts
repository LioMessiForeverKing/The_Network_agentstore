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

        const supabase = createAdminClient()

        // 1. Fetch all active agents
        const { data: agents, error: agentsError } = await supabase
            .from('agents')
            .select('*, agent_capabilities(*)')
            .eq('status', 'ACTIVE')

        if (agentsError) {
            throw new Error(`Error fetching agents: ${agentsError.message}`)
        }

        const generatedTasks = []

        // 2. Generate tasks for each agent (skip validator agent)
        for (const agent of agents || []) {
            if (agent.slug === 'validator') continue; // Skip validator agent
            
            const capabilities = agent.agent_capabilities?.[0]?.passport_data || {}
            const domain = agent.domain || 'general'
            const tasks = generateTasksForAgent(agent, domain, capabilities)

            generatedTasks.push(...tasks)
        }

        // 3. Store tasks in synthetic_tasks table
        const tasksToInsert = generatedTasks.map(task => ({
            agent_slug_candidate: task.agent_slug || 'unknown',
            task_type: task.task_type || 'GENERAL',
            task_spec_json: {
                type: task.task_type || 'GENERAL',
                user_id: '00000000-0000-0000-0000-000000000000', // Placeholder, will be set when running
                stella_handle: '@synthetic.test.network',
                context: task.input || {},
                description: task.description
            },
            expected_shape: capabilities?.output_schema || {},
            status: 'PENDING'
        }))

        const { data: insertedTasks, error: insertError } = await supabase
            .from('synthetic_tasks')
            .insert(tasksToInsert)
            .select()

        if (insertError) {
            throw new Error(`Error storing synthetic tasks: ${insertError.message}`)
        }

        return NextResponse.json({
            success: true,
            count: insertedTasks?.length || 0,
            tasks: insertedTasks || []
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

function generateTasksForAgent(agent: any, domain: string, capabilities: any) {
    const tasks = []
    const templates = getTemplatesForDomain(domain)
    const taskType = agent.domain || 'GENERAL'

    for (let i = 0; i < 5; i++) {
        const template = templates[i % templates.length]
        tasks.push({
            agent_id: agent.id,
            agent_slug: agent.slug,
            task_type: taskType,
            description: template.replace('{{agent_name}}', agent.name),
            input: {
                query: template.replace('{{agent_name}}', agent.name),
                ...capabilities.input_schema?.example || {}
            },
            domain: domain
        })
    }

    return tasks
}

function getTemplatesForDomain(domain: string) {
    const common = [
        "Tell me about {{agent_name}}",
        "What can {{agent_name}} do?",
        "Help me with a task using {{agent_name}}"
    ]

    const domainSpecific: Record<string, string[]> = {
        'event_planning': [
            "Plan a birthday party",
            "Find a venue for a wedding",
            "Suggest catering options",
            "Create a guest list",
            "Draft an invitation"
        ],
        'coding': [
            "Write a python script",
            "Debug this code",
            "Explain this function",
            "Refactor this class",
            "Generate unit tests"
        ],
        'writing': [
            "Write a blog post",
            "Edit this paragraph",
            "Generate a poem",
            "Draft an email",
            "Summarize this text"
        ]
    }

    return [...(domainSpecific[domain] || []), ...common]
}
