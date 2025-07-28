// Eden API client configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
import { GameCategory, GameCategoriesResponse } from '@/shared/types'

// API client setup
export class ApiClient {
  constructor(private baseUrl: string = API_BASE_URL) {}

  async fetchGameCategories(): Promise<GameCategory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/game-categories`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: GameCategoriesResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch game categories')
      }

      return data.data.categories
    } catch (error) {
      console.error('Error fetching game categories:', error)
      throw error
    }
  }
}

// Export a default instance
export const apiClient = new ApiClient()
