<template>
  <div class="user-sidebar fixed bg-[#0a0b0f] border-r border-white/10">
    <!-- User Profile Header -->
    <div class="profile-header" v-if="user">
      <div class="profile-background"></div>
      <div class="profile-content">
        <div class="profile-avatar-container">
          <img :src="user.picture" :alt="user.name" class="profile-avatar-large" />
          <div class="online-indicator"></div>
        </div>
        <div class="profile-info">
          <h3 class="profile-name">{{ user.name }}</h3>
          <p class="profile-username">@{{ user.username || 'user' }}</p>
          <p class="profile-bio" v-if="user.bio">{{ user.bio }}</p>
          <p class="profile-bio" v-else>Exploring the gaming universe</p>
        </div>
      </div>
    </div>

    <!-- User Statistics -->
    <div class="user-stats" v-if="user">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ userStats.posts }}</div>
          <div class="stat-label">Posts</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.following }}</div>
          <div class="stat-label">Following</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.followers }}</div>
          <div class="stat-label">Followers</div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <h4 class="section-title">Recent Activity</h4>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <component :is="getActivityIcon(activity.type)" :size="16" />
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-btn primary" @click="createPost">
        <Plus :size="18" />
        <span>New Post</span>
      </button>
      <button class="action-btn secondary" @click="editProfile">
        <Edit :size="18" />
        <span>Edit Profile</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Heart, MessageCircle, BookOpen, Calendar, Award } from 'lucide-vue-next'
import { API_BASE_URL } from '@/shared/api'
import { useLanguageStore } from '@/shared/stores/language'
import { checkUserAuth, redirectToLogin } from '@/shared/utils'
import { UserStats, Activity } from '../types/user'

const router = useRouter()
const languageStore = useLanguageStore()
const user = ref<any>(null)
const loading = ref(false)

// Mock user stats
const userStats = ref<UserStats>({
  posts: 42,
  following: 156,
  followers: 234
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

const fetchUser = async () => {
  try {
    loading.value = true

    // Check if session ID is in URL (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search)
    const sessionFromUrl = urlParams.get('session')

    if (sessionFromUrl) {
      console.log('Sidebar: Setting session from URL:', sessionFromUrl)
      // Set session cookie for this domain
      document.cookie = `astral_session=${sessionFromUrl}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax; Domain=.localtest.me`
      localStorage.setItem('astral_session', sessionFromUrl)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Use shared authentication utility
    const { isAuthenticated, user: userData } = await checkUserAuth(API_BASE_URL)

    if (!isAuthenticated) {
      console.log('Sidebar: User not authenticated, redirecting to login')
      redirectToLogin()
      return
    }

    user.value = userData
    console.log('Sidebar: User loaded:', userData.name)
  } catch (err) {
    console.error('Sidebar: Failed to fetch user:', err)
    redirectToLogin()
  } finally {
    loading.value = false
  }
}

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

const createPost = () => {
  console.log('Create new post')
  // Navigate to create post page or open modal
  router.push('/create-post')
}

const editProfile = () => {
  console.log('Edit profile')
  router.push('/profile')
}

onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
.user-sidebar {
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Profile Header */
.profile-header {
  position: relative;
  margin-bottom: 2rem;
}

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

.profile-content {
  position: relative;
  z-index: 2;
  padding-top: 2rem;
  text-align: center;
}

.profile-avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.profile-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #b8aff7;
  object-fit: cover;
  background: #270c3b;
}

.online-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #00ff88;
  border: 3px solid #0a0b0f;
  border-radius: 50%;
}

.profile-info {
  color: white;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #b8aff7;
  margin: 0 0 0.25rem 0;
}

.profile-username {
  font-size: 0.9rem;
  color: #999;
  margin: 0 0 0.5rem 0;
}

.profile-bio {
  font-size: 0.85rem;
  color: #ccc;
  margin: 0;
  line-height: 1.4;
}

/* User Statistics */
.user-stats {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  background: rgba(184, 175, 247, 0.1);
  border: 1px solid rgba(184, 175, 247, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(184, 175, 247, 0.15);
  border-color: rgba(184, 175, 247, 0.3);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #b8aff7;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Section Titles */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #b8aff7;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(184, 175, 247, 0.2);
}

/* Recent Activity */
.recent-activity {
  margin-bottom: 2rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(39, 12, 59, 0.3);
  border: 1px solid rgba(184, 175, 247, 0.1);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
}

.activity-item:hover {
  background: rgba(39, 12, 59, 0.5);
  border-color: rgba(184, 175, 247, 0.2);
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(184, 175, 247, 0.2);
  border-radius: 50%;
  color: #b8aff7;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.85rem;
  color: #ccc;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.activity-time {
  font-size: 0.7rem;
  color: #999;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #542f87, #b8aff7);
  color: white;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #6a3ba8, #c9c0ff);
  box-shadow: 0 4px 12px rgba(184, 175, 247, 0.3);
}

.action-btn.secondary {
  background: rgba(184, 175, 247, 0.1);
  border: 1px solid rgba(184, 175, 247, 0.3);
  color: #b8aff7;
}

.action-btn.secondary:hover {
  background: rgba(184, 175, 247, 0.2);
  border-color: rgba(184, 175, 247, 0.5);
}

/* Custom Scrollbar */
.user-sidebar::-webkit-scrollbar {
  width: 6px;
}

.user-sidebar::-webkit-scrollbar-track {
  background: #0a0b0f;
}

.user-sidebar::-webkit-scrollbar-thumb {
  background: #542f87;
  border-radius: 3px;
}

.user-sidebar::-webkit-scrollbar-thumb:hover {
  background: #b8aff7;
}

@media (max-width: 991.98px) {
  .user-sidebar {
    display: none;
  }
}
</style>
