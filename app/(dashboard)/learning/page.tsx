'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { isAdmin } from '@/lib/admin'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface DataPoint {
  timestamp: string
  success_rate_before: number
  success_rate_after: number
  reward: number
  learning_rate: number
  validation_event_id: string
}

interface AgentCurve {
  agent: {
    id: string
    name: string
    slug: string
  }
  dataPoints: DataPoint[]
  current?: {
    success_rate: number
    recent_success_rate: number | null
    validation_count: number
    trend: string | null
    last_validation_at: string | null
  }
}

export default function LearningCurvesPage() {
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [curves, setCurves] = useState<AgentCurve[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setIsAdminUser(isAdmin())
    if (!isAdmin()) {
      router.push('/agents')
    } else {
      fetchCurves()
    }
  }, [router, selectedAgent, days])

  async function fetchCurves() {
    try {
      setLoading(true)
      const url = `/api/admin/learning-curves?days=${days}${selectedAgent ? `&agent_id=${selectedAgent}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setCurves(data.curves || [])
      } else {
        console.error('Failed to fetch learning curves')
      }
    } catch (error) {
      console.error('Error fetching learning curves:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format data for charting
  function formatChartData(curve: AgentCurve) {
    return curve.dataPoints.map((point, index) => {
      const date = new Date(point.timestamp)
      return {
        index,
        date: date.toLocaleDateString(),
        datetime: date.toISOString(),
        before: Math.round(point.success_rate_before * 100),
        after: Math.round(point.success_rate_after * 100),
        reward: point.reward.toFixed(3),
        learningRate: Math.round(point.learning_rate * 100)
      }
    })
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
            <p className="text-gray-600 dark:text-gray-400">Loading learning curves...</p>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Learning Curves</h1>
                <p className="text-purple-100">Track how agents learn and improve over time</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <select
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value={7} className="text-gray-900">Last 7 days</option>
                  <option value={30} className="text-gray-900">Last 30 days</option>
                  <option value={90} className="text-gray-900">Last 90 days</option>
                  <option value={365} className="text-gray-900">Last year</option>
                </select>
                <button
                  onClick={() => router.push('/admin/manage')}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200"
                >
                  ← Back to Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {curves.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Learning Data Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Agents need to be validated before learning curves can be generated.
              </p>
              <button
                onClick={() => router.push('/synthetic')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Run Synthetic Tasks
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {curves.map((curve) => {
                const chartData = formatChartData(curve)
                const trend = curve.current?.trend
                const trendColor = trend === 'IMPROVING' ? 'text-green-600 dark:text-green-400' :
                                 trend === 'DECLINING' ? 'text-red-600 dark:text-red-400' :
                                 'text-gray-600 dark:text-gray-400'

                return (
                  <div
                    key={curve.agent.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg overflow-visible"
                  >
                    {/* Agent Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {curve.agent.name}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Slug: {curve.agent.slug}</span>
                          {curve.current && (
                            <>
                              <span>•</span>
                              <span>
                                Validations: {curve.current.validation_count}
                              </span>
                              {trend && (
                                <>
                                  <span>•</span>
                                  <span className={trendColor}>
                                    Trend: {trend}
                                    {trend === 'IMPROVING' && ' ↑'}
                                    {trend === 'DECLINING' && ' ↓'}
                                    {trend === 'STABLE' && ' →'}
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {curve.current && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Success Rate</div>
                          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {Math.round(curve.current.success_rate * 100)}%
                          </div>
                          {curve.current.recent_success_rate !== null && (
                            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              Recent: {Math.round(curve.current.recent_success_rate * 100)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Learning Curve Chart */}
                    {chartData.length > 0 ? (
                      <div className="mt-6 overflow-visible">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Success Rate Over Time
                        </h3>
                        <ResponsiveContainer width="100%" height={300} style={{ overflow: 'visible' }}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id={`colorBefore-${curve.agent.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id={`colorAfter-${curve.agent.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
                            <XAxis
                              dataKey="date"
                              stroke="#666"
                              className="dark:stroke-gray-400"
                              tick={{ fill: '#666', className: 'dark:fill-gray-400' }}
                            />
                            <YAxis
                              domain={[0, 100]}
                              stroke="#666"
                              className="dark:stroke-gray-400"
                              tick={{ fill: '#666', className: 'dark:fill-gray-400' }}
                              label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                color: '#333',
                                zIndex: 9999,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                              }}
                              wrapperStyle={{ zIndex: 9999 }}
                              labelStyle={{ color: '#333', fontWeight: 'bold' }}
                              formatter={(value: number, name: string) => [`${value}%`, name]}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="before"
                              stroke="#8884d8"
                              fillOpacity={1}
                              fill={`url(#colorBefore-${curve.agent.id})`}
                              name="Before Validation"
                              strokeWidth={2}
                            />
                            <Area
                              type="monotone"
                              dataKey="after"
                              stroke="#82ca9d"
                              fillOpacity={1}
                              fill={`url(#colorAfter-${curve.agent.id})`}
                              name="After Validation"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No data points in the selected time range
                      </div>
                    )}

                    {/* Reward History */}
                    {chartData.length > 0 && (
                      <div className="mt-8 overflow-visible">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Reward History
                        </h3>
                        <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
                            <XAxis
                              dataKey="date"
                              stroke="#666"
                              className="dark:stroke-gray-400"
                              tick={{ fill: '#666', className: 'dark:fill-gray-400' }}
                            />
                            <YAxis
                              stroke="#666"
                              className="dark:stroke-gray-400"
                              tick={{ fill: '#666', className: 'dark:fill-gray-400' }}
                              label={{ value: 'Reward', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                color: '#333',
                                zIndex: 9999,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                              }}
                              wrapperStyle={{ zIndex: 9999 }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="reward"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name="Reward"
                            />
                            <Line
                              type="monotone"
                              dataKey="learningRate"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name="Learning Rate (%)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

