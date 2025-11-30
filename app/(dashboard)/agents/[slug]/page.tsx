import { createClient } from '@/lib/supabase-server'
import AuthGuard from '@/components/AuthGuard'
import Button from '@/components/Button'
import Badge from '@/components/Badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getAgentBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agents')
    .select('*, agent_capabilities(*)')
    .eq('slug', slug)
    .eq('status', 'ACTIVE')
    .single()

  if (error || !data) {
    return null
  }
  return data
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const agent = await getAgentBySlug(slug)

  if (!agent) {
    notFound()
  }

  const capabilities = agent.agent_capabilities?.[0]
  const successRate = capabilities ? Math.round((capabilities.success_rate || 0) * 100) : 0

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl">
              {/* Agent Avatar & Name */}
              <div className="flex items-start gap-6 mb-6 animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-2 border-white/30">
                  {agent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-5xl font-bold">{agent.name}</h1>
                    {agent.domain && (
                      <Badge variant="info" size="md">
                        {agent.domain}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-purple-100">
                    {agent.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {agent.slug === 'prime' ? (
                  <Link href="/agents/prime/test">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Test Prime Agent
                    </Button>
                  </Link>
                ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Try This Agent
                </Button>
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

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Agent Details Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg animate-fade-in">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Domain</span>
                      <Badge variant="info">{agent.domain || 'N/A'}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Status</span>
                      <Badge variant="success">{agent.status}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Identifier</span>
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white">
                        {agent.slug}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats Card */}
              {capabilities && (
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Performance Metrics
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Success Rate */}
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - successRate / 100)}`}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {successRate}%
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</h3>
                    </div>

                    {/* Latency */}
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {Math.round(capabilities.average_latency_ms || 0)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">ms</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Latency</h3>
                    </div>

                    {/* Total Uses */}
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {(capabilities.total_uses || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Uses</h3>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
