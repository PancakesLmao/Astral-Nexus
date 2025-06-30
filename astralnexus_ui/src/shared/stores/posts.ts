import { defineStore } from 'pinia'

export interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
}

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
  }),

  actions: {
    async fetchPosts() {
      // Fetch posts logic
    },

    async createPost(post: Omit<Post, 'id' | 'createdAt'>) {
      // Create post logic
    },

    async updatePost(id: string, updates: Partial<Post>) {
      // Update post logic
    },

    async deletePost(id: string) {
      // Delete post logic
    },
  },
})
