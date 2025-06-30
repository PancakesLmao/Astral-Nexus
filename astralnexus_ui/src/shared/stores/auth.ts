import { defineStore } from 'pinia'

export interface User {
  id: string
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
  }),

  actions: {
    async login(credentials: { username: string; password: string }) {
      // Login logic
    },

    async logout() {
      this.user = null
      this.isAuthenticated = false
    },

    async register(userData: { username: string; email: string; password: string }) {
      // Registration logic
    },
  },
})
