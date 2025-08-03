import { ref, type Ref } from 'vue'
import { apiClient } from '@/shared/api'
import type { Post } from '@/shared/types'

export function usePostInteractions(posts?: Ref<Post[]>) {
  const selectedPost = ref<Post | null>(null)
  const showPostDetail = ref(false)

  const handleSelectPost = (post: Post) => {
    selectedPost.value = post
    showPostDetail.value = true
  }

  const handleClosePostDetail = () => {
    showPostDetail.value = false
    selectedPost.value = null
  }

  const handleToggleLike = async (post: Post) => {
    // Store original values for rollback
    const originalLiked = post.is_liked
    const originalCount = post.likes_count || 0

    // Find post in array for updates
    let postIndex = -1
    if (posts?.value) {
      postIndex = posts.value.findIndex((p: Post) => p.id === post.id)
    }

    try {
      // Step 1: Immediate optimistic update for instant UX
      if (postIndex !== -1 && posts?.value) {
        posts.value[postIndex] = {
          ...posts.value[postIndex],
          is_liked: !originalLiked,
          likes_count: originalLiked ? Math.max(0, originalCount - 1) : originalCount + 1,
        }
      }

      // Step 2: Call API to persist the change
      await apiClient.likePost(post.id)
      console.log('Like action persisted to backend')

      // Step 3: AJAX Request - Fetch the real post state from server
      const updatedPost = await apiClient.fetchSinglePost(post.id)
      console.log('AJAX sync - Real state from server:', {
        is_liked: updatedPost.is_liked,
        likes_count: updatedPost.likes_count,
      })

      // Step 4: Apply the server's truth to frontend
      if (postIndex !== -1 && posts?.value) {
        posts.value[postIndex] = {
          ...posts.value[postIndex],
          is_liked: updatedPost.is_liked,
          likes_count: updatedPost.likes_count,
        }
      }

      console.log('Frontend synced with database truth')
    } catch (error) {
      console.error('Failed to toggle like:', error)

      // Rollback optimistic update on error
      if (postIndex !== -1 && posts?.value) {
        posts.value[postIndex] = {
          ...posts.value[postIndex],
          is_liked: originalLiked,
          likes_count: originalCount,
        }
      }

      throw error
    }
  }

  const handleToggleComments = (post: Post) => {
    handleSelectPost(post)
  }

  const handleSharePost = (post: Post) => {
    console.log('Share post:', post.id)
    // TODO
  }

  const handleShowPostOptions = (post: Post) => {
    console.log('Show options for post:', post.id)
    // TODO
  }

  return {
    selectedPost,
    showPostDetail,
    handleSelectPost,
    handleClosePostDetail,
    handleToggleLike,
    handleToggleComments,
    handleSharePost,
    handleShowPostOptions,
  }
}
