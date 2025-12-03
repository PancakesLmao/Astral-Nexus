<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ProfileHeader from '../../shared/components/ProfileHeader.vue'
import ProfileTabs from '../../shared/components/ProfileTabs.vue'
import ProfilePosts from '../../shared/components/ProfilePosts.vue'
import PostDetail from '../../shared/components/PostDetail.vue'
import PostOptions from '../../shared/components/PostOptions.vue'
import { apiClient } from '../../shared/api'
import { useUser } from '../../shared/composables/useUser'
import { usePostInteractions } from '../../shared/composables/usePostInteractions'
import { useLanguageStore } from '../../shared/stores/language'
import { usePostsStore } from '../../shared/stores/posts'
import type { Post, Comment } from '../../shared/types'

// Language store
const languageStore = useLanguageStore()

// Posts store for comments
const postsStore = usePostsStore()

// User management
const { user, loading, initializeUser } = useUser()

// Posts data
const posts = ref<Post[]>([])
const loadingPosts = ref(false)
const loadingMorePosts = ref(false)
const hasMorePosts = ref(true)
const currentPage = ref(1)

// Comments data
const comments = ref<Comment[]>([])
const loadingComments = ref(false)

// Post interactions
const postInteractions = usePostInteractions(posts)

// Use most of the interactions from composable, but override handleShowPostOptions
const {
  selectedPost,
  showPostDetail,
  handleSelectPost: baseHandleSelectPost,
  handleClosePostDetail,
  handleToggleLike,
  handleToggleComments,
  handleSharePost,
} = postInteractions

// Override handleSelectPost to also load comments
const handleSelectPost = async (post: Post) => {
  baseHandleSelectPost(post)
  // Load comments when post is opened
  await loadCommentsForPost(post.id)
}

const loadCommentsForPost = async (postId: string) => {
  loadingComments.value = true
  try {
    comments.value = await apiClient.fetchComments(postId)
  } catch (error) {
    console.error('Failed to load comments:', error)
    comments.value = []
  } finally {
    loadingComments.value = false
  }
}

const submitComment = async (content: string, postId: string | number) => {
  try {
    await postsStore.submitComment(content, postId)
    // Reload comments after submission
    await loadCommentsForPost(postId.toString())

    // Update comment count in the post
    const postIndex = posts.value.findIndex((p) => p.id === postId)
    if (postIndex !== -1) {
      posts.value[postIndex].comments_count = (posts.value[postIndex].comments_count || 0) + 1
    }
  } catch (error) {
    console.error('Failed to submit comment:', error)
  }
}

const handleReplyToComment = (comment: Comment) => {
  console.log('Reply to comment:', comment.id)
  // TODO: Implement reply functionality
}

const handleLikeUpdateFromDetail = (postId: string, isLiked: boolean, likesCount: number) => {
  const postIndex = posts.value.findIndex((p) => p.id === postId)
  if (postIndex !== -1) {
    posts.value[postIndex].is_liked = isLiked
    posts.value[postIndex].likes_count = likesCount
  }
  // Also update selectedPost if it's the same post
  if (selectedPost.value && selectedPost.value.id === postId) {
    selectedPost.value.is_liked = isLiked
    selectedPost.value.likes_count = likesCount
  }
}

const tabs = computed(() => [
  { id: 'posts', label: languageStore.t('posts') },
  { id: 'comments', label: languageStore.t('comments') },
  { id: 'activity', label: languageStore.t('activity') },
])

onMounted(async () => {
  await initializeUser()
  if (user.value) {
    await fetchUserPosts()
  }
})

const fetchUserPosts = async (page = 1) => {
  if (!user.value) return

  try {
    if (page === 1) {
      loadingPosts.value = true
    } else {
      loadingMorePosts.value = true
    }

    const response = await apiClient.fetchUserProfilePosts(user.value.id, {
      page,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'DESC',
    })

    if (page === 1) {
      posts.value = response.posts
    } else {
      posts.value.push(...response.posts)
    }

    hasMorePosts.value = response.pagination.hasNext
    currentPage.value = page
  } catch (error) {
    console.error('Failed to fetch user posts:', error)
  } finally {
    loadingPosts.value = false
    loadingMorePosts.value = false
  }
}

const loadMorePosts = async () => {
  await fetchUserPosts(currentPage.value + 1)
}

const handleDeletePost = (postId: string | number) => {
  // Remove the deleted post from the list
  posts.value = posts.value.filter((p) => p.id !== postId)
}

// Post Options state
const showPostOptions = ref(false)
const optionsPost = ref<Post | null>(null)
const optionsPosition = ref({ top: 0, left: 0 })
const isOptionsOwner = computed(() => {
  if (!optionsPost.value || !user.value) return false
  console.log('Profile: Checking ownership', {
    postAuthorId: optionsPost.value.author_id,
    userId: user.value.id,
    isOwner: optionsPost.value.author_id === user.value.id,
  })
  return optionsPost.value.author_id === user.value.id
})

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
  posts.value = posts.value.filter((p) => p.id !== postId)
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
</script>

<template>
  <div id="profile" class="min-h-screen bg-[#0a0b0f]">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8aff7]"></div>
    </div>

    <div v-else-if="user" class="max-w-4xl mx-auto px-4 py-6">
      <!-- Profile Header -->
      <ProfileHeader :user="user" :isFollowing="false" />

      <!-- Profile Tabs -->
      <ProfileTabs :tabs="tabs">
        <template #default="{ activeTab }">
          <!-- Posts Tab -->
          <div v-if="activeTab === 'posts'">
            <ProfilePosts
              :posts="posts"
              :loading="loadingPosts"
              :loadingMore="loadingMorePosts"
              :hasMore="hasMorePosts"
              @selectPost="handleSelectPost"
              @toggleLike="handleToggleLike"
              @toggleComments="handleToggleComments"
              @sharePost="handleSharePost"
              @showPostOptions="handleShowPostOptions"
              @loadMore="loadMorePosts"
            />
          </div>

          <!-- Comments Tab -->
          <div v-else-if="activeTab === 'comments'" class="text-center py-12 text-gray-400">
            <p class="text-lg mb-2 text-[#b8aff7]">Comments feature coming soon!</p>
            <p class="text-sm text-gray-600">View and manage your comments here.</p>
          </div>

          <!-- Activity Tab -->
          <div v-else-if="activeTab === 'activity'" class="text-center py-12 text-gray-400">
            <p class="text-lg mb-2 text-[#b8aff7]">Activity tracking coming soon!</p>
            <p class="text-sm text-gray-600">See your activity timeline and engagement metrics.</p>
          </div>
        </template>
      </ProfileTabs>
    </div>

    <!-- Error state -->
    <div v-else class="text-center py-12 text-gray-400">
      <p class="text-lg mb-2 text-[#b8aff7]">Unable to load profile</p>
      <p class="text-sm text-gray-600">Please try refreshing the page.</p>
    </div>

    <!-- Post Detail Modal -->
    <PostDetail
      :isOpen="showPostDetail"
      :post="selectedPost"
      :comments="comments"
      :currentUser="user"
      :loadingComments="loadingComments"
      @close="handleClosePostDetail"
      @toggleComments="handleToggleComments"
      @sharePost="handleSharePost"
      @showPostOptions="handleShowPostOptions"
      @deletePost="handleDeletePost"
      @submitComment="submitComment"
      @replyToComment="handleReplyToComment"
      @likeUpdate="handleLikeUpdateFromDetail"
    />

    <!-- Post Options Menu -->
    <PostOptions
      :is-open="showPostOptions"
      :post="optionsPost"
      :position="optionsPosition"
      :is-owner="isOptionsOwner"
      :user-id="user?.id"
      @close="closePostOptions"
      @delete="handlePostDelete"
      @edit="handlePostEdit"
      @report="handlePostReport"
    />
  </div>
</template>
