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

// ============================================
// Environment-based URL Configuration
// ============================================
// Vite automatically detects mode at build time:
// - Development: import.meta.env.DEV === true
// - Production: import.meta.env.PROD === true
//
// Dev environment (localhost):
//   - Frontend: http://localtest.me:3000
//   - Backend:  http://api.localtest.me:3001
//   - Admin:    http://admin.localtest.me:3000
//
// Production environment:
//   - Uses values from .env file (no ports)
//   - Frontend: https://domain.com
//   - Backend:  https://api.domain.com
//   - Admin:    https://admin.domain.com

export function getApiUrl(): string {
  if (import.meta.env.DEV) {
    // Development: hardcoded with port
    return 'http://api.localtest.me:3001'
  }
  // Production: from .env file
  const envUrl = import.meta.env.VITE_API_BASE_URL
  return envUrl ? envUrl.replace(/\/$/, '') : 'https://api.domain.com'
}

export function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    // Development: hardcoded with port
    return 'http://localtest.me:3000'
  }
  // Production: from .env file
  const envUrl = import.meta.env.VITE_APP_BASE_URL
  return envUrl ? envUrl.replace(/\/$/, '') : 'https://domain.com'
}

export function getAdminUrl(): string {
  if (import.meta.env.DEV) {
    // Development: hardcoded admin subdomain with port
    return 'http://admin.localtest.me:3000'
  }
  // Production: extract domain and add admin subdomain
  const baseUrl = getBaseUrl()
  try {
    const url = new URL(baseUrl)
    const hostname = url.hostname.replace(/^(www\.)?/, 'admin.')
    return `${url.protocol}//${hostname}`
  } catch (error) {
    console.error('Error parsing base URL:', error)
    return 'https://admin.domain.com'
  }
}

export function getSessionDomain(): string {
  if (import.meta.env.DEV) {
    // Development: hardcoded cross-subdomain cookie
    return '.localtest.me'
  }
  // Production: from .env file
  const envDomain = import.meta.env.VITE_SESSION_DOMAIN
  return envDomain || '.domain.com'
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
      deleteCookie('astral_session', { domain: getSessionDomain(), path: '/' })
      return { isAuthenticated: false }
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    return { isAuthenticated: false }
  }
}

export function redirectToLogin(): void {
  window.location.href = `${getBaseUrl()}/login`
}
