'use client'

// Admin utilities
const HARDCODED_ADMIN_EMAIL = 'admin@thenetwork.life'

export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if user is authenticated as admin
  const authToken = localStorage.getItem('agent_store_auth_token')
  if (authToken !== 'authenticated_admin_2024') return false
  
  // Additional check: get email from auth if available
  // For now, if they have the auth token, they're admin
  return true
}

export function getAdminEmail(): string {
  return HARDCODED_ADMIN_EMAIL
}

