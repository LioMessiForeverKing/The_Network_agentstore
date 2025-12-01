'use client'

import { useEffect, useState } from 'react'

interface AgentWorkflowProps {
  agentName: string
  agentSlug: string
}

export default function AgentWorkflow({ agentName, agentSlug }: AgentWorkflowProps) {
  const [animateLine1, setAnimateLine1] = useState(false)
  const [animateLine2, setAnimateLine2] = useState(false)

  useEffect(() => {
    // Animate first line after a short delay
    const timer1 = setTimeout(() => setAnimateLine1(true), 300)
    // Animate second line after first completes
    const timer2 = setTimeout(() => setAnimateLine2(true), 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Agent Workflow
        </h2>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Coming Soon
        </span>
      </div>

      {/* Flowchart */}
      <div className="relative">
        {/* Flowchart Container */}
        <div className="flex items-center justify-between gap-4 py-8">
          {/* Stella */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-2 border-white dark:border-gray-800 animate-fade-in">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">Stella</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Your AI Companion</div>
            </div>
          </div>

          {/* Animated Dotted Line 1 */}
          <div className="flex-1 relative h-1">
            <svg className="w-full h-full" viewBox="0 0 200 4" preserveAspectRatio="none">
              <line
                x1="0"
                y1="2"
                x2="200"
                y2="2"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="8 4"
                className={`transition-all duration-1000 ${animateLine1 ? 'opacity-100' : 'opacity-0'}`}
              />
            </svg>
            {/* Animated dots moving along the line */}
            {animateLine1 && (
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full">
                <div 
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                  style={{
                    animation: 'flowLine 2s ease-in-out infinite'
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Gaia Router */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-2 border-white dark:border-gray-800 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">Gaia Router</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Task Orchestrator</div>
            </div>
          </div>

          {/* Animated Dotted Line 2 */}
          <div className="flex-1 relative h-1">
            <svg className="w-full h-full" viewBox="0 0 200 4" preserveAspectRatio="none">
              <line
                x1="0"
                y1="2"
                x2="200"
                y2="2"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="8 4"
                className={`transition-all duration-1000 ${animateLine2 ? 'opacity-100' : 'opacity-0'}`}
              />
            </svg>
            {/* Animated dots moving along the line */}
            {animateLine2 && (
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full">
                <div 
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
                  style={{
                    animation: 'flowLine 2s ease-in-out infinite'
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Prime Agent */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-2 border-white dark:border-gray-800 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {agentName.charAt(0)}
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">{agentName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Specialist Agent</div>
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                Workflow Editor Coming Soon
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                In the future, you'll be able to edit and customize agent workflows directly through this interface. 
                Configure routing logic, add custom steps, and create your own agent pipelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowLine {
          0% {
            transform: translateX(-12px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}} />
    </div>
  )
}

