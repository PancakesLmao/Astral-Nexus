<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProfileHeader from '../../shared/components/ProfileHeader.vue'
import ProfileTabs from '../../shared/components/ProfileTabs.vue'
import ProfilePosts from '../../shared/components/ProfilePosts.vue'
import PostDetail from '../../shared/components/PostDetail.vue'
import { API_BASE_URL, apiClient } from '../../shared/api'
import { checkUserAuth, redirectToLogin } from '../../shared/utils'
import type { Post, User } from '../../shared/types'

// User data from auth/me API
const user = ref<User | null>(null)
const loading = ref(true)

// Posts data
const posts = ref<Post[]>([])
const loadingPosts = ref(false)
const loadingMorePosts = ref(false)
const hasMorePosts = ref(true)
const currentPage = ref(1)

// Post detail modal
const selectedPost = ref<Post | null>(null)
const showPostDetail = ref(false)

const tabs = [
  { id: 'posts', label: 'Posts' },
  { id: 'comments', label: 'Comments' },
  { id: 'activity', label: 'Activity' },
]

onMounted(async () => {
  await fetchUser()
})

const fetchUser = async () => {
  try {
    loading.value = true

    const { isAuthenticated, user: userData } = await checkUserAuth(API_BASE_URL)

    if (!isAuthenticated) {
      console.log('Profile: User not authenticated, redirecting to login')
      redirectToLogin()
      return
    }

    user.value = userData
    console.log('Profile: User loaded:', userData.name)

    await fetchUserPosts()
  } catch (err) {
    console.error('Profile: Failed to fetch user:', err)
    redirectToLogin()
  } finally {
    loading.value = false
  }
}

const fetchUserPosts = async (page = 1) => {
  if (!user.value) return

  try {
    if (page === 1) {
      loadingPosts.value = true
    } else {
      loadingMorePosts.value = true
    }

    const response = await apiClient.fetchUserPosts(user.value.id, {
      page,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc',
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
    // Update the post in the list
    const index = posts.value.findIndex((p) => p.id === post.id)
    if (index !== -1) {
      posts.value[index] = {
        ...posts.value[index],
        is_liked: !posts.value[index].is_liked,
        likes_count: posts.value[index].is_liked
          ? (posts.value[index].likes_count || 0) - 1
          : (posts.value[index].likes_count || 0) + 1,
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
}

const handleShowPostOptions = (post: Post) => {
  console.log('Show options for post:', post.id)
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
      @close="handleClosePostDetail"
      @toggleLike="handleToggleLike"
      @toggleComments="handleToggleComments"
      @sharePost="handleSharePost"
      @showPostOptions="handleShowPostOptions"
    />
  </div>
</template>
