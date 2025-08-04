import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE_URL } from '@/shared/api'
import { checkUserAuth, redirectToLogin } from '@/shared/utils'
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

      const { isAuthenticated, user: userData } = await checkUserAuth(API_BASE_URL)

      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login')
        redirectToLogin()
        return
      }

      user.value = userData as User
      console.log('User loaded in store:', (userData as User)?.name)
    } catch (err) {
      console.error('Failed to fetch user:', err)
      error.value = 'Failed to load user data'
      redirectToLogin()
    } finally {
      loading.value = false
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        localStorage.removeItem('astral_session')
        user.value = null
        window.location.href = 'http://localtest.me:3000/login'
      } else {
        console.error('Logout failed')
      }
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
