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
      @show-post-options="handleShowPostOptions"
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
    <PostOptions
      :is-open="showPostOptions"
      :post="optionsPost"
      :position="optionsPosition"
      :is-owner="isOptionsOwner"
      :user-id="currentUser?.id"
      @close="closePostOptions"
      @delete="handlePostDelete"
      @edit="handlePostEdit"
      @report="handlePostReport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PostList from '@/shared/components/PostList.vue'
import PostDetail from '@/shared/components/PostDetail.vue'
import PostOptions from '@/shared/components/PostOptions.vue'
import { usePostsStore } from '@/shared/stores/posts'
import { useUser } from '@/shared/composables/useUser'
import type { Post, Comment } from '@/shared/types'

// Store
const postsStore = usePostsStore()

// User management
const { user: currentUser, initializeUser } = useUser()

// Computed properties from store
const posts = computed(() => postsStore.filteredPosts)
const isLoading = computed(() => postsStore.isLoading)
const hasMorePosts = computed(() => postsStore.hasMorePosts)
const showPostDetail = computed(() => !!postsStore.selectedPost)
const selectedPost = computed(() => postsStore.selectedPost)
const postComments = computed(() => postsStore.postComments)
const loadingComments = computed(() => postsStore.loadingComments)

// Component state
const isLoadingMore = ref(false)

// Post Options state
const showPostOptions = ref(false)
const optionsPost = ref<Post | null>(null)
const optionsPosition = ref({ top: 0, left: 0 })
const isOptionsOwner = computed(() => {
  if (!optionsPost.value || !currentUser.value) {
    return false
  }
  const isOwner = optionsPost.value.author_id === currentUser.value.id
  console.log('[HomeView] Ownership check:', {
    postAuthorId: optionsPost.value.author_id,
    currentUserId: currentUser.value.id,
    isOwner,
  })
  return isOwner
})

// Methods
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
}

const handleShowPostOptions = (post: Post, event?: MouseEvent) => {
  optionsPost.value = post
  showPostOptions.value = true

  if (event) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    optionsPosition.value = {
      top: rect.bottom + 5,
      left: rect.left,
    }
  }
}

const closePostOptions = () => {
  showPostOptions.value = false
  optionsPost.value = null
}

const handlePostDelete = (postId: string | number) => {
  // Remove from posts array
  postsStore.$patch((state) => {
    state.posts = state.posts.filter((p) => p.id !== postId)
  })
  closePostOptions()
}

const handlePostEdit = (post: Post) => {
  console.log('Edit post:', post.id)
  // TODO: Implement edit functionality
}

const handlePostReport = (post: Post) => {
  console.log('Report post:', post.id)
  // TODO: Implement report functionality
}

const loadMorePosts = async () => {
  if (isLoadingMore.value || !hasMorePosts.value) return

  isLoadingMore.value = true
  try {
    await fetchPosts(true)
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
