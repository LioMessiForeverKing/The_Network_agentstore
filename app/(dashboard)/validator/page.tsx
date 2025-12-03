'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { isAdmin } from '@/lib/admin'
import { useRouter } from 'next/navigation'

interface ValidationEvent {
  id: string
  score: number
  label: 'PASS' | 'FAIL' | 'NEEDS_REVIEW'
  error_type: string
  explanation: string
  notes?: string
  is_human: boolean
  created_at: string
  agent_usage_logs?: {
    id: string
    task_type: string
    task_description: string
    agent_id: string
    success_flag: boolean
    latency_ms: number
    created_at: string
    agents?: {
      id: string
      name: string
      slug: string
    }
  }
  agents?: {
    id: string
    name: string
    slug: string
  }
}

export default function ValidatorPage() {
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [validations, setValidations] = useState<ValidationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    label: '',
    agent_id: ''
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    score: '',
    label: 'PASS' as 'PASS' | 'FAIL' | 'NEEDS_REVIEW',
    error_type: 'NONE',
    explanation: '',
    notes: ''
  })

  useEffect(() => {
    setIsAdminUser(isAdmin())
    if (isAdmin()) {
      fetchValidations()
    } else {
      router.push('/agents')
    }
  }, [router])

  useEffect(() => {
    if (isAdminUser) {
      fetchValidations()
    }
  }, [filters, isAdminUser])

  async function fetchValidations() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.label) params.append('label', filters.label)
      if (filters.agent_id) params.append('agent_id', filters.agent_id)

      const response = await fetch(`/api/admin/validations?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setValidations(data.validations || [])
      }
    } catch (error) {
      console.error('Error fetching validations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateValidation(id: string) {
    try {
      const response = await fetch('/api/admin/validations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...editForm,
          score: parseFloat(editForm.score)
        })
      })

      if (response.ok) {
        setEditingId(null)
        fetchValidations()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating validation:', error)
      alert('Failed to update validation')
    }
  }

  function startEdit(validation: ValidationEvent) {
    setEditingId(validation.id)
    setEditForm({
      score: validation.score.toString(),
      label: validation.label,
      error_type: validation.error_type || 'NONE',
      explanation: validation.explanation || '',
      notes: validation.notes || ''
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
            <h1 className="text-4xl font-bold mb-2">Validator Dashboard</h1>
            <p className="text-purple-100">Quality assessment and validation of agent outputs</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label
                </label>
                <select
                  value={filters.label}
                  onChange={(e) => setFilters({ ...filters, label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                  <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent ID
                </label>
                <input
                  type="text"
                  value={filters.agent_id}
                  onChange={(e) => setFilters({ ...filters, agent_id: e.target.value })}
                  placeholder="Filter by agent ID..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Validations List */}
          {validations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Validations Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Run synthetic tasks to generate validation events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {validations.map((validation) => (
                <div
                  key={validation.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge
                          variant={validation.label === 'PASS' ? 'success' : validation.label === 'FAIL' ? 'error' : 'warning'}
                        >
                          {validation.label}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Score: {(validation.score * 100).toFixed(1)}%
                        </span>
                        {validation.is_human && (
                          <Badge variant="info">Human Override</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Agent: {validation.agent_usage_logs?.agents?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Task: {validation.agent_usage_logs?.task_type || 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setExpandedId(expandedId === validation.id ? null : validation.id)}
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        {expandedId === validation.id ? 'Collapse' : 'Expand'}
                      </Button>
                      <Button
                        onClick={() => startEdit(validation)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {expandedId === validation.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Error Type</h4>
                          <p className="text-sm text-gray-900 dark:text-white">{validation.error_type}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Explanation</h4>
                          <p className="text-sm text-gray-900 dark:text-white">{validation.explanation}</p>
                        </div>
                        {validation.notes && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
                            <p className="text-sm text-gray-900 dark:text-white">{validation.notes}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Created</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(validation.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {editingId === validation.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Score (0-1)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={editForm.score}
                            onChange={(e) => setEditForm({ ...editForm, score: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Label
                          </label>
                          <select
                            value={editForm.label}
                            onChange={(e) => setEditForm({ ...editForm, label: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="PASS">PASS</option>
                            <option value="FAIL">FAIL</option>
                            <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Error Type
                          </label>
                          <select
                            value={editForm.error_type}
                            onChange={(e) => setEditForm({ ...editForm, error_type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="NONE">NONE</option>
                            <option value="HALLUCINATION">HALLUCINATION</option>
                            <option value="MISSING_FIELD">MISSING_FIELD</option>
                            <option value="BAD_FORMAT">BAD_FORMAT</option>
                            <option value="OFF_POLICY">OFF_POLICY</option>
                            <option value="OTHER">OTHER</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Explanation
                          </label>
                          <textarea
                            value={editForm.explanation}
                            onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes
                          </label>
                          <textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateValidation(validation.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
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

