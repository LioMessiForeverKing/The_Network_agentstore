'use client'

import { ReactNode, useEffect, useState } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    icon?: ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    gradient?: 'purple' | 'blue' | 'pink' | 'green'
    animate?: boolean
}

export default function StatCard({
    title,
    value,
    icon,
    trend,
    gradient = 'purple',
    animate = true
}: StatCardProps) {
    const [displayValue, setDisplayValue] = useState(animate ? 0 : value)

    useEffect(() => {
        if (!animate || typeof value !== 'number') {
            setDisplayValue(value)
            return
        }

        const duration = 1000
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value, animate])

    const gradients = {
        purple: 'from-purple-500/10 to-blue-500/10 border-purple-200 dark:border-purple-800',
        blue: 'from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800',
        pink: 'from-pink-500/10 to-rose-500/10 border-pink-200 dark:border-pink-800',
        green: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800'
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[gradient]} border backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-fade-in`}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {title}
                    </h3>
                    {icon && (
                        <div className="text-gray-400 dark:text-gray-500">
                            {icon}
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {displayValue}
                    </p>
                </div>

                {trend && (
                    <div className="flex items-center gap-1 text-sm">
                        {trend.isPositive ? (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        )}
                        <span className={trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                            {Math.abs(trend.value)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Decorative background circle */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
        </div>
    )
}
