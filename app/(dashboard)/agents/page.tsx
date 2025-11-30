import { createClient } from '@/lib/supabase-server'
import AuthGuard from '@/components/AuthGuard'
import AgentCard from '@/components/AgentCard'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdminEmail } from '@/lib/admin-server'
import Link from 'next/link'

async function getAgents(isAdmin: boolean) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agents')
    .select('*, agent_capabilities(*)')
    .eq('status', 'ACTIVE')
    .order('name')

  if (error) {
    console.error('Error fetching agents:', error)
    return []
  }
  return data || []
}

async function getAllUsageStats() {
  const supabase = await createClient()
  
  // Get all usage logs (not filtered by user)
  const { data: usageData, error } = await supabase
    .from('agent_usage_logs')
    .select('*, agents(*)')
    .order('created_at', { ascending: false })
    .limit(1000) // Get recent usage

  if (error) {
    console.error('Error fetching all usage:', error)
    return {
      totalUses: 0,
      successRate: 0,
      averageLatency: 0,
      uniqueUsers: 0,
      topAgents: []
    }
  }

  const logs = usageData || []
  const totalUses = logs.length
  const successfulUses = logs.filter((log: any) => log.success_flag).length
  const successRate = totalUses > 0 ? successfulUses / totalUses : 0

  const latencies = logs
    .map((log: any) => log.latency_ms)
    .filter((latency: number) => latency != null)
  const averageLatency = latencies.length > 0
    ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length
    : 0

  // Get unique users
  const uniqueUserIds = new Set(logs.map((log: any) => log.user_id))
  const uniqueUsers = uniqueUserIds.size

  // Get top agents by usage
  const agentUsage: Record<string, { count: number; success: number }> = {}
  logs.forEach((log: any) => {
    const agentName = log.agents?.name || 'Unknown'
    if (!agentUsage[agentName]) {
      agentUsage[agentName] = { count: 0, success: 0 }
    }
    agentUsage[agentName].count++
    if (log.success_flag) {
      agentUsage[agentName].success++
    }
  })
  const topAgents = Object.entries(agentUsage)
    .map(([name, stats]) => ({ 
      name, 
      count: stats.count,
      successRate: stats.count > 0 ? stats.success / stats.count : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalUses,
    successRate,
    averageLatency,
    uniqueUsers,
    topAgents
  }
}

export default async function AgentsPage() {
  const { data: { user } } = await getCurrentUser()
  const isAdmin = isAdminEmail(user?.email)
  const agents = await getAgents(isAdmin)
  const allUsageStats = isAdmin ? await getAllUsageStats() : null

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-5xl font-bold mb-4 animate-fade-in">
                    {isAdmin ? 'Admin Dashboard' : 'Discover Amazing Agents'}
                  </h1>
                  <p className="text-xl text-purple-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    {isAdmin 
                      ? 'Manage agents, monitor usage, and create edge functions across the entire platform'
                      : 'Explore our curated collection of AI agents designed to supercharge your productivity'
                    }
                  </p>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin/manage"
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: '0.2s' }}
                  >
                    Manage Agents
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{agents.length}</div>
                    <div className="text-sm text-purple-100">Active Agents</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {isAdmin && allUsageStats 
                        ? allUsageStats.totalUses.toLocaleString()
                        : agents.reduce((sum, agent) => sum + (agent.agent_capabilities?.[0]?.total_uses || 0), 0).toLocaleString()
                      }
                    </div>
                    <div className="text-sm text-purple-100">
                      {isAdmin ? 'Total Uses (All Users)' : 'Total Uses'}
                    </div>
                  </div>
                </div>

                {isAdmin && allUsageStats && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{allUsageStats.uniqueUsers}</div>
                        <div className="text-sm text-purple-100">Active Users</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{Math.round(allUsageStats.successRate * 100)}%</div>
                        <div className="text-sm text-purple-100">Success Rate</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 1440 48" fill="none">
              <path d="M0 48h1440V0S1140 48 720 48 0 0 0 0v48z" className="fill-gray-50 dark:fill-gray-950"></path>
            </svg>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="container mx-auto px-4 py-12">
          {agents.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Agents Available</h3>
              <p className="text-gray-600 dark:text-gray-400">Check back soon for amazing AI agents!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <AgentCard agent={agent} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
