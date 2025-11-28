import { createClient } from '@/lib/supabase-server'
import AuthGuard from '@/components/AuthGuard'
import StatCard from '@/components/StatCard'
import { getCurrentUser } from '@/lib/auth-server'

async function getInsights(userId: string) {
  const supabase = await createClient()
  // Get usage statistics
  const { data: usageData, error: usageError } = await supabase
    .from('agent_usage_logs')
    .select('*, agents(*)')
    .eq('user_id', userId)

  if (usageError) {
    console.error('Error fetching insights:', usageError)
    return {
      totalUses: 0,
      successRate: 0,
      averageLatency: 0,
      topAgents: [],
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

  // Get top agents by usage
  const agentUsage: Record<string, number> = {}
  logs.forEach((log: any) => {
    const agentName = log.agents?.name || 'Unknown'
    agentUsage[agentName] = (agentUsage[agentName] || 0) + 1
  })
  const topAgents = Object.entries(agentUsage)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalUses,
    successRate,
    averageLatency,
    topAgents,
  }
}

export default async function InsightsPage() {
  const { data: { user } } = await getCurrentUser()
  if (!user) return null

  const insights = await getInsights(user.id)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2 animate-fade-in">Usage Insights</h1>
            <p className="text-purple-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Analyze your agent usage patterns and performance metrics
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard
              title="Total Uses"
              value={insights.totalUses}
              gradient="purple"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />

            <StatCard
              title="Success Rate"
              value={`${Math.round(insights.successRate * 100)}%`}
              gradient="green"
              animate={false}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend={
                insights.successRate >= 0.8
                  ? { value: 12, isPositive: true }
                  : undefined
              }
            />

            <StatCard
              title="Avg Latency"
              value={`${Math.round(insights.averageLatency)}ms`}
              gradient="blue"
              animate={false}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Top Agents Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Agents</h2>
            </div>

            {insights.topAgents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400">No agent usage data available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.topAgents.map((agent, index) => {
                  const maxCount = insights.topAgents[0].count
                  const percentage = (agent.count / maxCount) * 100

                  return (
                    <div
                      key={agent.name}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {agent.count} {agent.count === 1 ? 'use' : 'uses'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${percentage}%`,
                            transitionDelay: `${index * 0.1}s`
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
