import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import AuthGuard from '@/components/AuthGuard'
import Badge from '@/components/Badge'
import { getCurrentUser } from '@/lib/auth-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getAgentDetails(agentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (error || !data) {
    return null
  }
  return data
}

async function getAgentActions(agentId: string, userEmail: string) {
  // Use admin client to bypass RLS for detailed logs
  const supabase = createAdminClient()
  
  // Find actual user_id from profiles
  let actualUserId: string | null = null
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', userEmail)
    .maybeSingle()
  
  if (profile) {
    actualUserId = profile.id
  }
  
  // Fetch logs - filter by user_id if found, otherwise show all for admin
  let query = supabase
    .from('agent_usage_logs')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (actualUserId) {
    query = query.eq('user_id', actualUserId)
  }
  
  const { data, error } = await query

  if (error) {
    console.error('Error fetching agent actions:', error)
    return []
  }
  return data || []
}

export default async function AgentActivityDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
  const { agentId } = await params
  const { data: { user } } = await getCurrentUser()
  if (!user) return null

  // Handle "routing" special case
  if (agentId === 'routing') {
    const supabase = createAdminClient()
    
    // Find actual user_id from profiles
    let actualUserId: string | null = null
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', user.email || 'admin@thenetwork.life')
      .maybeSingle()
    
    if (profile) {
      actualUserId = profile.id
    }
    
    let query = supabase
      .from('agent_usage_logs')
      .select('*')
      .is('agent_id', null)
      .eq('task_type', 'ROUTING')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (actualUserId) {
      query = query.eq('user_id', actualUserId)
    }
    
    const { data: routingLogs } = await query

    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12">
            <div className="container mx-auto px-4">
              <Link href="/activity" className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Activity
              </Link>
              <h1 className="text-4xl font-bold mb-2">Gaia Router Activity</h1>
              <p className="text-purple-100">
                Routing decisions and task orchestration
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12">
            {routingLogs && routingLogs.length > 0 ? (
              <div className="space-y-4">
                {routingLogs.map((log: any, index: number) => (
                  <ActionCard key={log.id} log={log} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-600 dark:text-gray-400">No routing activity found</p>
              </div>
            )}
          </div>
        </div>
      </AuthGuard>
    )
  }

  const agent = await getAgentDetails(agentId)
  if (!agent) {
    notFound()
  }

  const actions = await getAgentActions(agentId, user.email || 'admin@thenetwork.life')

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <Link href="/activity" className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Activity
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {agent.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{agent.name} Actions</h1>
                <p className="text-purple-100 mt-1">
                  {actions.length} action{actions.length !== 1 ? 's' : ''} taken
                </p>
              </div>
            </div>
            {agent.domain && (
              <Badge variant="info" size="md" className="mt-2">
                {agent.domain}
              </Badge>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {actions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Actions Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">This agent hasn't performed any actions for you yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action: any, index: number) => (
                <ActionCard key={action.id} log={action} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

function ActionCard({ log, index }: { log: any; index: number }) {
  const taskSteps = Array.isArray(log.task_steps) ? log.task_steps : []
  const inputJson = log.input_json || {}
  const outputJson = log.output_json || {}
  const fullContext = log.full_context_json || {}

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {log.task_description || log.task_type || 'Action'}
            </h3>
            <Badge
              variant={log.success_flag ? 'success' : 'error'}
              size="sm"
            >
              {log.success_flag ? 'Success' : 'Failed'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(log.created_at).toLocaleString()}
          </p>
        </div>
        {log.latency_ms && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{log.latency_ms}ms</span>
          </div>
        )}
      </div>

      {/* Task Steps */}
      {taskSteps.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Steps Taken:</h4>
          <div className="flex flex-wrap gap-2">
            {taskSteps.map((step: string, i: number) => (
              <Badge key={i} variant="info" size="sm">
                {step}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input/Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Input */}
        {Object.keys(inputJson).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Input:</h4>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
              {JSON.stringify(inputJson, null, 2)}
            </pre>
          </div>
        )}

        {/* Output */}
        {Object.keys(outputJson).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Output:</h4>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
              {JSON.stringify(outputJson, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Error Message */}
      {log.error_message && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {log.error_message}
          </p>
        </div>
      )}

      {/* Full Context (Collapsible) */}
      {Object.keys(fullContext).length > 0 && (
        <details className="mt-4">
          <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
            View Full Context
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(fullContext, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

