import { defineStore } from 'pinia'
import { getApiUrl } from '../utils'

const API_BASE_URL = getApiUrl()

export interface User {
  id: string
  email: string
  name: string
  picture: string
  provider: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    isLoading: false,
  }),

  actions: {
    async checkAuth() {
      this.isLoading = true
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          this.user = data.user
          this.isAuthenticated = true
          console.log('User authenticated:', this.user)
        } else {
          this.user = null
          this.isAuthenticated = false
          console.log('User not authenticated')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        this.user = null
        this.isAuthenticated = false
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        this.user = null
        this.isAuthenticated = false
        console.log('User logged out')

        // Redirect to root page after logout
        window.location.href = '/'
      } catch (error) {
        console.error('Logout failed:', error)
        // Still clear local state even if API call fails
        this.user = null
        this.isAuthenticated = false
      }
    },

    // OAuth login functions
    loginWithDiscord(language = 'en') {
      const authUrl = `${API_BASE_URL}/auth/discord?lang=${language}`
      window.location.href = authUrl
    },

    async refreshSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          // Session is still valid, check current user
          await this.checkAuth()
          return true
        } else {
          // Session expired, clear auth state
          this.user = null
          this.isAuthenticated = false
          return false
        }
      } catch (error) {
        console.error('Session refresh failed:', error)
        this.user = null
        this.isAuthenticated = false
        return false
      }
    },
  },

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    userPicture: (state) => state.user?.picture || '',
    userProvider: (state) => state.user?.provider || '',
  },
})
