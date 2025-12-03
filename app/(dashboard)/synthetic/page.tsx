'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { isAdmin } from '@/lib/admin'
import { useRouter } from 'next/navigation'

interface SyntheticTask {
  id: string
  agent_slug_candidate: string
  task_type: string
  task_spec_json: any
  expected_shape: any
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  usage_log_id?: string
  validation_event_id?: string
  error_message?: string
  created_at: string
  completed_at?: string
  agent_usage_logs?: {
    id: string
    task_type: string
    task_description?: string
    success_flag: boolean
    latency_ms: number
    input_json?: any
    output_json?: any
    routing_metadata?: any
    full_context_json?: any
    error_message?: string
    created_at: string
  }
  agent_validation_events?: {
    id: string
    score: number
    label: string
    error_type: string
    explanation?: string
    created_at: string
  }
}

export default function SyntheticPage() {
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [tasks, setTasks] = useState<SyntheticTask[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    agent_slug: ''
  })

  useEffect(() => {
    setIsAdminUser(isAdmin())
    if (isAdmin()) {
      fetchTasks()
    } else {
      router.push('/agents')
    }
  }, [router])

  useEffect(() => {
    if (isAdminUser) {
      fetchTasks()
    }
  }, [filters, isAdminUser])

  async function fetchTasks() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.agent_slug) params.append('agent_slug', filters.agent_slug)

      const response = await fetch(`/api/admin/synthetic-tasks?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateTasks() {
    try {
      setGenerating(true)
      const response = await fetch('/api/admin/generate-tasks', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.count === 0) {
          alert(data.message || 'No synthetic tasks generated. Make sure you have EXPERIMENTAL agents (synthetic tasks only test experimental agents, not ACTIVE ones).')
        } else {
          alert(`Successfully generated ${data.count} synthetic tasks for EXPERIMENTAL agents!`)
        }
        fetchTasks()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating tasks:', error)
      alert('Failed to generate tasks')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRunTasks(taskIds?: string[]) {
    try {
      setRunning(true)
      const response = await fetch('/api/admin/synthetic-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_ids: taskIds,
          batch_size: 10
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully executed ${data.executed} tasks!`)
        fetchTasks()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error running tasks:', error)
      alert('Failed to run tasks')
    } finally {
      setRunning(false)
    }
  }

  async function handleClearCompleted() {
    if (!confirm('Are you sure you want to delete all completed tasks?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/synthetic-tasks?status=COMPLETED', {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Successfully cleared completed tasks!')
        fetchTasks()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error clearing tasks:', error)
      alert('Failed to clear tasks')
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

  const pendingTasks = tasks.filter(t => t.status === 'PENDING')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')
  const failedTasks = tasks.filter(t => t.status === 'FAILED')

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Synthetic Task Runner</h1>
                <p className="text-purple-100">Generate and run synthetic tasks for agent testing</p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleGenerateTasks}
                  disabled={generating}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  {generating ? 'Generating...' : '⚡ Generate Tasks'}
                </Button>
                <Button
                  onClick={() => handleRunTasks()}
                  disabled={running || pendingTasks.length === 0}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  {running ? 'Running...' : `▶ Run Tasks (${pendingTasks.length})`}
                </Button>
                {completedTasks.length > 0 && (
                  <Button
                    onClick={handleClearCompleted}
                    className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm"
                  >
                    🗑️ Clear Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{tasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{completedTasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{failedTasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="PENDING">PENDING</option>
                  <option value="RUNNING">RUNNING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Slug
                </label>
                <input
                  type="text"
                  value={filters.agent_slug}
                  onChange={(e) => setFilters({ ...filters, agent_slug: e.target.value })}
                  placeholder="Filter by agent slug..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Synthetic Tasks</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Generate tasks to start testing agents</p>
              <Button onClick={handleGenerateTasks} className="bg-purple-600 hover:bg-purple-700">
                Generate Tasks
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge
                          variant={
                            task.status === 'COMPLETED' ? 'success' :
                            task.status === 'FAILED' ? 'error' :
                            task.status === 'RUNNING' ? 'warning' : 'info'
                          }
                        >
                          {task.status}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.agent_slug_candidate}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {task.task_type}
                        </span>
                      </div>
                      {task.agent_usage_logs && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="mr-4">
                            Latency: {task.agent_usage_logs.latency_ms}ms
                          </span>
                          <Badge variant={task.agent_usage_logs.success_flag ? 'success' : 'error'}>
                            {task.agent_usage_logs.success_flag ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      )}
                      {task.agent_validation_events && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="mr-4">
                            Validation Score: {(task.agent_validation_events.score * 100).toFixed(1)}%
                          </span>
                          <Badge
                            variant={
                              task.agent_validation_events.label === 'PASS' ? 'success' :
                              task.agent_validation_events.label === 'FAIL' ? 'error' : 'warning'
                            }
                          >
                            {task.agent_validation_events.label}
                          </Badge>
                        </div>
                      )}
                      {task.status === 'FAILED' && task.error_message && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Error:</p>
                          <p className="text-sm text-red-700 dark:text-red-300">{task.error_message}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Created: {new Date(task.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        {expandedId === task.id ? 'Collapse' : 'View Details'}
                      </Button>
                      {task.status === 'PENDING' && (
                        <Button
                          onClick={() => handleRunTasks([task.id])}
                          disabled={running}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Run
                        </Button>
                      )}
                      {task.validation_event_id && (
                        <Button
                          onClick={() => router.push(`/validator?validation_id=${task.validation_event_id}`)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          View Validation
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === task.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      {/* Generated Task Spec */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Generated Task Spec (Stored)
                          {task.task_spec_json?.user_id === '00000000-0000-0000-0000-000000000000' && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              (user_id placeholder - updated when running)
                            </span>
                          )}
                        </h4>
                        <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
                          {JSON.stringify(task.task_spec_json, null, 2)}
                        </pre>
                      </div>

                      {/* Gaia Router Response */}
                      {task.agent_usage_logs?.routing_metadata && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Gaia Router Response
                          </h4>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(task.agent_usage_logs.routing_metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Transformation Details */}
                      {task.agent_usage_logs?.routing_metadata?.transformation && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            🔄 Task Spec Transformation
                          </h4>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Input Format:</span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-xs font-mono">
                                  {task.agent_usage_logs.routing_metadata.transformation.agent_input_format || 'standard'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Transformation Applied:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  task.agent_usage_logs.routing_metadata.transformation.transformation_applied
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {task.agent_usage_logs.routing_metadata.transformation.transformation_applied ? 'Yes' : 'No'}
                                </span>
                              </div>
                              {task.agent_usage_logs.routing_metadata.transformation.transformation_type && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Transformation Type:</span>
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded text-xs font-mono">
                                    {task.agent_usage_logs.routing_metadata.transformation.transformation_type}
                                  </span>
                                </div>
                              )}
                              {task.agent_usage_logs.routing_metadata.transformation.reason && (
                                <div>
                                  <span className="font-medium">Reason:</span>
                                  <p className="mt-1 text-gray-600 dark:text-gray-400 text-xs">
                                    {task.agent_usage_logs.routing_metadata.transformation.reason}
                                  </p>
                                </div>
                              )}
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs font-medium text-blue-700 dark:text-blue-300 hover:underline">
                                  View Full Transformation Details
                                </summary>
                                <pre className="mt-2 bg-blue-100 dark:bg-blue-900/30 p-3 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(task.agent_usage_logs.routing_metadata.transformation, null, 2)}
                                </pre>
                              </details>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Agent Input */}
                      {task.agent_usage_logs?.input_json && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Agent Input
                          </h4>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(task.agent_usage_logs.input_json, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Agent Output/Execution Result */}
                      {task.agent_usage_logs?.output_json && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Agent Execution Result
                          </h4>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(task.agent_usage_logs.output_json, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Full Context */}
                      {task.agent_usage_logs?.full_context_json && Object.keys(task.agent_usage_logs.full_context_json).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Full Context
                          </h4>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(task.agent_usage_logs.full_context_json, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Validation Details */}
                      {task.agent_validation_events && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Validation Details
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Score:</span> {(task.agent_validation_events.score * 100).toFixed(1)}%
                              </div>
                              <div>
                                <span className="font-medium">Label:</span> {task.agent_validation_events.label}
                              </div>
                              <div>
                                <span className="font-medium">Error Type:</span> {task.agent_validation_events.error_type}
                              </div>
                              {task.agent_validation_events.explanation && (
                                <div>
                                  <span className="font-medium">Explanation:</span>
                                  <p className="mt-1 text-gray-600 dark:text-gray-400">{task.agent_validation_events.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Details */}
                      {(task.error_message || task.agent_usage_logs?.error_message) && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                            Error Details
                          </h4>
                          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {task.error_message || task.agent_usage_logs?.error_message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

