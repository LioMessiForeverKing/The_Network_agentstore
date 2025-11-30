import Link from 'next/link'
import Badge from './Badge'

interface AgentCardProps {
  agent: {
    id: string
    name: string
    slug: string
    description: string | null
    domain: string | null
    status: string
    agent_capabilities?: Array<{
      success_rate: number
      average_latency_ms: number
      total_uses: number
    }>
  }
}

export default function AgentCard({ agent }: AgentCardProps) {
  const capabilities = agent.agent_capabilities?.[0]
  const successRate = capabilities ? Math.round((capabilities.success_rate || 0) * 100) : 0

  return (
    <Link href={`/agents/${agent.slug}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 hover:border-purple-300 dark:hover:border-purple-700 animate-fade-in">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                {agent.name}
              </h3>
              {agent.domain && (
                <Badge variant="info" size="sm">
                  {agent.domain}
                </Badge>
              )}
            </div>

            {/* Agent Icon/Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              {agent.name.charAt(0)}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 min-h-[3rem]">
            {agent.description || 'No description available'}
          </p>

          {/* Performance Stats */}
          {capabilities && (
            <div className="space-y-3">
              {/* Success Rate Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {successRate}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs">{Math.round(capabilities.average_latency_ms || 0)}ms</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-medium">{(capabilities.total_uses || 0).toLocaleString()} uses</span>
                </div>
              </div>
            </div>
          )}

          {/* Learn More Link */}
          <div className="mt-6 flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:gap-2 gap-1 transition-all duration-300">
            <span>Explore Agent</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Decorative corner gradient */}
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    </Link>
  )
}

