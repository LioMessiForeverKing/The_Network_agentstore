// Hardcoded user for server-side
const HARDCODED_USER = {
  id: 'admin-user-id',
  email: 'admin@thenetwork.life',
}

export async function getCurrentUser() {
  // Return hardcoded user for server-side checks
  // Client-side protection is handled by AuthGuard
  return {
    data: {
      user: HARDCODED_USER
    },
    error: null
  }
}

