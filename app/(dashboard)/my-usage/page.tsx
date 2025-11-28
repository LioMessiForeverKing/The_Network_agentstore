import { createClient } from '@/lib/supabase-server'
import AuthGuard from '@/components/AuthGuard'
import Badge from '@/components/Badge'
import { getCurrentUser } from '@/lib/auth-server'

async function getUsageLogs(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agent_usage_logs')
    .select('*, agents(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching usage logs:', error)
    return []
  }
  return data || []
}

export default async function MyUsagePage() {
  const { data: { user } } = await getCurrentUser()
  if (!user) return null

  const logs = await getUsageLogs(user.id)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2 animate-fade-in">My Agent Usage</h1>
            <p className="text-purple-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Track your agent interactions and performance history
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {logs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Usage History</h3>
              <p className="text-gray-600 dark:text-gray-400">Start using agents to see your activity here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log: any, index: number) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Agent Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                        {log.agents?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {log.agents?.name || 'Unknown Agent'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.task_type || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Latency */}
                      {log.latency_ms && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{log.latency_ms}ms</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <Badge
                        variant={log.success_flag ? 'success' : 'error'}
                        icon={
                          log.success_flag ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )
                        }
                      >
                        {log.success_flag ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
