// Supabase Edge Function: gaia-router
// - Routes tasks from Stella to appropriate specialist agents
// - Analyzes task specs, checks agent capabilities, orchestrates execution
// - Logs all routing decisions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TaskSpec {
  type: string
  user_id: string
  stella_handle: string
  context: any
  urgency?: string
  source?: string
  requires_confirmation?: boolean
}

interface RoutingDecision {
  agent_id: string
  agent_slug: string
  agent_name: string
  priority: number
  role: 'primary' | 'secondary'
  invocation_config: any
  confidence: number
  reasoning: string[]
}

interface RoutingResult {
  success: boolean
  routes: RoutingDecision[]
  execution_result?: any
  error?: string
}

/**
 * Get user's agent passport (Stella's passport)
 */
async function getUserPassport(
  supabase: any,
  userId: string,
  stellaHandle: string
): Promise<any> {
  try {
    const { data: passport } = await supabase
      .from('agent_passports')
      .select('*')
      .eq('user_id', userId)
      .eq('handle_id', stellaHandle)
      .single()
    
    return passport || null
  } catch (error) {
    console.error('Error fetching user passport:', error)
    return null
  }
}

/**
 * Find agents that can handle the task type
 */
async function findCandidateAgents(
  supabase: any,
  taskType: string
): Promise<any[]> {
  try {
    // Query agents first - make sure to get invocation_config
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, slug, domain, description, invocation_type, invocation_config, status, version')
      .eq('status', 'ACTIVE')
      .order('name')
    
    if (agentsError) {
      console.error('Error fetching agents:', agentsError)
      return []
    }
    
    if (!agents || agents.length === 0) {
      console.log('No active agents found')
      return []
    }
    
    console.log(`Found ${agents.length} active agents`)
    
    // Query capabilities separately and join manually
    const agentIds = agents.map((a: any) => a.id)
    const { data: capabilities, error: capsError } = await supabase
      .from('agent_capabilities')
      .select('*')
      .in('agent_id', agentIds)
    
    if (capsError) {
      console.error('Error fetching capabilities:', capsError)
    }
    
    // Join capabilities to agents
    const agentsWithCaps = agents.map((agent: any) => {
      const agentCaps = capabilities?.filter((cap: any) => cap.agent_id === agent.id) || []
      return {
        ...agent,
        agent_capabilities: agentCaps
      }
    })
    
    console.log(`Active agents with capabilities:`, agentsWithCaps.map((a: any) => ({ 
      slug: a.slug, 
      status: a.status,
      has_capabilities: !!a.agent_capabilities?.[0],
      capabilities_count: a.agent_capabilities?.length || 0
    })))
    
    // Debug: Check Prime specifically
    const primeAgent = agentsWithCaps.find((a: any) => a.slug === 'prime')
    if (primeAgent) {
      console.log(`Prime agent check:`, {
        id: primeAgent.id,
        name: primeAgent.name,
        slug: primeAgent.slug,
        domain: primeAgent.domain,
        has_capabilities: !!primeAgent.agent_capabilities?.[0],
        capabilities_count: primeAgent.agent_capabilities?.length || 0,
        capabilities_data: primeAgent.agent_capabilities?.[0]?.passport_data
      })
    } else {
      console.log('Prime agent not found in results')
    }
    
    // Filter agents that support this task type
    const candidates = agentsWithCaps.filter((agent: any) => {
      const capabilities = agent.agent_capabilities?.[0]
      if (!capabilities) {
        console.log(`Agent ${agent.slug} has no capabilities`)
        return false
      }
      
      // Check supported_task_types from multiple sources:
      // 1. Direct column in agent_capabilities table
      // 2. passport_data.capabilities.supported_task_types
      // 3. passport_data.supported_task_types
      const directTypes = capabilities.supported_task_types || []
      const passportData = capabilities.passport_data || {}
      const passportTypes = 
        passportData.capabilities?.supported_task_types || 
        passportData.supported_task_types || 
        []
      
      // Combine all sources (remove duplicates)
      const supportedTypes = [...new Set([...directTypes, ...passportTypes])]
      
      console.log(`Agent ${agent.slug} supports:`, supportedTypes, `Looking for: ${taskType}`)
      
      const matches = supportedTypes.includes(taskType)
      if (!matches && agent.slug === 'prime') {
        console.log(`Prime agent full passport_data:`, JSON.stringify(passportData, null, 2))
        console.log(`Prime agent capabilities structure:`, Object.keys(passportData))
        console.log(`Prime agent direct supported_task_types:`, directTypes)
      }
      
      return matches
    })
    
    // Sort by success rate and latency
    candidates.sort((a: any, b: any) => {
      const aCap = a.agent_capabilities?.[0]
      const bCap = b.agent_capabilities?.[0]
      
      const aScore = (aCap?.success_rate || 0) * 100 - (aCap?.average_latency_ms || 1000) / 100
      const bScore = (bCap?.success_rate || 0) * 100 - (bCap?.average_latency_ms || 1000) / 100
      
      return bScore - aScore
    })
    
    return candidates
  } catch (error) {
    console.error('Error in findCandidateAgents:', error)
    return []
  }
}

/**
 * Route task to appropriate agent(s)
 */
async function routeTask(
  supabase: any,
  taskSpec: TaskSpec,
  userPassport: any
): Promise<RoutingDecision[]> {
  const routes: RoutingDecision[] = []
  const reasoning: string[] = []
  
  // Find candidate agents
  const candidates = await findCandidateAgents(supabase, taskSpec.type)
  
  if (candidates.length === 0) {
    // Log for debugging
    console.log(`No candidates found for task type: ${taskSpec.type}`)
    const allAgents = await supabase.from('agents').select('slug, status').eq('status', 'ACTIVE')
    console.log(`Active agents:`, allAgents.data)
    
    reasoning.push(`No agents found that support this task type: ${taskSpec.type}`)
    return []
  }
  
  // For now, use the first (best) candidate as primary agent
  const primaryAgent = candidates[0]
  const primaryCapabilities = primaryAgent.agent_capabilities?.[0]
  
  reasoning.push(`Found ${candidates.length} candidate agent(s)`)
  reasoning.push(`Selected ${primaryAgent.name} as primary agent (success rate: ${((primaryCapabilities?.success_rate || 0) * 100).toFixed(1)}%)`)
  
  // Check constraints
  const constraints = primaryCapabilities?.passport_data?.constraints || {}
  if (taskSpec.context?.event_details?.max_attendees) {
    const maxAllowed = constraints.max_attendees || 50
    if (taskSpec.context.event_details.max_attendees > maxAllowed) {
      reasoning.push(`Warning: max_attendees (${taskSpec.context.event_details.max_attendees}) exceeds agent limit (${maxAllowed})`)
    }
  }
  
  // Create routing decision
  console.log(`Primary agent data:`, {
    id: primaryAgent.id,
    slug: primaryAgent.slug,
    name: primaryAgent.name,
    invocation_type: primaryAgent.invocation_type,
    invocation_config: primaryAgent.invocation_config,
    has_invocation_config: !!primaryAgent.invocation_config
  })
  
  const invocationConfig = primaryAgent.invocation_config
  
  if (!invocationConfig) {
    reasoning.push(`ERROR: Agent ${primaryAgent.slug} has no invocation_config`)
    console.error(`Agent ${primaryAgent.slug} missing invocation_config. Full agent data:`, JSON.stringify(primaryAgent, null, 2))
    return []
  }
  
  // invocation_type is a separate column, not in invocation_config
  // Add it to the config for the executeAgent function
  const fullConfig = {
    invocation_type: primaryAgent.invocation_type || 'INTERNAL_FUNCTION',
    ...invocationConfig
  }
  
  if (!fullConfig.invocation_type) {
    reasoning.push(`ERROR: Agent ${primaryAgent.slug} missing invocation_type`)
    console.error(`Agent ${primaryAgent.slug} missing invocation_type. Full agent data:`, JSON.stringify(primaryAgent, null, 2))
    return []
  }
  
  console.log(`Routing to ${primaryAgent.name} with config:`, JSON.stringify(fullConfig, null, 2))
  
  routes.push({
    agent_id: primaryAgent.id,
    agent_slug: primaryAgent.slug,
    agent_name: primaryAgent.name,
    priority: 1,
    role: 'primary',
    invocation_config: fullConfig,
    confidence: primaryCapabilities?.success_rate || 0.5,
    reasoning: reasoning
  })
  
  return routes
}

/**
 * Execute agent based on routing decision
 */
async function executeAgent(
  supabase: any,
  route: RoutingDecision,
  taskSpec: TaskSpec
): Promise<any> {
  try {
    const config = route.invocation_config
    
    if (!config) {
      throw new Error(`Agent ${route.agent_slug} has no invocation_config`)
    }
    
    console.log(`Executing agent ${route.agent_slug} with config:`, JSON.stringify(config, null, 2))
    
    if (config.invocation_type === 'INTERNAL_FUNCTION') {
      // Call Supabase Edge Function
      // Make sure function_name matches the deployed function name exactly
      const functionName = config.function_name || 'prime-agent'
      const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`
      console.log(`Calling agent function: ${functionUrl}`)
      
      const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      const response = await fetch(functionUrl, {
        method: config.method || 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY // Also pass as apikey for Supabase edge function auth
        },
        body: JSON.stringify({
          task_spec: taskSpec
        })
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Agent execution failed: ${error}`)
      }
      
      return await response.json()
    } else if (config.invocation_type === 'HTTP_ENDPOINT') {
      // Call external HTTP endpoint
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {})
        },
        body: JSON.stringify({
          task_spec: taskSpec
        })
      })
      
      if (!response.ok) {
        throw new Error(`External agent execution failed: ${response.statusText}`)
      }
      
      return await response.json()
    } else {
      throw new Error(`Unknown invocation type: ${config.invocation_type}`)
    }
  } catch (error: any) {
    console.error('Error executing agent:', error)
    throw error
  }
}

/**
 * Log routing decision
 */
async function logRouting(
  supabase: any,
  taskSpec: TaskSpec,
  routes: RoutingDecision[],
  result: any,
  latencyMs: number
): Promise<void> {
  try {
    await supabase
      .from('agent_usage_logs')
      .insert({
        stella_handle: taskSpec.stella_handle,
        agent_id: null, // Gaia is not an agent, it's the router
        user_id: taskSpec.user_id,
        task_type: 'ROUTING',
        task_description: `Gaia routing: ${taskSpec.type}`,
        full_context_json: taskSpec,
        input_json: { task_spec: taskSpec, routes },
        output_json: result,
        success_flag: result.success !== false,
        latency_ms: latencyMs,
        task_steps: routes.map(r => `routed_to_${r.agent_slug}`),
        error_message: result.error || null
      })
  } catch (error) {
    console.error('Error logging routing:', error)
    // Don't throw - logging failure shouldn't break the request
  }
}

// Main Edge Function Handler
Deno.serve(async (req) => {
  try {
    console.log(`Gaia router called: ${req.method} ${new URL(req.url).pathname}`);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
    
    // Authenticate user (if Authorization header provided)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey');
    
    // Check if this is a service key (internal call from another edge function)
    const isServiceKey = apiKey === SUPABASE_SERVICE_ROLE_KEY || 
                        (authHeader && authHeader.includes(SUPABASE_SERVICE_ROLE_KEY));
    
    if (authHeader && !isServiceKey) {
      // Try to authenticate user with their token
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      });
      
      const { data: { user }, error: authError } = await anonClient.auth.getUser();
      
      if (!authError && user) {
        userId = user.id;
      }
    }
    
    // If service key is used, we'll rely on user_id in task_spec
    // No need to reject if no user auth - we'll check task_spec.user_id later

    // Parse request body
    const body = await req.json();
    const taskSpec: TaskSpec = body.task_spec || body;
    const userPassport = body.user_passport || null;

    // Validate required fields
    if (!taskSpec.type || !taskSpec.user_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid task spec: type and user_id are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set user_id if not provided (use authenticated user)
    if (!taskSpec.user_id && userId) {
      taskSpec.user_id = userId;
    }

    if (!taskSpec.user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set stella_handle if not provided
    if (!taskSpec.stella_handle) {
      taskSpec.stella_handle = `@user.${taskSpec.user_id.slice(0, 8)}.network`;
    }

    const startTime = Date.now();

    // Get user passport if not provided
    let passport = userPassport;
    if (!passport) {
      passport = await getUserPassport(serviceClient, taskSpec.user_id, taskSpec.stella_handle);
    }

    // Route task
    console.log(`Routing task type: ${taskSpec.type}, user_id: ${taskSpec.user_id}`)
    const routes = await routeTask(serviceClient, taskSpec, passport);

    if (routes.length === 0) {
      // Additional debugging
      const allAgentsCheck = await serviceClient
        .from('agents')
        .select('slug, status')
        .eq('status', 'ACTIVE')
      console.log('Available agents:', allAgentsCheck.data)
      
      const primeCheck = await serviceClient
        .from('agents')
        .select(`
          *,
          agent_capabilities (
            passport_data
          )
        `)
        .eq('slug', 'prime')
        .single()
      console.log('Prime agent check:', primeCheck.data)
      
      return new Response(
        JSON.stringify({
          success: false,
          routes: [],
          error: `No suitable agent found for this task type: ${taskSpec.type}`,
          debug: {
            task_type: taskSpec.type,
            available_agents: allAgentsCheck.data?.map((a: any) => a.slug) || [],
            prime_exists: !!primeCheck.data
          }
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Execute primary agent
    const primaryRoute = routes.find(r => r.role === 'primary');
    if (!primaryRoute) {
      return new Response(
        JSON.stringify({
          success: false,
          routes,
          error: 'No primary agent found in routes'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const executionResult = await executeAgent(serviceClient, primaryRoute, taskSpec);
    const latencyMs = Date.now() - startTime;

    const result: RoutingResult = {
      success: executionResult.success !== false,
      routes,
      execution_result: executionResult
    };

    // Log routing decision
    await logRouting(serviceClient, taskSpec, routes, result, latencyMs);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in Gaia router:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

