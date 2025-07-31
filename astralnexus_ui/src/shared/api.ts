// Eden API client configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
import { GameCategory, GameCategoriesResponse, Post, PostsApiResponse } from '@/shared/types'

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

  async fetchPosts(params?: {
    page?: number
    limit?: number
    game_category?: string
    search?: string
    sort_by?: string
    sort_order?: string
  }): Promise<{ posts: Post[]; pagination: any }> {
    try {
      const searchParams = new URLSearchParams()

      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.game_category) searchParams.append('game_category', params.game_category)
      if (params?.search) searchParams.append('search', params.search)
      if (params?.sort_by) searchParams.append('sort_by', params.sort_by)
      if (params?.sort_order) searchParams.append('sort_order', params.sort_order)

      const url = `${this.baseUrl}/api/posts${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PostsApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch posts')
      }

      return {
        posts: data.data.posts,
        pagination: data.data.pagination,
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  }

  async createPost(postData: {
    title: string
    content: string
    game_id?: string
    post_type?: string
    tags?: string[]
    visibility?: string
  }): Promise<Post> {
    try {
      // Filter out undefined values to avoid sending null to API
      const cleanedData = Object.fromEntries(
        Object.entries(postData).filter(([_, value]) => value !== undefined && value !== null),
      )

      const response = await fetch(`${this.baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers when auth is implemented
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create post')
      }

      // Return the created post data
      return data.data.post
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers when auth is implemented
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to like post')
      }
    } catch (error) {
      console.error('Error liking post:', error)
      throw error
    }
  }
}

// Export a default instance
export const apiClient = new ApiClient()
