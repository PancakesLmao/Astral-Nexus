<template>
  <div id="home" class="px-5 py-0">
    <!-- Content list -->
    <PostList
      :posts="posts"
      :loading="isLoading"
      :loading-more="isLoadingMore"
      :has-more="hasMorePosts"
      @select-post="openPostDetail"
      @toggle-like="handleLike"
      @toggle-comments="handleComments"
      @share-post="handleShare"
      @show-post-options="showPostOptions"
      @load-more="loadMorePosts"
    />
    <PostDetail
      :is-open="showPostDetail"
      :post="selectedPost"
      :comments="postComments"
      :current-user="currentUser"
      :loading-comments="loadingComments"
      :allow-comments="true"
      @close="closePostDetail"
      @submit-comment="submitComment"
      @reply-to-comment="handleReply"
      @toggle-comment-like="handleCommentLike"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PostList from '@/shared/components/PostList.vue'
import PostDetail from '@/shared/components/PostDetail.vue'
import { usePostsStore } from '@/shared/stores/posts'
import { useUser } from '@/shared/composables/useUser'
import type { Post, Comment } from '@/shared/types'

// Store
const postsStore = usePostsStore()

// User management
const { user: currentUser, initializeUser } = useUser()

// Computed properties from store
const posts = computed(() => postsStore.filteredPosts) // Use filtered posts instead of raw posts
const isLoading = computed(() => postsStore.isLoading)
const hasMorePosts = computed(() => postsStore.hasMorePosts)
const showPostDetail = computed(() => !!postsStore.selectedPost)
const selectedPost = computed(() => postsStore.selectedPost)
const postComments = computed(() => postsStore.postComments)
const loadingComments = computed(() => postsStore.loadingComments)

// Component state
const isLoadingMore = ref(false)

// Methods - now just delegate to store
const fetchPosts = async (loadMore = false) => {
  try {
    if (loadMore) {
      const nextPage = postsStore.pagination.page + 1
      await postsStore.fetchPosts({
        page: nextPage,
        limit: 10,
        ...postsStore.$state.currentFilter,
      })
    } else {
      // For initial load, use the store's initialization method
      await postsStore.initializePosts()
    }
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  }
}

const openPostDetail = (post: Post) => {
  postsStore.openPostDetail(post)
}

const closePostDetail = () => {
  postsStore.closePostDetail()
}

// Like handler that uses the store directly for consistency with PostDetail
const handleLike = async (post: Post) => {
  try {
    await postsStore.likePost(post.id.toString())
  } catch (error) {
    console.error('Failed to like post:', error)
  }
}

const handleComments = (post: Post) => {
  openPostDetail(post)
}

const handleShare = (post: Post) => {
  console.log('Sharing post:', post.id)
  navigator.clipboard.writeText(`Check out this post: ${post.title}`)
  // Could show toast notification here
}

const showPostOptions = (post: Post) => {
  console.log('Show options for post:', post.id)
  // Implement options menu (edit, delete, report, etc.)
}

const loadMorePosts = async () => {
  if (isLoadingMore.value || !hasMorePosts.value) return

  isLoadingMore.value = true
  try {
    await fetchPosts(true) // Load more posts
  } finally {
    isLoadingMore.value = false
  }
}

const submitComment = async (content: string, postId: number | string) => {
  if (!currentUser.value) {
    console.error('User not authenticated')
    return
  }

  try {
    await postsStore.submitComment(content, postId)
  } catch (error) {
    console.error('Failed to submit comment:', error)
  }
}

const handleReply = (comment: Comment) => {
  console.log('Reply to comment:', comment.id)
}

const handleCommentLike = async (comment: Comment) => {
  try {
    await postsStore.likeComment(comment.id.toString())
  } catch (error) {
    console.error('Failed to like comment:', error)
  }
}

onMounted(async () => {
  console.log('HomeView mounted, initializing user and posts...')
  await initializeUser()
  await postsStore.initializePosts()
})
</script>
<style scoped></style>
