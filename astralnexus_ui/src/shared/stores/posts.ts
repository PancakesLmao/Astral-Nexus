import { defineStore } from 'pinia'
import { Post, User, CreatePostRequest, Comment } from '@/shared/types'
import { apiClient } from '@/shared/api'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
    isLoading: false,
    isCreating: false,
    selectedPost: null as Post | null,
    postComments: [] as Comment[],
    loadingComments: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    // Filter state
    currentFilter: {
      game_category: 'all_games', // Default to showing all posts
      search: '',
      sort_by: 'created_at',
      sort_order: 'DESC',
    },
  }),

  getters: {
    filteredPosts: (state) => {
      // Since we're doing server-side filtering, just return all posts
      // The server already filtered them based on the current filter
      return state.posts
    },

    hasMorePosts: (state) => state.pagination.hasNext,
  },

  actions: {
    // Set filter and fetch posts
    async setFilter(filter: {
      game_category?: string
      search?: string
      sort_by?: string
      sort_order?: string
    }) {
      console.log('Setting filter:', filter)
      this.currentFilter = { ...this.currentFilter, ...filter }
      await this.fetchPosts({ page: 1, ...this.currentFilter })
    },

    async fetchPosts(params?: {
      page?: number
      limit?: number
      game_category?: string
      search?: string
      sort_by?: string
      sort_order?: string
    }) {
      this.isLoading = true
      try {
        // Handle special "all_games" category - don't send it to API as it should fetch all posts
        const apiParams = { ...params }
        if (apiParams.game_category === 'all_games') {
          delete apiParams.game_category
        }

        console.log('Fetching posts with params:', apiParams)
        const response = await apiClient.fetchPosts(apiParams)

        if (params?.page === 1 || !params?.page) {
          // If it's the first page, replace all posts
          this.posts = response.posts
        } else {
          // If it's a subsequent page, append posts (for load more functionality)
          this.posts.push(...response.posts)
        }

        this.pagination = response.pagination

        console.log('Posts fetched successfully:', response.posts.length, 'posts')
        return response
      } catch (error) {
        console.error('Failed to fetch posts:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createPost(postData: CreatePostRequest, author: User) {
      this.isCreating = true
      try {
        // Map frontend format to backend format
        const backendData = {
          title: postData.title,
          content: postData.content,
          game_id: postData.game_id,
          post_type: postData.post_type || 'Discussion',
          tags: postData.tags || [],
          visibility: postData.visibility || 'public',
        }

        const response = await apiClient.createPost(backendData)

        // The API might only return metadata, so we need to refresh posts
        // to get the full post object. For now, create a temporary post.
        const tempPost: Post = {
          id: response.id || Date.now().toString(),
          title: postData.title,
          content: postData.content,
          author: author,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          game_category: postData.game_id || '',
          post_type: postData.post_type || 'Discussion',
          tags: postData.tags || [],
          visibility: postData.visibility || 'public',
          comments_count: 0,
          likes_count: 0,
          shares_count: 0,
          is_liked: false,
          is_bookmarked: false,
        }

        // Add to the beginning of posts array
        this.posts.unshift(tempPost)

        // Refresh posts from API to get the accurate data
        setTimeout(() => {
          this.fetchPosts({ page: 1, ...this.currentFilter })
        }, 1000)

        console.log('Post created successfully:', tempPost.id)
        return tempPost
      } catch (error) {
        console.error('Failed to create post:', error)
        throw error
      } finally {
        this.isCreating = false
      }
    },

    async likePost(postId: string) {
      try {
        const postIndex = this.posts.findIndex((p) => p.id === postId)
        if (postIndex === -1) return

        // Optimistic update
        const post = this.posts[postIndex]
        const wasLiked = post.is_liked
        post.is_liked = !wasLiked
        post.likes_count = wasLiked
          ? Math.max(0, (post.likes_count || 0) - 1)
          : (post.likes_count || 0) + 1

        // Call API
        await apiClient.likePost(postId)

        console.log('Post like toggled:', postId)
      } catch (error) {
        // Revert optimistic update on error
        const postIndex = this.posts.findIndex((p) => p.id === postId)
        if (postIndex !== -1) {
          const post = this.posts[postIndex]
          post.is_liked = !post.is_liked
          post.likes_count = post.is_liked
            ? (post.likes_count || 0) + 1
            : Math.max(0, (post.likes_count || 0) - 1)
        }
        console.error('Failed to like post:', error)
        throw error
      }
    },

    // Post detail methods
    openPostDetail(post: Post) {
      this.selectedPost = post
      this.loadComments(post.id)
    },

    closePostDetail() {
      this.selectedPost = null
      this.postComments = []
    },

    async loadComments(postId: string | number) {
      this.loadingComments = true
      try {
        // TODO: Implement real comments API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock comments for now
        this.postComments = [
          {
            id: 1,
            content: 'Great post! Thanks for sharing your thoughts.',
            author: {
              id: 201,
              username: 'commenter1',
              name: 'John Doe',
              created_at: '2024-01-01T00:00:00Z',
            },
            post_id: postId,
            created_at: new Date().toISOString(),
            likes_count: 2,
            is_liked: false,
          },
        ]
      } finally {
        this.loadingComments = false
      }
    },

    async submitComment(content: string, postId: string | number, author: User) {
      try {
        // Create new comment
        const newComment: Comment = {
          id: Date.now(),
          content,
          author,
          post_id: postId,
          created_at: new Date().toISOString(),
          likes_count: 0,
          is_liked: false,
        }

        // Add to comments list
        this.postComments.push(newComment)

        // Update post comment count
        const postIndex = this.posts.findIndex((p) => p.id === postId)
        if (postIndex !== -1) {
          this.posts[postIndex].comments_count = (this.posts[postIndex].comments_count || 0) + 1
        }

        console.log('Comment submitted:', content)
        return newComment
      } catch (error) {
        console.error('Failed to submit comment:', error)
        throw error
      }
    },

    async likeComment(commentId: number) {
      try {
        const commentIndex = this.postComments.findIndex((c) => c.id === commentId)
        if (commentIndex !== -1) {
          const comment = this.postComments[commentIndex]
          comment.is_liked = !comment.is_liked
          comment.likes_count = comment.is_liked
            ? (comment.likes_count || 0) + 1
            : Math.max(0, (comment.likes_count || 0) - 1)
        }
      } catch (error) {
        console.error('Failed to like comment:', error)
        throw error
      }
    },

    async updatePost(id: string, updates: Partial<Post>) {
      // Update post logic
      const index = this.posts.findIndex((post) => post.id === id)
      if (index !== -1) {
        this.posts[index] = { ...this.posts[index], ...updates }
      }
    },

    async deletePost(id: string) {
      // Delete post logic
      this.posts = this.posts.filter((post) => post.id !== id)
    },

    // Reset posts (useful when filtering/searching)
    resetPosts() {
      this.posts = []
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      }
    },
  },
})
