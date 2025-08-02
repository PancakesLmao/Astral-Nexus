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
    try {
      await apiClient.likePost(post.id)
      // Update the post in the list if posts array is provided
      if (posts?.value) {
        const index = posts.value.findIndex((p: Post) => p.id === post.id)
        if (index !== -1) {
          posts.value[index] = {
            ...posts.value[index],
            is_liked: !posts.value[index].is_liked,
            likes_count: posts.value[index].is_liked
              ? (posts.value[index].likes_count || 0) - 1
              : (posts.value[index].likes_count || 0) + 1,
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
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
