interface ErrorDiagnosticsProps {
  log: {
    error_message?: string | null
    error_code?: string | null
    error_details?: any
    [key: string]: any
  }
}

export default function ErrorDiagnostics({ log }: ErrorDiagnosticsProps) {
  if (!log.error_message && !log.error_code && !log.error_details) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-start gap-2 mb-2">
        <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Error Details</h4>
      </div>
      
      <div className="ml-7 space-y-2">
        {log.error_code && (
          <div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Error Code: </span>
            <span className="text-xs text-gray-900 dark:text-gray-100 font-mono">{log.error_code}</span>
          </div>
        )}
        
        {log.error_message && (
          <div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Message: </span>
            <p className="text-xs text-gray-900 dark:text-gray-100 mt-1">{log.error_message}</p>
          </div>
        )}
        
        {log.error_details && (
          <div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Details: </span>
            <pre className="text-xs text-gray-900 dark:text-gray-100 mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded overflow-x-auto">
              {typeof log.error_details === 'string' 
                ? log.error_details 
                : JSON.stringify(log.error_details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
