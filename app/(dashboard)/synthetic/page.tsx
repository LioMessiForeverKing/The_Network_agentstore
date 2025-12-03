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
  created_at: string
  completed_at?: string
  agent_usage_logs?: {
    id: string
    task_type: string
    success_flag: boolean
    latency_ms: number
    created_at: string
  }
  agent_validation_events?: {
    id: string
    score: number
    label: string
    error_type: string
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
        alert(`Successfully generated ${data.count} synthetic tasks!`)
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
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Created: {new Date(task.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

