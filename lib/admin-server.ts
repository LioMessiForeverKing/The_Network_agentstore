// Server-side admin utilities
const HARDCODED_ADMIN_EMAIL = 'admin@thenetwork.life'

export function isAdminEmail(email: string | null | undefined): boolean {
  return email === HARDCODED_ADMIN_EMAIL
}

export async function isAdmin(): Promise<boolean> {
  // For server-side, we check if the user is authenticated
  // In a real app, you'd check the session/token
  // For now, we'll rely on the client-side check
  return false // Server-side will check via getCurrentUser
}

