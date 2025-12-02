import { createClient } from '@supabase/supabase-js'
import type { SupabaseClientOptions } from '@supabase/supabase-js'
import { getSessionDomain, getAppUrl } from '../utils'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

/**
 * Cookie Chunking:
 * Supabase sessions (JWT + refresh token + metadata) can exceed 4KB browser cookie limit.
 * This implementation automatically splits large values into multiple cookies with sequential
 * names (e.g., sb-auth-token_0, sb-auth-token_1, etc.) and reassembles them on retrieval.
 */


const MAX_COOKIE_SIZE = 3800 // Leave some room for cookie metadata (4096 bytes limit)

const cookieStorage = {
  getItem: (key: string): string | null => {
    try {
      const cookies = document.cookie.split(';')
      const cookieMap = new Map<string, string>()

      // Collect all cookies for this key (including chunked parts)
      for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.trim().split('=')
        if (name) {
          cookieMap.set(name, valueParts.join('='))
        }
      }

      // Check if main cookie exists
      if (cookieMap.has(key)) {
        const value = decodeURIComponent(cookieMap.get(key)!)
        console.log(`[Cookie Storage] ✅ Retrieved ${key} (length: ${value.length})`)
        return value
      }

      // Check for chunked cookies (key_0, key_1, key_2, etc.)
      const chunks: string[] = []
      let chunkIndex = 0

      while (cookieMap.has(`${key}_${chunkIndex}`)) {
        chunks.push(decodeURIComponent(cookieMap.get(`${key}_${chunkIndex}`)!))
        chunkIndex++
      }

      if (chunks.length > 0) {
        const value = chunks.join('')
        console.log(`[Cookie Storage] ✅ Retrieved ${key} from ${chunks.length} chunks (total length: ${value.length})`)
        return value
      }

      console.log(`[Cookie Storage] ❌ Key not found: ${key}`)
      return null
    } catch (e) {
      console.error(`[Cookie Storage] ⚠️ Error getting ${key}:`, e)
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      const domain = getSessionDomain()
      const maxAge = 60 * 60 * 24 * 7 // 7 days
      const cookieAttributes = `; path=/; domain=${domain}; max-age=${maxAge}; SameSite=Lax`

      // Clear any existing chunked cookies for this key
      cookieStorage.removeItem(key)

      const encodedValue = encodeURIComponent(value)

      // If value fits in one cookie, use simple storage
      if (encodedValue.length <= MAX_COOKIE_SIZE) {
        document.cookie = `${key}=${encodedValue}${cookieAttributes}`
      } else {
        // Split into chunks
        const chunks = []
        for (let i = 0; i < encodedValue.length; i += MAX_COOKIE_SIZE) {
          chunks.push(encodedValue.slice(i, i + MAX_COOKIE_SIZE))
        }

        // Store each chunk
        chunks.forEach((chunk, index) => {
          document.cookie = `${key}_${index}=${chunk}${cookieAttributes}`
        })
      }

      // Verify storage
      setTimeout(() => {
        const verification = cookieStorage.getItem(key)
        if (verification && verification === value) {
          console.log(`[Cookie Storage] Verified ${key} was stored correctly`)
        } else {
          console.error(`[Cookie Storage] ⚠️ Verification failed for ${key}!`)
        }
      }, 100)
    } catch (e) {
      console.error(`[Cookie Storage] ⚠️ Error setting ${key}:`, e)
    }
  },

  removeItem: (key: string): void => {
    try {
      const domain = getSessionDomain()
      const expiredCookie = `; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`

      // Remove main cookie
      document.cookie = `${key}=${expiredCookie}`

      // Remove any chunked cookies
      let chunkIndex = 0
      const cookies = document.cookie.split(';')
      const cookieNames = cookies.map(c => c.trim().split('=')[0])

      while (cookieNames.includes(`${key}_${chunkIndex}`)) {
        document.cookie = `${key}_${chunkIndex}=${expiredCookie}`
        chunkIndex++
      }

      if (chunkIndex > 0) {
        console.log(`[Cookie Storage] ✅ Removed ${key} and ${chunkIndex} chunks`)
      } else {
        console.log(`[Cookie Storage] ✅ Removed ${key}`)
      }
    } catch (e) {
      console.error(`[Cookie Storage] ⚠️ Error removing ${key}:`, e)
    }
  }
}

const supabaseOptions: SupabaseClientOptions<'public'> = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: cookieStorage,
    storageKey: 'sb-auth-token'
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)

// Auth helper functions
export const signInWithDiscord = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${getAppUrl()}/callback`,  // Redirect to callback route for OAuth handling
      skipBrowserRedirect: false,
    },
  })

  if (error) {
    console.error('Discord OAuth error:', error)
    throw error
  }

  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
  // Redirect to landing page after sign out
  window.location.href = getAppUrl()
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getCurrentSession = () => {
  return supabase.auth.getSession()
}
