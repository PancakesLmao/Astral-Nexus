<template>
  <div
    class="user-sidebar fixed bg-[#0a0b0f] border-r border-white/10 top-0 left-0 w-[280px] h-screen z-[1000] overflow-y-auto p-6"
    style="scrollbar-width: none; -ms-overflow-style: none"
  >
    <!-- Profile header -->
    <div class="profile-header relative mb-8" v-if="user">
      <div class="profile-background"></div>
      <div class="profile-content relative z-[2] pt-8 text-center">
        <div class="profile-avatar-container relative inline-block mb-4">
          <img
            :src="user.picture"
            :alt="user.name"
            class="profile-avatar-large w-20 h-20 rounded-full border-4 border-[#b8aff7] object-cover bg-[#270c3b]"
          />
          <div
            class="online-indicator absolute bottom-1 right-1 w-4 h-4 bg-[#00ff88] border-2 border-[#0a0b0f] rounded-full"
          ></div>
        </div>
        <div class="profile-info text-white">
          <h3 class="profile-name text-xl font-semibold text-[#b8aff7] mb-1">{{ user.name }}</h3>
          <p class="profile-username text-sm text-gray-600 mb-2">@{{ user.username || 'user' }}</p>
          <p class="profile-bio text-sm text-gray-400 leading-tight" v-if="user.bio">
            {{ user.bio }}
          </p>
          <p class="profile-bio text-sm text-gray-400 leading-tight" v-else>
            Exploring the gaming universe
          </p>
        </div>
      </div>
    </div>

    <!-- User stats -->
    <div class="user-stats mb-8" v-if="user">
      <div class="stats-grid grid grid-cols-2 gap-4">
        <div class="stat-item text-center">
          <div class="stat-number text-3xl font-semibold text-[#b8aff7] leading-none">
            {{ userStats.posts }}
          </div>
          <div class="stat-label text-sm text-gray-600 mt-1 uppercase tracking-wider">
            {{ languageStore.t('posts') }}
          </div>
        </div>
        <div class="stat-item text-center">
          <div class="stat-number text-3xl font-semibold text-[#b8aff7] leading-none">
            {{ userStats.following }}
          </div>
          <div class="stat-label text-sm text-gray-600 mt-1 uppercase tracking-wider">
            {{ languageStore.t('following') }}
          </div>
        </div>
        <div class="stat-item text-center">
          <div class="stat-number text-3xl font-semibold text-[#b8aff7] leading-none">
            {{ userStats.followers }}
          </div>
          <div class="stat-label text-sm text-gray-600 mt-1 uppercase tracking-wider">
            {{ languageStore.t('followers') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="recent-activity mb-8">
      <h4
        class="section-title text-base font-semibold text-[#b8aff7] mb-4 pb-2 border-b border-[rgba(184,175,247,0.2)]"
      >
        {{ languageStore.t('recentActivity') }}
      </h4>
      <div class="activity-list">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="activity-item flex items-start gap-3 p-3 bg-[rgba(39,12,59,0.3)] border border-[rgba(184,175,247,0.1)] rounded-lg mb-3 transition-all duration-300"
        >
          <div
            class="activity-icon flex items-center justify-center w-7 h-7 bg-[rgba(184,175,247,0.2)] rounded-full text-[#b8aff7] flex-shrink-0"
          >
            <component :is="getActivityIcon(activity.type)" :size="16" />
          </div>
          <div class="activity-content flex-1 min-w-0">
            <p class="activity-text text-sm text-gray-400 mb-1 leading-tight">
              {{ activity.text }}
            </p>
            <span class="activity-time text-xs text-gray-600">{{
              formatTime(activity.timestamp)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions flex flex-col gap-3 mt-auto pt-4">
      <button
        class="action-btn primary flex items-center justify-center gap-2 py-3 px-4 rounded font-medium text-sm text-white bg-gradient-to-br from-[#542f87] to-[#b8aff7] cursor-pointer transition-all duration-300"
        @click="openCreatePostDialog"
      >
        <Plus :size="18" />
        <span>{{ languageStore.t('newPost') }}</span>
      </button>
      <button
        class="action-btn secondary flex items-center justify-center gap-2 py-3 px-4 rounded font-medium text-sm text-[#b8aff7] border border-[rgba(184,175,247,0.3)] bg-[rgba(184,175,247,0.1)] cursor-pointer transition-all duration-300"
        @click="editProfile"
      >
        <Edit :size="18" />
        <span>{{ languageStore.t('editProfile') }}</span>
      </button>
    </div>

    <!-- New Post Dialog -->
    <NewPost
      :isOpen="isCreatePostDialogOpen"
      :user="user"
      @close="isCreatePostDialogOpen = false"
      @created="handlePostCreated"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Heart, MessageCircle, BookOpen, Award } from 'lucide-vue-next'
import { useLanguageStore } from '@/shared/stores/language'
import { useUser } from '@/shared/composables/useUser'
import { UserStats, Activity } from '../types'
import NewPost from './NewPost.vue'
import type { Post } from '@/shared/types'

const router = useRouter()
const languageStore = useLanguageStore()
const { user, loading, initializeUser } = useUser()
const isCreatePostDialogOpen = ref(false)

// Mock user stats
const userStats = ref<UserStats>({
  posts: 42,
  following: 156,
  followers: 234,
})

// Mock recent activities
const recentActivities = ref<Activity[]>([
  {
    id: '1',
    type: 'like',
    text: 'Liked a post about Genshin Impact',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'comment',
    text: 'Commented on "Best HSR Teams"',
    timestamp: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    type: 'post',
    text: 'Posted about ZZZ beta experience',
    timestamp: '2024-01-14T16:45:00Z',
  },
  {
    id: '4',
    type: 'follow',
    text: 'Started following @genshin_master',
    timestamp: '2024-01-14T14:20:00Z',
  },
])

languageStore.initializeLanguage()

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'like':
      return Heart
    case 'comment':
      return MessageCircle
    case 'post':
      return BookOpen
    case 'follow':
      return Award
    default:
      return BookOpen
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}

const openCreatePostDialog = () => {
  console.log('Sidebar: Opening NewPost dialog')
  isCreatePostDialogOpen.value = true
}

const handlePostCreated = (post: Post) => {
  console.log('Sidebar: New post created:', post)
  // Update stats or activities if needed
  userStats.value.posts += 1
}

const editProfile = () => {
  console.log('Sidebar: Navigating to edit profile')
  router.push('/profile')
}

onMounted(() => {
  initializeUser()
})
</script>

<style scoped>
/* Profile Background (kept as raw CSS for gradient) */
.profile-background {
  position: absolute;
  top: 0;
  left: -1.5rem;
  right: -1.5rem;
  height: 120px;
  background: linear-gradient(135deg, #542f87 0%, #270c3b 50%, #b8aff7 100%);
  border-radius: 0 0 1rem 1rem;
  opacity: 0.8;
}

/* Activity Item Hover (kept as raw CSS for rgba) */
.activity-item:hover {
  background: rgba(39, 12, 59, 0.5);
  border-color: rgba(184, 175, 247, 0.2);
}

/* Action Button Primary Hover (kept as raw CSS for gradient) */
.action-btn.primary {
  background: linear-gradient(135deg, #6a3ba8, #c9c0ff);
  box-shadow: 0 4px 12px rgba(184, 175, 247, 0.3);
}

/* Action Button Secondary Hover (kept as raw CSS for rgba) */
.action-btn.secondary:hover {
  background: rgba(184, 175, 247, 0.2);
  border-color: rgba(184, 175, 247, 0.5);
}

/* Hide scrollbar */
.user-sidebar::-webkit-scrollbar {
  display: none;
}

/* Media Query (kept as raw CSS) */
@media (max-width: 991.98px) {
  .user-sidebar {
    display: none;
  }
}
</style>
