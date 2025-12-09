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

  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`
  }

  if (options.secure) {
    cookieString += `; Secure`
  }

  if (options.httpOnly) {
    cookieString += `; HttpOnly`
  }

  console.log(`[setCookie] Setting: ${name}`, { options, cookieString })
  document.cookie = cookieString

  // Verify it was set
  setTimeout(() => {
    const cookieValue = getCookie(name)
    if (cookieValue) {
      console.log(`[setCookie] ✅ Successfully set ${name}`)
    } else {
      console.warn(`[setCookie] ❌ Failed to set ${name} - Browser rejected it`)
    }
  }, 100)
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
// URL Configuration - Single Source of Truth
// ============================================
// All URLs are derived from environment variables in .env.local
// This allows for easy configuration in any environment (dev, staging, production)
// without changing code.
//
// Required Environment Variables:
//   - VITE_API_URL: Backend API endpoint
//   - VITE_APP_URL: Main frontend URL
//
// Optional (will be derived if not set):
//   - VITE_BLOG_URL: Blog subdomain/path
//   - VITE_ADMIN_URL: Admin subdomain/path

/**
 * Get the backend API URL
 * Falls back to localhost:3001 if not configured
 */
export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001'
}

/**
 * Get the main app URL
 * Falls back to localtest.me:3000 for development
 */
export function getAppUrl(): string {
  return import.meta.env.VITE_APP_URL || 'http://localtest.me:3000'
}

/**
 * Get the blog URL
 * Defaults to {VITE_APP_URL}/blog if not explicitly set
 */
export function getBlogUrl(): string {
  if (import.meta.env.VITE_BLOG_URL) {
    return import.meta.env.VITE_BLOG_URL
  }
  // Default to path-based routing
  return `${getAppUrl()}/blog`
}

/**
 * Get the admin URL
 * Defaults to {VITE_APP_URL}/admin if not explicitly set
 */
export function getAdminUrl(): string {
  if (import.meta.env.VITE_ADMIN_URL) {
    return import.meta.env.VITE_ADMIN_URL
  }
  // Default to path-based routing
  return `${getAppUrl()}/admin`
}

/**
 * Get the session cookie domain for cross-subdomain auth
 * Extracts domain from VITE_APP_URL or falls back to .localtest.me
 *
 * Examples:
 *   http://localtest.me:3000 → .localtest.me
 *   https://astralnexus.com → .astralnexus.com
 *   http://localhost:3000 → localhost
 */
export function getSessionDomain(): string {
  const domain = import.meta.env.VITE_SESSION_DOMAIN
  console.log(`[getSessionDomain] Using domain from env: ${domain}`)

  if (!domain) {
    console.warn('[getSessionDomain] VITE_SESSION_DOMAIN not set in env, falling back to .localtest.me')
    return '.localtest.me'
  }

  return domain
}/**
 * Get the login URL
 */
export function getLoginUrl(): string {
  return `${getAppUrl()}/login`
}

// Authentication utilities - Updated for Supabase compatibility
export async function checkUserAuth(
  apiBaseUrl: string,
): Promise<{ isAuthenticated: boolean; user?: unknown }> {
  try {
    // Use the createAuthenticatedRequest function which properly handles Supabase tokens
    const { createAuthenticatedRequest } = await import('../api')

    const response = await createAuthenticatedRequest(`${apiBaseUrl}/api/auth/me`, {
      credentials: 'include', // This will include cookies for legacy sessions
    })

    console.log('checkUserAuth: Response status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('checkUserAuth: Success, user authenticated:', !!data.user)
      return { isAuthenticated: true, user: data.user }
    } else {
      console.log('checkUserAuth: Failed, response not ok')
      return { isAuthenticated: false }
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    return { isAuthenticated: false }
  }
}

export function redirectToLogin(): void {
  window.location.href = getLoginUrl()
}
