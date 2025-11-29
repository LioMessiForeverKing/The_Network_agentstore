'use client'

// Hardcoded credentials
const HARDCODED_EMAIL = 'admin@thenetwork.life'
const HARDCODED_PASSWORD = 'Adm!n@Th3N3tw0rk$ecur3#2024!'
const AUTH_TOKEN_KEY = 'agent_store_auth_token'
const AUTH_TOKEN_VALUE = 'authenticated_admin_2024'

export async function signInWithPassword(email: string, password: string) {
  // Check hardcoded credentials
  if (email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
    // Store auth token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, AUTH_TOKEN_VALUE)
    }
    return { data: { user: { email: HARDCODED_EMAIL } }, error: null }
  } else {
    return { 
      data: null, 
      error: { message: 'Invalid login credentials' } 
    }
  }
}

export async function signOut() {
  // Remove auth token from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
  return { error: null }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AUTH_TOKEN_KEY) === AUTH_TOKEN_VALUE
}

export function getCurrentUser() {
  if (isAuthenticated()) {
    return { email: HARDCODED_EMAIL }
  }
  return null
}

