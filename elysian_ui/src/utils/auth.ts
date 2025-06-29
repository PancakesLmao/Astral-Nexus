// Simple authentication utility for testing
// Replace this with your actual authentication logic

export const useAuth = () => {
  const login = (token: string = 'demo-token') => {
    localStorage.setItem('auth-token', token)
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
  }

  const isAuthenticated = () => {
    return localStorage.getItem('auth-token') !== null
  }

  return {
    login,
    logout,
    isAuthenticated,
  }
}
