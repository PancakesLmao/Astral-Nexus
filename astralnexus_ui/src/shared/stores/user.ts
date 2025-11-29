import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/shared/lib/supabase'
import { getApiUrl, getLoginUrl } from '@/shared/utils'
import type { User } from '@/shared/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.name || '')
  const userPicture = computed(() => user.value?.picture || '')

  const fetchUser = async () => {
    try {
      loading.value = true
      error.value = null

      // Get Supabase session directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        return { isAuthenticated: false }
      }

      if (!session?.user) {
        console.log('No Supabase session found')
        return { isAuthenticated: false }
      }

      // Convert Supabase user to our User type
      const supabaseUser = session.user
      const userData: User = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name ||
              supabaseUser.user_metadata?.name ||
              supabaseUser.user_metadata?.global_name ||
              supabaseUser.user_metadata?.username ||
              'Unknown User',
        email: supabaseUser.email || '',
        picture: supabaseUser.user_metadata?.avatar_url ||
                 supabaseUser.user_metadata?.picture ||
                 `https://cdn.discordapp.com/avatars/${supabaseUser.id}/${supabaseUser.user_metadata?.avatar}.png` ||
                 `https://cdn.discordapp.com/embed/avatars/${(supabaseUser.user_metadata?.discriminator || 0) % 5}.png`
      }

      user.value = userData
      console.log('User loaded from Supabase:', userData.name)
      return { isAuthenticated: true, user: userData }

    } catch (err) {
      console.error('Failed to fetch user from Supabase:', err)
      error.value = 'Failed to load user data'
      return { isAuthenticated: false }
    } finally {
      loading.value = false
    }
  }

  const handleLogout = async () => {
    try {
      // Call backend logout to clear HTTP-only cookies
      await fetch(`${getApiUrl()}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies for session clearing
      })

      // Use Supabase sign out to clear localStorage session
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase logout error:', error)
      }

      // Clear local user state
      user.value = null
      window.location.href = getLoginUrl()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const initializeUser = async () => {
    if (!user.value && !loading.value) {
      console.log('Initializing user in store...')
      await fetchUser()
    } else {
      console.log('User already loaded in store:', { user: !!user.value, loading: loading.value })
    }
  }

  const clearUser = () => {
    user.value = null
    error.value = null
  }

  return {
    // State
    user,
    loading,
    error,

    // Getters
    isAuthenticated,
    userName,
    userPicture,

    // Actions
    fetchUser,
    handleLogout,
    initializeUser,
    clearUser,
  }
})
