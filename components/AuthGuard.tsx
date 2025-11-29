'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getCurrentUser } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check hardcoded authentication
    if (isAuthenticated()) {
      setUser(getCurrentUser())
    } else {
      router.push('/login')
    }
    setLoading(false)

    // Listen for storage changes (e.g., logout from another tab)
    const handleStorageChange = () => {
      if (!isAuthenticated()) {
        router.push('/login')
      } else {
        setUser(getCurrentUser())
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return user ? <>{children}</> : null
}

