'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { isAdmin } from '@/lib/admin'
import Button from '@/components/Button'

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
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    domain: '',
    invocation_type: 'INTERNAL_FUNCTION',
    function_name: '',
    endpoint: '',
    method: 'POST',
    create_edge_function: true
  })

  useEffect(() => {
    setIsAdminUser(isAdmin())
    if (isAdmin()) {
      fetchAgents()
    } else {
      router.push('/agents')
    }
  }, [router])

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
          create_edge_function: formData.create_edge_function && formData.invocation_type === 'INTERNAL_FUNCTION'
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
          create_edge_function: true
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
          code: `// Supabase Edge Function: ${formData.function_name}
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
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
      JSON.stringify({ success: true, message: 'Function executed successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
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
          create_edge_function: true
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
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowAgentForm(!showAgentForm)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  {showAgentForm ? 'Cancel' : '+ Add Agent'}
                </Button>
                <Button
                  onClick={() => setShowEdgeFunctionForm(!showEdgeFunctionForm)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  {showEdgeFunctionForm ? 'Cancel' : '+ Create Edge Function'}
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
                  {formData.invocation_type === 'INTERNAL_FUNCTION' && (
                    <div className="md:col-span-2">
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
                            Creates the function file at supabase/functions/{formData.function_name || 'function-name'}/index.ts with a template
                          </p>
                        </div>
                      </label>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.status === 'ACTIVE' 
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

