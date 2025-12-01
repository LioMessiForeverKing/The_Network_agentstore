'use client'

import { useState } from 'react'
import Badge from './Badge'

interface ErrorDiagnosticsProps {
  log: {
    error_message?: string | null
    input_json?: any
    output_json?: any
    task_steps?: string[] | any
    full_context_json?: any
    task_type?: string
    task_description?: string
  }
}

export default function ErrorDiagnostics({ log }: ErrorDiagnosticsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if there's any error to display
  const errorMessage = log.error_message || log.output_json?.error
  if (!errorMessage) {
    // No error found, don't render diagnostics
    return null
  }
  const taskSteps = Array.isArray(log.task_steps) ? log.task_steps : []
  const inputJson = log.input_json || {}
  const outputJson = log.output_json || {}
  const fullContext = log.full_context_json || {}

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      {/* Error Message - Always Visible */}
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-3">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-red-800 dark:text-red-200">Error</span>
              <Badge variant="error" size="sm">Failed</Badge>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 break-words">{errorMessage}</p>
          </div>
        </div>
      </div>

      {/* Expandable Diagnostics */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Diagnostic Details
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-4 animate-fade-in">
          {/* Task Steps */}
          {taskSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Steps Taken Before Error
              </h4>
              <div className="flex flex-wrap gap-2">
                {taskSteps.map((step: string, i: number) => (
                  <Badge key={i} variant="info" size="sm">
                    {step}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input JSON */}
          {Object.keys(inputJson).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Input Data
              </h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">
                {JSON.stringify(inputJson, null, 2)}
              </pre>
            </div>
          )}

          {/* Output JSON */}
          {Object.keys(outputJson).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Output Data
              </h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">
                {JSON.stringify(outputJson, null, 2)}
              </pre>
            </div>
          )}

          {/* Full Context */}
          {Object.keys(fullContext).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Full Context
              </h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700">
                {JSON.stringify(fullContext, null, 2)}
              </pre>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Use this information to diagnose the issue. Check the error message, review the input/output data, and examine the steps taken before the error occurred.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

