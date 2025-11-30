import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdminEmail } from '@/lib/admin-server'
import { promises as fs } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const { data: { user } } = await getCurrentUser()
    
    if (!isAdminEmail(user?.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('name')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const {
      name,
      slug,
      description,
      domain,
      invocation_type,
      invocation_config,
      create_edge_function = true // Default to true for INTERNAL_FUNCTION
    } = body

    if (!name || !slug || !invocation_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, invocation_type' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Agent with this slug already exists' },
        { status: 400 }
      )
    }

    // Create agent
    const { data: agent, error } = await supabase
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

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Create default capabilities entry with proper passport_data structure
    const supportedTaskTypes = domain ? [domain.toUpperCase()] : []
    await supabase
      .from('agent_capabilities')
      .insert({
        agent_id: agent.id,
        supported_task_types: supportedTaskTypes,
        passport_data: {
          capabilities: {
            supported_task_types: supportedTaskTypes
          },
          constraints: {},
          required_trust_threshold: 0.5
        },
        success_rate: 0,
        average_latency_ms: 0,
        total_uses: 0
      })

    // Automatically create edge function if it's an INTERNAL_FUNCTION and create_edge_function is true
    let edgeFunctionCreated = false
    let edgeFunctionPath = null
    let edgeFunctionError = null

    if (invocation_type === 'INTERNAL_FUNCTION' && create_edge_function && invocation_config?.function_name) {
      try {
        const functionName = invocation_config.function_name
        
        // Validate function name
        if (!/^[a-z0-9-]+$/.test(functionName)) {
          edgeFunctionError = 'Function name must be lowercase alphanumeric with hyphens only'
        } else {
          // Create function directory and file
          const functionDir = join(process.cwd(), 'supabase', 'functions', functionName)
          const functionFile = join(functionDir, 'index.ts')
          
          // Create directory if it doesn't exist
          await fs.mkdir(functionDir, { recursive: true })
          
          // Generate function code
          const functionCode = generateEdgeFunctionCode(name, functionName, domain)
          
          // Write the function file
          await fs.writeFile(functionFile, functionCode, 'utf-8')
          
          edgeFunctionCreated = true
          edgeFunctionPath = `supabase/functions/${functionName}/index.ts`
        }
      } catch (error: any) {
        edgeFunctionError = error.message
        console.error('Error creating edge function:', error)
      }
    }

    return NextResponse.json({
      ...agent,
      edge_function: edgeFunctionCreated ? {
        created: true,
        path: edgeFunctionPath,
        deploy_command: `supabase functions deploy ${invocation_config?.function_name}`
      } : edgeFunctionError ? {
        created: false,
        error: edgeFunctionError
      } : {
        created: false,
        skipped: invocation_type !== 'INTERNAL_FUNCTION' ? 'Not an internal function' : 'create_edge_function was false'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateEdgeFunctionCode(agentName: string, functionName: string, domain: string | null): string {
  const taskType = domain ? domain.toUpperCase() : 'TASK'
  
  return `// Supabase Edge Function: ${functionName}
// Agent: ${agentName}
// Task Type: ${taskType}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase clients
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Authenticate user (if Authorization header provided)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey');
    
    // Check if this is a service key (internal call from Gaia router)
    const isServiceKey = apiKey === SUPABASE_SERVICE_ROLE_KEY || 
                        (authHeader && authHeader.replace('Bearer ', '') === SUPABASE_SERVICE_ROLE_KEY);
    
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

    // Parse request body
    const body = await req.json();
    const taskSpec = body.task_spec || body;

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
      taskSpec.stella_handle = \`@user.\${taskSpec.user_id.slice(0, 8)}.network\`;
    }

    // ============================================
    // YOUR AGENT LOGIC STARTS HERE
    // ============================================
    
    console.log('${agentName} agent execution started:', {
      type: taskSpec.type,
      user_id: taskSpec.user_id,
      context: taskSpec.context
    });

    // TODO: Implement your agent logic here
    // Example:
    // const result = await processTask(serviceClient, taskSpec);
    
    const result = {
      success: true,
      message: '${agentName} executed successfully',
      data: taskSpec.context
    };

    // ============================================
    // YOUR AGENT LOGIC ENDS HERE
    // ============================================

    console.log('${agentName} agent execution finished:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in ${functionName}:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
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
`
}

