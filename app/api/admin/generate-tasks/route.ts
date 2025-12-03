import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdminEmail } from '@/lib/admin-server'
import OpenAI from 'openai'

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

        // 1. Fetch only EXPERIMENTAL agents (skip ACTIVE agents for synthetic testing)
        const { data: agents, error: agentsError } = await supabase
            .from('agents')
            .select('*, agent_capabilities(*)')
            .eq('status', 'EXPERIMENTAL')

        if (agentsError) {
            throw new Error(`Error fetching agents: ${agentsError.message}`)
        }

        if (!agents || agents.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                tasks: [],
                message: 'No EXPERIMENTAL agents found. Synthetic tasks are only generated for agents with EXPERIMENTAL status to avoid testing production (ACTIVE) agents.'
            })
        }

        const generatedTasks = []
        const openaiApiKey = process.env.OPENAI_API_KEY

        console.log(`[Generate Tasks] OpenAI API Key available: ${!!openaiApiKey}`)
        console.log(`[Generate Tasks] Found ${agents.length} EXPERIMENTAL agents for synthetic testing`)

        // 2. Generate tasks for each experimental agent (skip validator agent)
        for (const agent of agents || []) {
            if (agent.slug === 'validator') continue; // Skip validator agent
            
            // Double-check: skip if somehow an ACTIVE agent got through
            if (agent.status === 'ACTIVE') {
                console.log(`[Generate Tasks] Skipping ACTIVE agent: ${agent.slug} (only testing EXPERIMENTAL agents)`)
                continue
            }
            
            console.log(`[Generate Tasks] Processing agent: ${agent.slug} (domain: ${agent.domain})`)
            
            const passportData = agent.agent_capabilities?.[0]?.passport_data || {}
            // supported_task_types can be at passport_data.capabilities.supported_task_types or passport_data.supported_task_types
            let supportedTaskTypes = passportData.capabilities?.supported_task_types || 
                                     passportData.supported_task_types || 
                                     []
            
            // Fallback: if no supported_task_types found, use agent's domain as task type
            if (!supportedTaskTypes || supportedTaskTypes.length === 0) {
                if (agent.domain) {
                    // Use domain as the task type (e.g., "EVENT_PLANNING" -> ["EVENT_PLANNING"])
                    supportedTaskTypes = [agent.domain.toUpperCase()]
                    console.log(`Agent ${agent.slug}: Using domain '${agent.domain}' as task type (no supported_task_types found)`)
                } else {
                    // Debug logging for Prime agent
                    if (agent.slug === 'prime') {
                        console.log('Prime agent debug:', {
                            has_capabilities: !!agent.agent_capabilities?.[0],
                            passport_data_keys: Object.keys(passportData),
                            capabilities: passportData.capabilities,
                            domain: agent.domain,
                            full_passport_data: JSON.stringify(passportData, null, 2)
                        })
                    }
                    console.warn(`Skipping agent ${agent.slug}: no supported_task_types or domain found`)
                    continue
                }
            }
            
            const domain = agent.domain || 'general'
            
            // For Prime agent, ALWAYS generate natural language prompts (use fallback if no API key)
            // Check both lowercase and case-insensitive
            if (agent.slug?.toLowerCase() === 'prime') {
                console.log(`[Generate Tasks] Generating NLP tasks for Prime agent`)
                if (openaiApiKey) {
                    try {
                        const nlpTasks = await generateNaturalLanguageTasksForPrime(agent, openaiApiKey)
                        console.log(`[Generate Tasks] Generated ${nlpTasks.length} NLP tasks for Prime`)
                        generatedTasks.push(...nlpTasks.map(task => ({
                            ...task,
                            capabilities: passportData
                        })))
                    } catch (error: any) {
                        console.error(`[Generate Tasks] Error generating NLP tasks, using fallback:`, error.message)
                        // Fallback to hardcoded prompts
                        const fallbackTasks = getFallbackPrimeTasks(agent)
                        generatedTasks.push(...fallbackTasks.map(task => ({
                            ...task,
                            capabilities: passportData
                        })))
                    }
                } else {
                    console.log(`[Generate Tasks] No OpenAI API key, using fallback prompts for Prime`)
                    // Use fallback prompts if no API key
                    const fallbackTasks = getFallbackPrimeTasks(agent)
                    generatedTasks.push(...fallbackTasks.map(task => ({
                        ...task,
                        capabilities: passportData
                    })))
                }
            } else if (agent.slug?.toLowerCase() === 'atlas' || supportedTaskTypes.includes('GOAL_PLANNING')) {
                // For Atlas agent (goal planning), generate natural language prompts
                console.log(`[Generate Tasks] Generating NLP tasks for Atlas/Goal Planning agent`)
                if (openaiApiKey) {
                    try {
                        const nlpTasks = await generateNaturalLanguageTasksForAtlas(agent, openaiApiKey)
                        console.log(`[Generate Tasks] Generated ${nlpTasks.length} NLP tasks for Atlas`)
                        generatedTasks.push(...nlpTasks.map(task => ({
                            ...task,
                            capabilities: passportData
                        })))
                    } catch (error: any) {
                        console.error(`[Generate Tasks] Error generating NLP tasks for Atlas, using fallback:`, error.message)
                        const fallbackTasks = getFallbackAtlasTasks(agent)
                        generatedTasks.push(...fallbackTasks.map(task => ({
                            ...task,
                            capabilities: passportData
                        })))
                    }
                } else {
                    console.log(`[Generate Tasks] No OpenAI API key, using fallback prompts for Atlas`)
                    const fallbackTasks = getFallbackAtlasTasks(agent)
                    generatedTasks.push(...fallbackTasks.map(task => ({
                        ...task,
                        capabilities: passportData
                    })))
                }
            } else {
                // For other agents, use structured tasks
                console.log(`[Generate Tasks] Generating structured tasks for ${agent.slug}`)
                const tasks = generateTasksForAgent(agent, domain, passportData)
                generatedTasks.push(...tasks.map(task => ({
                    ...task,
                    capabilities: passportData
                })))
            }
        }

        // 3. Store tasks in synthetic_tasks table using STANDARD FORMAT
        const tasksToInsert = generatedTasks.map(task => {
            // Use STANDARD TASK SPEC FORMAT (Stella's format)
            // Gaia will transform this to agent-specific format based on agent passport
            const naturalLanguageMessage = task.natural_language_message || task.description || ''
            
            // Standard task spec format
            const standardTaskSpec = {
                type: task.task_type || 'GENERAL',
                user_id: '00000000-0000-0000-0000-000000000000', // Placeholder, will be set when running
                stella_handle: '@synthetic.test.network',
                raw_message: naturalLanguageMessage,  // Original user message
                intent: task.task_type === 'EVENT_PLANNING' ? 'create_event' : 
                        task.task_type === 'GOAL_PLANNING' ? 'create_goal' : 'general_task',
                extracted_entities: task.input?.extracted_entities || {},  // Optional: basic extraction
                context: {
                    // Additional context if needed
                    auto_invite: task.auto_invite || false
                },
                source: 'synthetic' as const,
                requires_confirmation: false,
                urgency: 'normal' as const
            }
            
            console.log(`[Generate Tasks] Creating standard format task: "${naturalLanguageMessage.substring(0, 50)}..."`)
            
            return {
                agent_slug_candidate: task.agent_slug || 'unknown',
                task_type: task.task_type || 'GENERAL',
                task_spec_json: standardTaskSpec,  // Standard format - Gaia will transform
                expected_shape: task.capabilities?.capabilities?.output_schema || 
                               task.capabilities?.output_schema || 
                               {},
                status: 'PENDING'
            }
        })

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

function generateTasksForAgent(agent: any, domain: string, passportData: any) {
    const tasks = []
    const templates = getTemplatesForDomain(domain)
    
    // Get supported task types from passport_data, fallback to domain
    const supportedTaskTypes = passportData.capabilities?.supported_task_types || 
                               passportData.supported_task_types || 
                               []
    const taskType = supportedTaskTypes.length > 0 
        ? supportedTaskTypes[0] 
        : (agent.domain || 'GENERAL')

    for (let i = 0; i < 5; i++) {
        const template = templates[i % templates.length]
        tasks.push({
            agent_id: agent.id,
            agent_slug: agent.slug,
            task_type: taskType,
            description: template.replace('{{agent_name}}', agent.name),
            input: {
                query: template.replace('{{agent_name}}', agent.name),
                ...passportData.capabilities?.input_schema?.example || 
                passportData.input_schema?.example || 
                {}
            },
            domain: domain
        })
    }

    return tasks
}

async function generateNaturalLanguageTasksForPrime(agent: any, openaiApiKey: string) {
    const tasks = []
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Generate diverse, realistic conversational messages that users would send to Stella
    const prompt = `Generate 15 diverse, realistic conversational messages that users would naturally type to Stella (a chat assistant) to schedule events. 
These should sound like real people chatting, not formal requests. Include:
- Casual, conversational tone (like "hey", "can we", "I'm thinking", etc.)
- Natural language patterns people actually use
- Event creation requests with various levels of detail
- Different locations (cities, neighborhoods, specific venues like "chinese restaurant", "coffee shop")
- Various times (specific times, relative times like "next Saturday", "tomorrow evening", "this weekend")
- Different event types (networking, dinner, study session, meetup, brunch, etc.)
- Some with invite requests ("invite 10 people", "find someone from my network", "only invite 5 people")
- Some with specific details, some more casual/vague
- Mix of formal and casual language
- Realistic scenarios (travel plans, spontaneous meetups, planned events)

Examples of good prompts:
- "hey im going to be in sf over next saturday can we book an event for next saturday in a chinese restaurant in sf at 4 pm and only invite 10 people for the event"
- "I'm thinking of hosting a networking dinner next Friday evening in Seattle, maybe around 7pm? Can you find 5 people from my network who might be interested?"
- "can we schedule a coffee meetup this weekend in downtown SF? maybe saturday morning around 10am"

Return a JSON object with a "prompts" array containing the strings. Example format:
{"prompts": ["hey im going to be in sf over next saturday can we book an event for next saturday in a chinese restaurant in sf at 4 pm and only invite 10 people for the event", "I'm thinking of hosting a networking dinner next Friday evening in Seattle, maybe around 7pm?", ...]}`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You generate realistic conversational messages that users would type to Stella (a chat assistant) to schedule events. These should sound natural and casual, like real people chatting. Return only valid JSON with a "prompts" array.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.9,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No content from OpenAI')
        }

        // Parse the response - it might be wrapped in JSON object
        let prompts: string[] = []
        try {
            const parsed = JSON.parse(content)
            // Handle both {prompts: [...]} and direct array
            if (Array.isArray(parsed)) {
                prompts = parsed
            } else if (parsed.prompts && Array.isArray(parsed.prompts)) {
                prompts = parsed.prompts
            } else if (parsed.messages && Array.isArray(parsed.messages)) {
                prompts = parsed.messages
            } else {
                // Try to find any array in the response
                const values = Object.values(parsed)
                const arrayValue = values.find(v => Array.isArray(v)) as string[] | undefined
                if (arrayValue) {
                    prompts = arrayValue
                }
            }
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError)
            // Fallback to hardcoded prompts
            prompts = getFallbackPrimePrompts()
        }

        // Also generate edit and invite prompts
        const editPrompts = await generateEditPrompts(openai)
        const invitePrompts = await generateInvitePrompts(openai)

        // Combine all prompts
        const allPrompts = [...prompts, ...editPrompts, ...invitePrompts]

        // Create tasks from prompts
        for (let i = 0; i < Math.min(allPrompts.length, 15); i++) {
            const message = allPrompts[i]
            const isInvite = message.toLowerCase().includes('invite') || message.toLowerCase().includes('add')
            const isEdit = message.toLowerCase().includes('edit') || message.toLowerCase().includes('change') || message.toLowerCase().includes('update')

            tasks.push({
                agent_id: agent.id,
                agent_slug: agent.slug,
                task_type: 'EVENT_PLANNING',
                description: message,
                natural_language_message: message,
                is_nlp_task: true,
                auto_invite: isInvite,
                input: {
                    message: message
                },
                domain: 'event_planning'
            })
        }

        return tasks
    } catch (error: any) {
        console.error('Error generating natural language tasks:', error)
        // Fallback to hardcoded prompts
        return getFallbackPrimeTasks(agent)
    }
}

async function generateEditPrompts(openai: OpenAI): Promise<string[]> {
    const prompt = `Generate 5 conversational messages users would type to Stella to edit existing events. Make them sound natural and casual. Examples:
- "hey can you change the time of my event to 8pm?"
- "update the location to Seattle please"
- "can we move the event to next Friday instead?"

Return a JSON object with a "prompts" array.`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Generate realistic conversational messages users would type to Stella. Return only valid JSON with a "prompts" array.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        })

        const parsed = JSON.parse(response.choices[0]?.message?.content || '{}')
        return Array.isArray(parsed) ? parsed : (parsed.prompts || parsed.messages || [
            "hey can you change the time of my event to 8pm?",
            "update the location to Seattle please",
            "can we move the event to next Friday instead?"
        ])
    } catch {
        return [
            "hey can you change the time of my event to 8pm?",
            "update the location to Seattle please",
            "can we move the event to next Friday instead?"
        ]
    }
}

async function generateInvitePrompts(openai: OpenAI): Promise<string[]> {
    const prompt = `Generate 5 conversational messages users would type to Stella to invite people to events. Make them sound natural. Examples:
- "hey can you invite someone from my network to the event?"
- "find 3 people who might be interested in this"
- "can we add a friend to my event?"

Return a JSON object with a "prompts" array.`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Generate realistic conversational messages users would type to Stella. Return only valid JSON with a "prompts" array.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        })

        const parsed = JSON.parse(response.choices[0]?.message?.content || '{}')
        return Array.isArray(parsed) ? parsed : (parsed.prompts || parsed.messages || [
            "hey can you invite someone from my network?",
            "find 2 people who might be interested",
            "can we add a friend to the event?"
        ])
    } catch {
        return [
            "hey can you invite someone from my network?",
            "find 2 people who might be interested",
            "can we add a friend to the event?"
        ]
    }
}

function getFallbackPrimePrompts(): string[] {
    return [
        "hey im going to be in sf over next saturday can we book an event for next saturday in a chinese restaurant in sf at 4 pm and only invite 10 people for the event",
        "I'm thinking of hosting a networking dinner next Friday evening in Seattle, maybe around 7pm? Can you find 5 people from my network who might be interested?",
        "can we schedule a coffee meetup this weekend in downtown SF? maybe saturday morning around 10am",
        "hey stella, I want to plan a study session this Friday at 2pm in the library, can you help set that up?",
        "I'm going to be in New York next month, can we create an event for entrepreneurs there? Maybe a networking thing",
        "can we do a happy hour tomorrow at 5pm in downtown Seattle? invite a few people from my network",
        "hey, planning a brunch this Sunday at 11am in San Francisco, want to make it happen?",
        "I'm thinking tech meetup next Tuesday evening in Seattle, can you invite 3 people who might be interested?",
        "let's host a game night this Saturday at 7pm, can you set that up?",
        "hey can we create a networking event in SF next Friday at 6pm? find someone from my network to invite",
        "planning a hiking trip next Saturday morning in the Bay Area, want to make it an event?",
        "can we schedule a workshop next week in Seattle? maybe Wednesday afternoon would work",
        "hey stella, I want to host a dinner party this Friday at 7pm in San Francisco for 8 people, can you help?",
        "can we create a study group session tomorrow at 3pm?",
        "I'm thinking meetup next Saturday evening in Seattle, can you set that up?"
    ]
}

function getFallbackPrimeTasks(agent: any) {
    return getFallbackPrimePrompts().map((message, i) => ({
        agent_id: agent.id,
        agent_slug: agent.slug,
        task_type: 'EVENT_PLANNING',
        description: message,
        natural_language_message: message,
        is_nlp_task: true,
        auto_invite: message.toLowerCase().includes('invite') || message.toLowerCase().includes('find'),
        input: {
            message: message
        },
        domain: 'event_planning'
    }))
}

async function generateNaturalLanguageTasksForAtlas(agent: any, openaiApiKey: string) {
    const tasks = []
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Generate diverse, realistic conversational messages that users would send to Stella for goal planning
    const prompt = `Generate 15 diverse, realistic conversational messages that users would naturally type to Stella (a chat assistant) for goal planning and connecting with people. 
These should sound like real people chatting, not formal requests. Include:
- Casual, conversational tone (like "hey", "I want to", "help me", "can you", etc.)
- Natural language patterns people actually use
- Goal creation requests (starting projects, businesses, creative endeavors)
- Connection requests (finding collaborators, cohosts, partners, mentors)
- Various goal types:
  * Creative projects: podcast, music channel, YouTube channel, blog, newsletter
  * Business goals: startup, side hustle, consulting, freelancing
  * Learning goals: learning a skill, taking a course, finding a mentor
  * Social goals: finding a cohost, connecting with people, building a community
- Mix of specific and vague requests
- Realistic scenarios (people starting new projects, looking for collaborators, seeking help)

Examples of good prompts:
- "I want to create a podcast"
- "Help me start a podcast"
- "I want to create a music channel"
- "Connect me to people who can help with my podcast"
- "Connect me to my cohost"
- "I'm thinking of starting a YouTube channel, can you help me find people to collaborate with?"
- "I want to learn how to code, connect me to people in my network who can help"
- "Help me find a cohost for my podcast about tech"

Return a JSON object with a "prompts" array containing the strings. Example format:
{"prompts": ["I want to create a podcast", "Help me start a podcast", "Connect me to people who can help with my music channel", ...]}`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You generate realistic conversational messages that users would type to Stella (a chat assistant) for goal planning and connecting with people. These should sound natural and casual, like real people chatting. Return only valid JSON with a "prompts" array.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.9,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No content from OpenAI')
        }

        // Parse the response
        let prompts: string[] = []
        try {
            const parsed = JSON.parse(content)
            if (Array.isArray(parsed)) {
                prompts = parsed
            } else if (parsed.prompts && Array.isArray(parsed.prompts)) {
                prompts = parsed.prompts
            } else if (parsed.messages && Array.isArray(parsed.messages)) {
                prompts = parsed.messages
            } else {
                const values = Object.values(parsed)
                const arrayValue = values.find(v => Array.isArray(v)) as string[] | undefined
                if (arrayValue) {
                    prompts = arrayValue
                }
            }
        } catch (parseError) {
            console.error('Error parsing OpenAI response for Atlas:', parseError)
            prompts = getFallbackAtlasPrompts()
        }

        // Create tasks from prompts
        for (let i = 0; i < Math.min(prompts.length, 15); i++) {
            const message = prompts[i]

            tasks.push({
                agent_id: agent.id,
                agent_slug: agent.slug,
                task_type: 'GOAL_PLANNING',
                description: message,
                natural_language_message: message,
                is_nlp_task: true,
                input: {
                    message: message
                },
                domain: 'goal_planning'
            })
        }

        return tasks
    } catch (error: any) {
        console.error('Error generating natural language tasks for Atlas:', error)
        return getFallbackAtlasTasks(agent)
    }
}

function getFallbackAtlasPrompts(): string[] {
    return [
        "I want to create a podcast",
        "Help me start a podcast",
        "I want to create a music channel",
        "Connect me to people who can help with my podcast",
        "Connect me to my cohost",
        "I'm thinking of starting a YouTube channel, can you help me find people to collaborate with?",
        "I want to learn how to code, connect me to people in my network who can help",
        "Help me find a cohost for my podcast about tech",
        "I want to start a newsletter, connect me to people who can help",
        "I'm looking to start a side hustle, can you connect me to mentors?",
        "I want to create a blog about cooking, help me find collaborators",
        "Connect me to people who can help me start my business",
        "I want to learn graphic design, find me people in my network who can teach me",
        "Help me start a consulting business",
        "I want to create a community around sustainable living"
    ]
}

function getFallbackAtlasTasks(agent: any) {
    const fallbackPrompts = getFallbackAtlasPrompts()
    return fallbackPrompts.map((message) => ({
        agent_id: agent.id,
        agent_slug: agent.slug,
        task_type: 'GOAL_PLANNING',
        description: message,
        natural_language_message: message,
        is_nlp_task: true,
        input: {
            message: message
        },
        domain: 'goal_planning'
    }))
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
