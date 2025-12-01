import { ReactNode } from 'react'

interface BadgeProps {
    children: ReactNode
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
    size?: 'sm' | 'md'
    pulse?: boolean
    icon?: ReactNode
    className?: string
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    pulse = false,
    icon,
    className = ''
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200'

    const variants = {
        success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
        error: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
        info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
        default: 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm'
    }

    return (
        <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${pulse ? 'animate-pulse' : ''} ${className}`}>
            {icon && icon}
            {children}
        </span>
    )
}
