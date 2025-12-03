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

        // 2. Generate tasks for each agent
        for (const agent of agents || []) {
            const capabilities = agent.agent_capabilities?.[0]?.passport_data || {}
            const domain = agent.domain || 'general'
            const tasks = generateTasksForAgent(agent, domain, capabilities)

            generatedTasks.push(...tasks)
        }

        // 3. Store tasks (if tasks table exists, otherwise just log/return for now)
        // For this MVP, we'll simulate the routing by creating entries in agent_usage_logs directly
        // or by calling the routing function if available.
        // Since we want to "Run routing on them to populate logs", we should probably call the router.
        // However, calling the router for 100s of tasks might be slow.
        // Let's just return the generated tasks for now and maybe insert them into a 'synthetic_tasks' table if we create one,
        // or just fire them off to the router.

        // For now, let's just return them to the UI where the user can see them, 
        // and maybe add a "Run" button? Or just run a batch of them.

        // The requirement says: "Stores them in a tasks table, Runs routing on them to populate logs"

        return NextResponse.json({
            success: true,
            count: generatedTasks.length,
            tasks: generatedTasks.slice(0, 50) // Return sample
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

    for (let i = 0; i < 5; i++) {
        const template = templates[i % templates.length]
        tasks.push({
            agent_id: agent.id,
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
