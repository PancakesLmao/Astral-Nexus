// Helper functions for the application
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Cookie utility functions for cross-subdomain support
import { CookieOptions } from '@/shared/types'
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (options.domain) {
    cookieString += `; Domain=${options.domain}`
  }

  if (options.path) {
    cookieString += `; Path=${options.path}`
  }

  if (options.maxAge) {
    cookieString += `; Max-Age=${options.maxAge}`
  }

  if (options.expires) {
    cookieString += `; Expires=${options.expires.toUTCString()}`
  }

  if (options.secure) {
    cookieString += `; Secure`
  }

  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`
  }

  if (options.httpOnly) {
    cookieString += `; HttpOnly`
  }

  document.cookie = cookieString
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${encodeURIComponent(name)}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue ? decodeURIComponent(cookieValue) : null
  }
  return null
}

export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, 'domain' | 'path'> = {},
): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  })
}

// Authentication utilities
export async function checkUserAuth(
  apiBaseUrl: string,
): Promise<{ isAuthenticated: boolean; user?: unknown }> {
  try {
    // Rely solely on cookies for session management
    // No need to manually check localStorage or send Authorization headers
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      credentials: 'include', // This will automatically include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return { isAuthenticated: true, user: data.user }
    } else {
      // Clear any invalid session data
      localStorage.removeItem('astral_session')
      deleteCookie('astral_session', { domain: '.localtest.me', path: '/' })
      return { isAuthenticated: false }
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    return { isAuthenticated: false }
  }
}

export function redirectToLogin(): void {
  window.location.href = 'http://localtest.me:3000/login'
}
