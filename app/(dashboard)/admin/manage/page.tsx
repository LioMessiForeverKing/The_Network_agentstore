'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { isAdmin } from '@/lib/admin'
import Button from '@/components/Button'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/themes/prism-tomorrow.css'

interface Agent {
    id: string
    name: string
    slug: string
    description: string | null
    domain: string | null
    status: string
    invocation_type: string | null
    invocation_config: any
}

export default function AdminManagePage() {
    const router = useRouter()
    const [isAdminUser, setIsAdminUser] = useState(false)
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [showAgentForm, setShowAgentForm] = useState(false)
    const [showEdgeFunctionForm, setShowEdgeFunctionForm] = useState(false)
    const [showBulkForm, setShowBulkForm] = useState(false)
    const [bulkJson, setBulkJson] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        domain: '',
        invocation_type: 'INTERNAL_FUNCTION',
        function_name: '',
        endpoint: '',
        method: 'POST',
        create_edge_function: true,
        code: '',
        language: 'typescript', // New field for language selection
        // New fields
        type: 'tool',
        risk_level: 'low',
        cost_level: 'cheap',
        latency_target_ms: 500,
        input_schema: '{}',
        output_schema: '{}'
    })

    useEffect(() => {
        setIsAdminUser(isAdmin())
        if (isAdmin()) {
            fetchAgents()
        } else {
            router.push('/agents')
        }
    }, [router])

    // Auto-generate code template when function name, domain, or language changes
    useEffect(() => {
        if (showEdgeFunctionForm && formData.function_name) {
            if (!formData.code) {
                setFormData(prev => ({
                    ...prev,
                    code: generateDefaultCode(prev.function_name, prev.language)
                }))
            }
        }
    }, [formData.function_name, formData.language, showEdgeFunctionForm])

    useEffect(() => {
        if (showAgentForm && formData.create_edge_function && formData.function_name) {
            if (!formData.code) {
                setFormData(prev => ({
                    ...prev,
                    code: generateAgentFunctionCode(prev.name, prev.function_name, prev.domain, prev.language)
                }))
            }
        }
    }, [formData.function_name, formData.name, formData.domain, formData.language, showAgentForm, formData.create_edge_function])

    async function fetchAgents() {
        try {
            const response = await fetch('/api/admin/agents')
            if (response.ok) {
                const data = await response.json()
                setAgents(data)
            }
        } catch (error) {
            console.error('Error fetching agents:', error)
        } finally {
            setLoading(false)
        }
    }

    function generateDefaultCode(functionName: string, language: string): string {
        const isTypeScript = language === 'typescript'
        const fileExt = isTypeScript ? 'ts' : 'js'
        const typeAnnotations = isTypeScript ? ': string' : ''

        return `// Supabase Edge Function: ${functionName}
// Language: ${language === 'typescript' ? 'TypeScript' : 'JavaScript'}
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL${typeAnnotations} = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY${typeAnnotations} = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Your function logic here
    const body = await req.json();
    
    return new Response(
      JSON.stringify({ success: true, message: 'Function executed successfully', data: body }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error${isTypeScript ? ': any' : ''}) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
`
    }

    function generateAgentFunctionCode(agentName: string, functionName: string, domain: string | null, language: string): string {
        const taskType = domain ? domain.toUpperCase() : 'TASK'
        const isTypeScript = language === 'typescript'
        const typeAnnotations = isTypeScript ? ': string' : ''
        const nullableType = isTypeScript ? ': string | null' : ''

        return `// Supabase Edge Function: ${functionName}
// Agent: ${agentName}
// Task Type: ${taskType}
// Language: ${language === 'typescript' ? 'TypeScript' : 'JavaScript'}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL${typeAnnotations} = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY${typeAnnotations} = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY${typeAnnotations} = Deno.env.get('SUPABASE_ANON_KEY');
    
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
    let userId${nullableType} = null;
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
  } catch (error${isTypeScript ? ': any' : ''}) {
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

    async function handleCreateAgent(e: React.FormEvent) {
        e.preventDefault()
        try {
            const response = await fetch('/api/admin/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                    domain: formData.domain,
                    invocation_type: formData.invocation_type,
                    invocation_config: {
                        method: formData.method,
                        endpoint: formData.endpoint,
                        function_name: formData.function_name
                    },
                    create_edge_function: formData.create_edge_function && formData.invocation_type === 'INTERNAL_FUNCTION',
                    code: formData.code,
                    // New passport fields
                    type: formData.type,
                    risk_level: formData.risk_level,
                    cost_level: formData.cost_level,
                    latency_target_ms: Number(formData.latency_target_ms),
                    input_schema: JSON.parse(formData.input_schema || '{}'),
                    output_schema: JSON.parse(formData.output_schema || '{}')
                })
            })

            if (response.ok) {
                const result = await response.json()
                let message = 'Agent created successfully!'

                if (result.edge_function?.created) {
                    message += `\n\n✅ Edge function created at:\n${result.edge_function.path}\n\nDeploy with:\n${result.edge_function.deploy_command}`
                } else if (result.edge_function?.error) {
                    message += `\n\n⚠️ Agent created but edge function failed:\n${result.edge_function.error}`
                } else if (result.edge_function?.skipped) {
                    message += `\n\nℹ️ Edge function skipped: ${result.edge_function.skipped}`
                }

                alert(message)
                setShowAgentForm(false)
                setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    domain: '',
                    invocation_type: 'INTERNAL_FUNCTION',
                    function_name: '',
                    endpoint: '',
                    method: 'POST',
                    create_edge_function: true,
                    code: '',
                    language: 'typescript',
                    type: 'tool',
                    risk_level: 'low',
                    cost_level: 'cheap',
                    latency_target_ms: 500,
                    input_schema: '{}',
                    output_schema: '{}'
                })
                fetchAgents()
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to create agent'}`)
            }
        } catch (error) {
            console.error('Error creating agent:', error)
            alert('Failed to create agent')
        }
    }

    async function handleCreateEdgeFunction(e: React.FormEvent) {
        e.preventDefault()
        try {
            const response = await fetch('/api/admin/edge-functions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function_name: formData.function_name,
                    code: formData.code
                })
            })

            if (response.ok) {
                alert('Edge function created successfully! You can now deploy it using Supabase CLI.')
                setShowEdgeFunctionForm(false)
                setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    domain: '',
                    invocation_type: 'INTERNAL_FUNCTION',
                    function_name: '',
                    endpoint: '',
                    method: 'POST',
                    create_edge_function: true,
                    code: '',
                    language: 'typescript',
                    type: 'tool',
                    risk_level: 'low',
                    cost_level: 'cheap',
                    latency_target_ms: 500,
                    input_schema: '{}',
                    output_schema: '{}'
                })
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to create edge function'}`)
            }
        } catch (error) {
            console.error('Error creating edge function:', error)
            alert('Failed to create edge function')
        }
    }

    async function handleBulkCreate(e: React.FormEvent) {
        e.preventDefault()
        try {
            let agents
            try {
                agents = JSON.parse(bulkJson)
            } catch (err) {
                alert('Invalid JSON format')
                return
            }

            if (!Array.isArray(agents)) {
                alert('JSON must be an array of agent objects')
                return
            }

            setLoading(true)
            const response = await fetch('/api/admin/agents/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agents })
            })

            const result = await response.json()

            if (response.ok) {
                let message = `Bulk creation complete!\nSuccess: ${result.success}\nFailed: ${result.failed}`
                if (result.errors.length > 0) {
                    message += `\n\nErrors:\n${result.errors.join('\n')}`
                }
                alert(message)
                if (result.success > 0) {
                    setShowBulkForm(false)
                    setBulkJson('')
                    fetchAgents()
                }
            } else {
                alert(`Error: ${result.error || 'Failed to bulk create agents'}`)
            }
        } catch (error) {
            console.error('Error bulk creating agents:', error)
            alert('Failed to bulk create agents')
        } finally {
            setLoading(false)
        }
    }

    async function handleGenerateTasks() {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/generate-tasks', {
                method: 'POST',
            })

            if (response.ok) {
                const result = await response.json()
                alert(`Successfully generated ${result.count} synthetic tasks!`)
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to generate tasks'}`)
            }
        } catch (error) {
            console.error('Error generating tasks:', error)
            alert('Failed to generate tasks')
        } finally {
            setLoading(false)
        }
    }

    if (!isAdminUser) {
        return null
    }

    if (loading) {
        return (
            <AuthGuard>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                </div>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Admin Management</h1>
                                <p className="text-purple-100">Manage agents and create edge functions</p>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <Button
                                    onClick={() => {
                                        setShowAgentForm(!showAgentForm)
                                        setFormData({ ...formData, code: '' })
                                    }}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                >
                                    {showAgentForm ? 'Cancel' : '+ Add Agent'}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowEdgeFunctionForm(!showEdgeFunctionForm)
                                        setFormData({ ...formData, code: '' })
                                    }}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                >
                                    {showEdgeFunctionForm ? 'Cancel' : '+ Create Edge Function'}
                                </Button>
                                <Button
                                    onClick={handleGenerateTasks}
                                    className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    ⚡ Generate Synthetic Tasks
                                </Button>
                                <Button
                                    onClick={() => setShowBulkForm(!showBulkForm)}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                >
                                    {showBulkForm ? 'Cancel' : 'Bulk Create'}
                                </Button>
                                <Button
                                    onClick={() => router.push('/validator')}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                >
                                    📊 Validator Dashboard
                                </Button>
                                <Button
                                    onClick={() => router.push('/synthetic')}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                >
                                    🧪 Synthetic Task Runner
                                </Button>
                                <Button
                                    onClick={() => router.push('/learning')}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                >
                                    📈 Learning Curves
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    {/* Create Agent Form */}
                    {showAgentForm && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Agent</h2>
                            <form onSubmit={handleCreateAgent} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Agent Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="e.g., Prime"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Slug *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="e.g., prime"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            rows={3}
                                            placeholder="Agent description..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Domain
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.domain}
                                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="e.g., event_planning"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Invocation Type *
                                        </label>
                                        <select
                                            required
                                            value={formData.invocation_type}
                                            onChange={(e) => setFormData({ ...formData, invocation_type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="INTERNAL_FUNCTION">Internal Function</option>
                                            <option value="EXTERNAL_API">External API</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Function Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.function_name}
                                            onChange={(e) => setFormData({ ...formData, function_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="e.g., prime-agent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Endpoint *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.endpoint}
                                            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="e.g., /functions/v1/prime-agent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Method
                                        </label>
                                        <select
                                            value={formData.method}
                                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="POST">POST</option>
                                            <option value="GET">GET</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>

                                    {/* New Passport Fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Agent Type
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="tool">Tool</option>
                                            <option value="workflow">Workflow</option>
                                            <option value="qa">QA</option>
                                            <option value="persona">Persona</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Risk Level
                                        </label>
                                        <select
                                            value={formData.risk_level}
                                            onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cost Level
                                        </label>
                                        <select
                                            value={formData.cost_level}
                                            onChange={(e) => setFormData({ ...formData, cost_level: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="cheap">Cheap</option>
                                            <option value="medium">Medium</option>
                                            <option value="heavy">Heavy</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Latency Target (ms)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.latency_target_ms}
                                            onChange={(e) => setFormData({ ...formData, latency_target_ms: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Input Schema (JSON)
                                        </label>
                                        <textarea
                                            value={formData.input_schema}
                                            onChange={(e) => setFormData({ ...formData, input_schema: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                                            rows={4}
                                            placeholder="{}"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Output Schema (JSON)
                                        </label>
                                        <textarea
                                            value={formData.output_schema}
                                            onChange={(e) => setFormData({ ...formData, output_schema: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                                            rows={4}
                                            placeholder="{}"
                                        />
                                    </div>
                                    {formData.invocation_type === 'INTERNAL_FUNCTION' && (
                                        <div className="md:col-span-2 space-y-4">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.create_edge_function}
                                                    onChange={(e) => setFormData({ ...formData, create_edge_function: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Automatically create edge function file
                                                    </span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Creates the function file at supabase/functions/{formData.function_name || 'function-name'}/index.ts with the code below
                                                    </p>
                                                </div>
                                            </label>

                                            {formData.create_edge_function && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Language
                                                        </label>
                                                        <select
                                                            value={formData.language}
                                                            onChange={(e) => {
                                                                const newLanguage = e.target.value
                                                                setFormData({
                                                                    ...formData,
                                                                    language: newLanguage,
                                                                    code: generateAgentFunctionCode(formData.name, formData.function_name, formData.domain, newLanguage)
                                                                })
                                                            }}
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        >
                                                            <option value="typescript">TypeScript</option>
                                                            <option value="javascript">JavaScript</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Edge Function Code
                                                        </label>
                                                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                                                            <Editor
                                                                value={formData.code}
                                                                onValueChange={(code) => setFormData({ ...formData, code })}
                                                                highlight={(code) => highlight(code, formData.language === 'typescript' ? languages.typescript : languages.javascript, formData.language)}
                                                                padding={16}
                                                                style={{
                                                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                                                    fontSize: 14,
                                                                    backgroundColor: '#1e1e1e',
                                                                    minHeight: '400px',
                                                                }}
                                                                className="min-h-[400px]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                                        Create Agent
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowAgentForm(false)}
                                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Create Edge Function Form */}
                    {showEdgeFunctionForm && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Edge Function</h2>
                            <form onSubmit={handleCreateEdgeFunction} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Function Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.function_name}
                                        onChange={(e) => setFormData({ ...formData, function_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="e.g., my-new-function"
                                    />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        This will create a new edge function file at: supabase/functions/{formData.function_name || 'function-name'}/index.ts
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Language
                                    </label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => {
                                            const newLanguage = e.target.value
                                            setFormData({
                                                ...formData,
                                                language: newLanguage,
                                                code: generateDefaultCode(formData.function_name, newLanguage)
                                            })
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="typescript">TypeScript</option>
                                        <option value="javascript">JavaScript</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Function Code
                                    </label>
                                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <Editor
                                            value={formData.code}
                                            onValueChange={(code) => setFormData({ ...formData, code })}
                                            highlight={(code) => highlight(code, formData.language === 'typescript' ? languages.typescript : languages.javascript, formData.language)}
                                            padding={16}
                                            style={{
                                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                                fontSize: 14,
                                                backgroundColor: '#1e1e1e',
                                                minHeight: '400px',
                                            }}
                                            className="min-h-[400px]"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                                        Create Edge Function
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowEdgeFunctionForm(false)}
                                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Bulk Create Form */}
                    {showBulkForm && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Bulk Create Agents</h2>
                            <form onSubmit={handleBulkCreate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Paste Agents JSON Array
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        [{"{"}"name": "Agent Name", "slug": "agent-slug", "invocation_type": "INTERNAL_FUNCTION", ...{"}"}]
                                    </p>
                                    <textarea
                                        required
                                        value={bulkJson}
                                        onChange={(e) => setBulkJson(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                                        rows={10}
                                        placeholder='[{"{"}"name": "My Agent", ...{"}"}]'
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                                        Create Agents
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowBulkForm(false)}
                                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Agents List */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">All Agents</h2>
                        {agents.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 dark:text-gray-400">No agents found. Create your first agent above!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Slug</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Domain</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Function</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agents.map((agent) => (
                                            <tr key={agent.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{agent.name}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{agent.slug}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{agent.domain || '-'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                        }`}>
                                                        {agent.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                    {agent.invocation_config?.function_name || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}
