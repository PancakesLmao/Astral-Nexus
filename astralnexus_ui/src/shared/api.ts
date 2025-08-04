// Eden API client configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://api.localtest.me:3001'
import {
  GameCategory,
  GameCategoriesResponse,
  Post,
  PostsApiResponse,
  PaginationInfo,
  Notification,
  NotificationsResponse,
  Comment,
} from '@/shared/types'

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
    author_id?: string
  }): Promise<{ posts: Post[]; pagination: PaginationInfo }> {
    try {
      const searchParams = new URLSearchParams()

      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.game_category) searchParams.append('game_category', params.game_category)
      if (params?.search) searchParams.append('search', params.search)
      if (params?.sort_by) searchParams.append('sort_by', params.sort_by)
      if (params?.sort_order) searchParams.append('sort_order', params.sort_order)
      if (params?.author_id) searchParams.append('author_id', params.author_id)

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

  async fetchUserPosts(
    userId: string,
    params?: {
      page?: number
      limit?: number
      sort_by?: string
      sort_order?: string
    },
  ): Promise<{ posts: Post[]; pagination: PaginationInfo }> {
    return this.fetchPosts({
      ...params,
      author_id: userId,
    })
  }

  async createPost(postData: {
    title: string
    content: string
    game_id?: string
    post_type?: string
    tags?: string[]
    visibility?: string
    published?: boolean
  }): Promise<{ id: string; created_at: string; updated_at: string }> {
    try {
      // Filter out undefined values to avoid sending null to API
      const cleanedData = Object.fromEntries(
        Object.entries(postData).filter(([, value]) => value !== undefined && value !== null),
      )

      const response = await fetch(`${this.baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
          console.error('Backend error response:', errorData)
        } catch {
          console.error('Could not parse error response')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create post')
      }

      // Return the created post basic data
      return data.data
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  async fetchSinglePost(postId: string): Promise<Post> {
    try {
      const response = await fetch(`${this.baseUrl}/api/posts/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch post')
      }

      return data.data.post
    } catch (error) {
      console.error('Error fetching single post:', error)
      throw error
    }
  }

  async likePost(postId: string): Promise<{ action: 'liked' | 'unliked' }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to like/unlike post')
      }

      return data.data
    } catch (error) {
      console.error('Error liking/unliking post:', error)
      throw error
    }
  }

  async likeComment(commentId: string): Promise<{ action: 'liked' | 'unliked' }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to like/unlike comment')
      }

      return data.data
    } catch (error) {
      console.error('Error liking/unliking comment:', error)
      throw error
    }
  }

  async fetchNotifications(params?: {
    user_id: string
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; pagination: PaginationInfo }> {
    try {
      const searchParams = new URLSearchParams()

      searchParams.append('user_id', params!.user_id)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())

      const url = `${this.baseUrl}/api/notifications?${searchParams.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: NotificationsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch notifications')
      }

      return {
        notifications: data.data.notifications,
        pagination: data.data.pagination,
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  async fetchUserStats(userId: string): Promise<{
    posts: number
    comments: number
    notifications: number
    following: number
    followers: number
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/stats/${userId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user statistics')
      }

      return data.data
    } catch (error) {
      console.error('Error fetching user statistics:', error)
      throw error
    }
  }

  async fetchComments(postId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/comments/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch comments')
      }

      return data.data
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  async createComment(commentData: { postId: string; content: string }): Promise<Comment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(commentData),
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
          console.error('Backend error response:', errorData)
        } catch {
          console.error('Could not parse error response')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create comment')
      }

      return data.data
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
