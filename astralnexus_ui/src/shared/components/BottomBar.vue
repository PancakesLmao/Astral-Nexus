<template>
  <nav class="bottom-bar lg:hidden fixed w-full bottom-0">
    <div class="bottom-nav-container">
      <router-link to="/" class="bottom-nav-item">
        <House :size="20" />
        <span class="nav-label">{{ languageStore.t('home') }}</span>
      </router-link>

      <router-link to="/myposts" class="bottom-nav-item">
        <BookOpen :size="20" />
        <span class="nav-label">{{ languageStore.t('myposts') }}</span>
      </router-link>

      <!-- Create Post Button -->
      <div class="bottom-nav-item create-post-btn" @click="openCreatePostDialog">
        <div class="create-post-icon">
          <Plus :size="20" />
        </div>
        <span class="nav-label">Post</span>
      </div>

      <router-link to="/events" class="bottom-nav-item">
        <Calendar :size="20" />
        <span class="nav-label">{{ languageStore.t('events') }}</span>
      </router-link>

      <div class="bottom-nav-item" @click="toggleProfileModal" v-if="user">
        <img :src="user.picture" :alt="user.name" class="bottom-profile-avatar" />
        <span class="nav-label">Profile</span>
      </div>
    </div>

    <!-- Mobile Profile Modal -->
    <div
      class="profile-modal-overlay"
      v-show="isProfileModalOpen"
      @click="isProfileModalOpen = false"
    >
      <div class="profile-modal" @click.stop v-if="user">
        <div class="modal-header">
          <img :src="user.picture" :alt="user.name" class="modal-avatar" />
          <div class="modal-user-info">
            <div class="modal-user-name">{{ user.name }}</div>
            <div class="modal-username">@{{ user.username || 'user' }}</div>
          </div>
          <button class="close-btn" @click="isProfileModalOpen = false">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-actions">
          <router-link to="/profile" class="modal-action" @click="isProfileModalOpen = false">
            <User :size="18" />
            <span>{{ languageStore.t('profile') }}</span>
          </router-link>

          <div class="category-selector-mobile">
            <button class="modal-action category-trigger" @click="toggleCategorySelect">
              <span>{{ selectedCategory?.game_name || 'Loading...' }}</span>
              <ChevronDown class="dropdown-icon" :class="{ rotated: isCategorySelectOpen }" />
            </button>

            <div class="category-list" v-show="isCategorySelectOpen">
              <button
                v-for="category in gameCategories"
                :key="category.id"
                class="category-item"
                :class="{ active: category.id === selectedCategory?.id }"
                @click="selectCategory(category)"
              >
                <span>{{ category.game_name }}</span>
              </button>
            </div>
          </div>

          <button class="modal-action logout-action" @click="handleLogout">
            <LogOut :size="18" />
            <span>{{ languageStore.t('logout') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- New Post Dialog -->
    <NewPost
      :isOpen="isCreatePostDialogOpen"
      :user="user"
      @close="isCreatePostDialogOpen = false"
      @created="handlePostCreated"
    />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { House, BookOpen, Calendar, User, LogOut, X, ChevronDown, Plus } from 'lucide-vue-next'
import { useLanguageStore } from '@/shared/stores/language'
import { usePostsStore } from '@/shared/stores/posts'
import { API_BASE_URL, apiClient } from '@/shared/api'
import { checkUserAuth, redirectToLogin } from '@/shared/utils'
import NewPost from './NewPost.vue'
import type { Post, GameCategory } from '@/shared/types'

const languageStore = useLanguageStore()
const postsStore = usePostsStore()
const user = ref<any>(null)
const loading = ref(false)
const isProfileModalOpen = ref(false)
const isCategorySelectOpen = ref(false)
const isCreatePostDialogOpen = ref(false)

// Game categories (from store)
const gameCategories = computed(() => postsStore.gameCategories)
const selectedCategory = computed(() => postsStore.selectedCategory)

const toggleProfileModal = () => {
  isProfileModalOpen.value = !isProfileModalOpen.value
  if (isProfileModalOpen.value) {
    isCategorySelectOpen.value = false
  }
}

const toggleCategorySelect = () => {
  isCategorySelectOpen.value = !isCategorySelectOpen.value
}

const selectCategory = (category: GameCategory) => {
  isCategorySelectOpen.value = false

  // Use the store action to select category
  postsStore.selectGameCategory(category)

  console.log('Selected game category (mobile):', category.game_name)
}

const fetchGameCategories = async () => {
  try {
    await postsStore.loadGameCategories()
    console.log('BottomBar: Game categories loaded from store')
  } catch (error) {
    console.error('BottomBar: Failed to load game categories:', error)
  }
}

const openCreatePostDialog = () => {
  isCreatePostDialogOpen.value = true
}

const handlePostCreated = (post: Post) => {
  console.log('New post created from mobile:', post)
  // You could emit an event to parent component or update some state
}

const fetchUser = async () => {
  try {
    loading.value = true

    const urlParams = new URLSearchParams(window.location.search)
    const sessionFromUrl = urlParams.get('session')

    if (sessionFromUrl) {
      console.log('BottomBar: Setting session from URL:', sessionFromUrl)
      document.cookie = `astral_session=${sessionFromUrl}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax; Domain=.localtest.me`
      localStorage.setItem('astral_session', sessionFromUrl)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const { isAuthenticated, user: userData } = await checkUserAuth(API_BASE_URL)

    if (!isAuthenticated) {
      console.log('BottomBar: User not authenticated, redirecting to login')
      redirectToLogin()
      return
    }

    user.value = userData
    console.log('BottomBar: User loaded:', userData.name)
  } catch (err) {
    console.error('BottomBar: Failed to fetch user:', err)
    redirectToLogin()
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    // Use DELETE method as defined in the backend and rely on cookies
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      localStorage.removeItem('astral_session')
      user.value = null
      window.location.href = 'http://localtest.me:3000/login'
    } else {
      console.error('Logout failed')
    }
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    isProfileModalOpen.value = false
  }
}

onMounted(() => {
  languageStore.initializeLanguage()
  fetchUser()
  fetchGameCategories()
})
</script>

<style scoped>
.bottom-bar {
  z-index: 998;
  background: rgba(10, 11, 15, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(184, 175, 247, 0.2);
}

.bottom-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.75rem 1rem;
  max-width: 100%;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  color: #b8aff7;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 60px;
}

.bottom-nav-item:hover {
  color: #b8aff7;
  background: rgba(184, 175, 247, 0.1);
}

.bottom-nav-item.router-link-active {
  color: #b8aff7;
  background: rgba(184, 175, 247, 0.2);
  font-weight: 600;
}

/* Create Post Button */
.create-post-btn {
  position: relative;
}

.create-post-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #542f87, #b8aff7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(184, 175, 247, 0.3);
}

.create-post-btn:hover .create-post-icon {
  background: linear-gradient(135deg, #6a3ba8, #c9c0ff);
  box-shadow: 0 4px 12px rgba(184, 175, 247, 0.4);
}

.nav-label {
  font-size: 0.7rem;
  text-align: center;
  white-space: nowrap;
}

.bottom-profile-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(184, 175, 247, 0.3);
  object-fit: cover;
}

/* Profile Modal */
.profile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.profile-modal {
  background: rgba(10, 11, 15, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  max-width: 400px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(184, 175, 247, 0.2);
}

.modal-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #542f87;
  object-fit: cover;
}

.modal-user-info {
  flex: 1;
}

.modal-user-name {
  font-weight: 600;
  color: #b8aff7;
  font-size: 1rem;
}

.modal-username {
  font-size: 0.85rem;
  color: #999;
  margin-top: 0.25rem;
}

.close-btn {
  background: rgba(184, 175, 247, 0.1);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b8aff7;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(184, 175, 247, 0.2);
}

.modal-actions {
  padding: 1rem 1.5rem 1.5rem;
}

.modal-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: #b8aff7;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.modal-action:hover {
  background: rgba(184, 175, 247, 0.1);
  color: #b8aff7;
}

.logout-action:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

/* Category Selector in Mobile */
.category-selector-mobile {
  width: 100%;
  margin-bottom: 0.5rem;
}

.category-trigger {
  justify-content: space-between;
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 0.5rem;
}

.category-trigger:hover {
  border-color: rgba(184, 175, 247, 0.5);
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.category-list {
  background: rgba(39, 12, 59, 0.5);
  border: 1px solid rgba(184, 175, 247, 0.2);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  overflow: hidden;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.category-item:hover {
  background: rgba(184, 175, 247, 0.1);
  color: #b8aff7;
}

.category-item.active {
  background: rgba(184, 175, 247, 0.2);
  color: #b8aff7;
  font-weight: 600;
}

.category-icon {
  font-size: 1rem;
}

@media (max-width: 575.98px) {
  .bottom-nav-container {
    padding: 0.5rem 0.5rem;
  }

  .bottom-nav-item {
    min-width: 50px;
    padding: 0.4rem;
  }

  .nav-label {
    font-size: 0.65rem;
  }

  .bottom-profile-avatar {
    width: 20px;
    height: 20px;
  }

  .modal-header {
    padding: 1.25rem 1.25rem 0.75rem;
  }

  .modal-actions {
    padding: 0.75rem 1.25rem 1.25rem;
  }
}
</style>
