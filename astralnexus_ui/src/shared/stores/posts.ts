import { defineStore } from 'pinia'
import { Post, User, CreatePostRequest } from '@/shared/types'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
    isLoading: false,
  }),

  actions: {
    async fetchPosts() {
      // Fetch posts logic
    },

    async createPost(postData: CreatePostRequest, author: User) {
      // Create post logic
      const newPost: Post = {
        id: Date.now().toString(), // Simulating ID generation
        title: postData.title,
        content: postData.content,
        author: author,
        created_at: new Date().toISOString(),
        game_category: postData.game_category || '',
        post_type: postData.post_type || 'general',
        tags: postData.tags || [],
        visibility: postData.visibility || 'public',
        comments_count: 0,
        likes_count: 0,
        shares_count: 0,
        is_liked: false,
        is_bookmarked: false,
      }
      this.posts.unshift(newPost) // Add to beginning of array
      return newPost
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
  },
})
