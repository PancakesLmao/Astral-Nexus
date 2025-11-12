import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import {
  supabase,
  signInWithDiscord,
  signOut,
  getCurrentSession,
} from '../lib/supabase'
import { getApiUrl, getBlogUrl, getAdminUrl } from '../utils'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isLoading = computed(() => loading.value)

  // Computed properties
  const isAdmin = computed(() => {
    // You can customize this based on your user roles
    return user.value?.user_metadata?.role === 'admin' || user.value?.email?.includes('admin') // Temporary check
  })

  // Computed getters - using Supabase user data directly
  const isLoggedIn = computed(() => isAuthenticated.value)
  const userName = computed(
    () => user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || '',
  )
  const userEmail = computed(() => user.value?.email || '')
  const userPicture = computed(
    () => user.value?.user_metadata?.avatar_url || '',
  )
  const userProvider = computed(() => 'discord')

  // Initialize auth state
  const initAuth = async () => {
    try {
      loading.value = true

      // Get existing Supabase session
      const { data: sessionData } = await getCurrentSession()
      if (sessionData.session) {
        session.value = sessionData.session
        user.value = sessionData.session.user
        console.log('Found existing Supabase session')
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, sessionData) => {
        console.log('Auth state change:', event, sessionData)

        session.value = sessionData
        user.value = sessionData?.user ?? null

        if (event === 'SIGNED_IN') {
          error.value = null
          // Don't auto-redirect here, let the component handle it
        } else if (event === 'SIGNED_OUT') {
          // Don't auto-redirect here, let the component handle it
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = err instanceof Error ? err.message : 'Authentication error'
    } finally {
      loading.value = false
    }
  }

  // Sign in with Discord
  const loginWithDiscord = async () => {
    try {
      loading.value = true
      error.value = null
      await signInWithDiscord()
    } catch (err) {
      console.error('Discord login error:', err)
      error.value = err instanceof Error ? err.message : 'Login failed'
      loading.value = false
      throw err
    }
  }

  // Sign out
  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      // Call backend logout to clear HTTP-only cookies
      await fetch(`${getApiUrl()}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies for session clearing
      })

      // Sign out from Supabase
      await signOut()
      user.value = null
      session.value = null
    } catch (err) {
      console.error('Logout error:', err)
      error.value = err instanceof Error ? err.message : 'Logout failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Handle successful login redirect
  const handleSuccessfulLogin = async () => {
    if (!user.value) return

    console.log('Handling successful login redirect...')

    // Check if user is admin
    if (isAdmin.value) {
      window.location.href = getAdminUrl()
    } else {
      // Regular user goes to blog
      window.location.href = getBlogUrl()
    }
  }

  // Get access token for API calls
  const getAccessToken = async () => {
    const { data } = await getCurrentSession()
    return data.session?.access_token
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Check authentication - Supabase only
  const checkAuth = async () => {
    try {
      loading.value = true

      const { data: sessionData } = await getCurrentSession()
      if (sessionData.session) {
        session.value = sessionData.session
        user.value = sessionData.session.user
        return true
      }

      // No authentication found
      user.value = null
      session.value = null
      return false
    } catch (err) {
      console.error('Check auth error:', err)
      error.value = err instanceof Error ? err.message : 'Authentication check failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Refresh session
  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession()
    return !!data.session
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    isAuthenticated,
    isLoading,

    // Computed getters
    isLoggedIn,
    userName,
    userEmail,
    userPicture,
    userProvider,
    isAdmin,

    // Actions
    initAuth,
    loginWithDiscord,
    logout,
    getAccessToken,
    clearError,
    handleSuccessfulLogin,
    checkAuth,
    refreshSession,
  }
})
