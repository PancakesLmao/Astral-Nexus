<template>
  <header class="header-container fixed w-full">
    <nav class="navbar navbar-expand-lg container">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">
          <span class="brand-text">AstralNexus</span>
        </router-link>

        <!-- Navigation Links (Desktop) -->
        <div class="nav-links hidden lg:flex">
          <router-link to="/" class="nav-link">
            <House :size="20" />
            <span>{{ languageStore.t('home') }}</span>
          </router-link>
          <router-link to="/myposts" class="nav-link">
            <BookOpen :size="20" />
            <span>{{ languageStore.t('myposts') }}</span>
          </router-link>
          <router-link to="/events" class="nav-link">
            <Calendar :size="20" />
            <span>{{ languageStore.t('events') }}</span>
          </router-link>
        </div>

        <!-- Search Bar (Responsive) -->
        <div class="search-container">
          <div class="search-bar">
            <input
              type="text"
              v-model="searchQuery"
              @input="handleSearch"
              placeholder="Search posts, users, games..."
              class="search-input"
            />
          </div>
        </div>

        <div class="nav-actions">
          <!-- Game Category Selector (Hidden on mobile) -->
          <div class="category-selector hidden lg:block" @click.stop>
            <button
              class="category-btn"
              @click="toggleCategoryDropdown"
              :aria-expanded="isCategoryDropdownOpen"
            >
              <span class="category-name">{{ selectedCategory?.game_name || 'Loading...' }}</span>
              <ChevronDown class="dropdown-icon" :class="{ rotated: isCategoryDropdownOpen }" />
            </button>

            <div class="category-dropdown" v-show="isCategoryDropdownOpen">
              <button
                v-for="category in gameCategories"
                :key="category.id"
                class="category-option"
                :class="{ active: category.id === selectedCategory?.id }"
                @click="selectCategory(category)"
              >
                <span class="category-label">{{ category.game_name }}</span>
              </button>
            </div>
          </div>

          <!-- Profile Icon -->
          <div class="profile-container hidden lg:block" @click="toggleProfileDropdown" v-if="user">
            <div class="profile-btn">
              <img :src="user.picture" :alt="user.name" class="profile-avatar" />
            </div>

            <!-- Profile Dropdown -->
            <div class="profile-dropdown" v-show="isProfileDropdownOpen">
              <div class="profile-info">
                <img :src="user.picture" :alt="user.name" class="profile-avatar-large" />
                <div class="profile-details">
                  <div class="profile-name">{{ user.name }}</div>
                  <div class="profile-username">@{{ user.username || 'user' }}</div>
                </div>
              </div>
              <hr class="dropdown-divider" />
              <router-link
                to="/profile"
                class="dropdown-item"
                @click="isProfileDropdownOpen = false"
              >
                <User :size="16" />
                <span>{{ languageStore.t('profile') }}</span>
              </router-link>
              <button class="dropdown-item logout-btn" @click="handleLogout">
                <LogOut :size="16" />
                <span>{{ languageStore.t('logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown, House, BookOpen, Calendar, User, LogOut } from 'lucide-vue-next'
import { useLanguageStore } from '@/shared/stores/language'
import { API_BASE_URL, apiClient } from '@/shared/api'
import { checkUserAuth, redirectToLogin } from '@/shared/utils'
import { GameCategory } from '@/shared/types'

const isCategoryDropdownOpen = ref(false)
const isProfileDropdownOpen = ref(false)
const languageStore = useLanguageStore()
const user = ref<any>(null)
const loading = ref(false)
const searchQuery = ref('')

// Emits for search functionality
const emit = defineEmits<{
  search: [query: string]
}>()

const gameCategories = ref<GameCategory[]>([])
const selectedCategory = ref<GameCategory | null>(null)

const toggleCategoryDropdown = () => {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
  if (isCategoryDropdownOpen.value) {
    isProfileDropdownOpen.value = false
  }
}

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value
  if (isProfileDropdownOpen.value) {
    isCategoryDropdownOpen.value = false
  }
}

const selectCategory = (category: GameCategory) => {
  selectedCategory.value = category
  isCategoryDropdownOpen.value = false
  console.log('Selected game category:', category.game_name)
}

const fetchGameCategories = async () => {
  try {
    const categories = await apiClient.fetchGameCategories()

    // Check if "All Games" already exists in the API response
    const hasAllGames = categories.some((cat) => cat.game_name === 'All Games')

    if (!hasAllGames) {
      // Only add "All Games" option if it doesn't exist
      const allGamesOption: GameCategory = {
        id: 'all',
        game_name: 'All Games',
        created_at: new Date().toISOString(),
      }
      gameCategories.value = [allGamesOption, ...categories]
    } else {
      // Use API response as-is since it already contains "All Games"
      gameCategories.value = categories
    }

    // Set default selection if none exists
    if (!selectedCategory.value && gameCategories.value.length > 0) {
      selectedCategory.value = gameCategories.value[0]
    }

    console.log('TopBar: Game categories loaded:', gameCategories.value.length)
  } catch (error) {
    console.error('TopBar: Failed to fetch game categories:', error)
    // Fallback to "All Games" option only
    const fallbackOption: GameCategory = {
      id: 'all',
      game_name: 'All Games',
      created_at: new Date().toISOString(),
    }
    gameCategories.value = [fallbackOption]
    selectedCategory.value = fallbackOption
  }
}

const handleSearch = () => {
  console.log('Searching for:', searchQuery.value)
  emit('search', searchQuery.value)
}

const fetchUser = async () => {
  try {
    loading.value = true

    // Check if session ID is in URL (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search)
    const sessionFromUrl = urlParams.get('session')

    if (sessionFromUrl) {
      console.log('TopBar: Setting session from URL:', sessionFromUrl)
      document.cookie = `astral_session=${sessionFromUrl}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax; Domain=.localtest.me`
      localStorage.setItem('astral_session', sessionFromUrl)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const { isAuthenticated, user: userData } = await checkUserAuth(API_BASE_URL)

    if (!isAuthenticated) {
      console.log('TopBar: User not authenticated, redirecting to login')
      redirectToLogin()
      return
    }

    user.value = userData
    console.log('TopBar: User loaded:', userData.name)
  } catch (err) {
    console.error('TopBar: Failed to fetch user:', err)
    redirectToLogin()
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    const sessionId = localStorage.getItem('astral_session')
    const headers: Record<string, string> = {}
    if (sessionId) {
      headers['Authorization'] = `Bearer ${sessionId}`
      headers['X-Session-ID'] = sessionId
    }

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers,
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
    isProfileDropdownOpen.value = false
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.category-selector')) {
    isCategoryDropdownOpen.value = false
  }
  if (!target.closest('.profile-container')) {
    isProfileDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  languageStore.initializeLanguage()
  fetchUser()
  fetchGameCategories()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header-container {
  top: 0;
  z-index: 999;
  transition: all 0.3s ease;
}

.header-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 11, 15, 0);
  z-index: -1;
  transition: background 0.3s ease;
}

/* Show background when scroll */
.header-container:before {
  background: rgba(10, 11, 15, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Navbar Section*/
.navbar {
  padding: 1rem 0;
  position: relative;
  z-index: 1;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Nav links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 0 2rem;
}

/* Search container */
.search-container {
  flex: 1;
  max-width: 400px;
  margin: 0 1rem;
}

.search-bar {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 2px solid rgba(184, 175, 247, 0.3);
  border-radius: 0.5rem;
  background-color: rgba(10, 11, 15, 0.8);
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input:focus {
  border-color: #b8aff7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(184, 175, 247, 0.2);
  background-color: rgba(10, 11, 15, 0.95);
}

.search-input::placeholder {
  color: #b8aff7;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.search-input:hover {
  border-color: rgba(184, 175, 247, 0.5);
  box-shadow: 0 2px 8px rgba(184, 175, 247, 0.1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #b8aff7;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #b8aff7;
  background: rgba(184, 175, 247, 0.1);
}

.nav-link.router-link-active {
  color: #b8aff7;
  background: rgba(184, 175, 247, 0.2);
  font-weight: 600;
}

/* Game Category Selector */
.category-selector {
  position: relative;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(184, 175, 247, 0.1);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 0.5rem;
  color: #b8aff7;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.category-btn:hover {
  background: rgba(184, 175, 247, 0.2);
  border-color: rgba(184, 175, 247, 0.5);
}

.category-name {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.category-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 160px;
  background: rgba(10, 11, 15, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 0.5rem;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.category-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.category-option:hover {
  background: rgba(184, 175, 247, 0.1);
  color: #b8aff7;
}

.category-option.active {
  background: rgba(184, 175, 247, 0.2);
  color: #b8aff7;
  font-weight: 600;
}

.category-icon {
  font-size: 1rem;
}

.category-label {
  font-weight: inherit;
}

/* Profile Container */
.profile-container {
  position: relative;
  cursor: pointer;
}

.profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(184, 175, 247, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
}

.profile-btn:hover {
  border-color: rgba(184, 175, 247, 0.5);
  transform: scale(1.05);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 220px;
  background: rgba(10, 11, 15, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 0.5rem;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(184, 175, 247, 0.05);
}

.profile-avatar-large {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #542f87;
}

.profile-details {
  flex: 1;
}

.profile-name {
  font-weight: 600;
  color: #b8aff7;
  font-size: 0.95rem;
}

.profile-username {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.25rem;
}

.dropdown-divider {
  margin: 0;
  border: none;
  border-top: 1px solid rgba(184, 175, 247, 0.2);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #b8aff7;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(184, 175, 247, 0.1);
  color: #b8aff7;
}

.logout-btn:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

@media (max-width: 991.98px) {
  .nav-links {
    display: none;
  }

  .search-container {
    max-width: 300px;
    margin: 0 0.5rem;
  }
}

@media (max-width: 575.98px) {
  .navbar {
    padding: 0.75rem 0;
  }

  .navbar-brand {
    font-size: 1.3rem;
  }

  .search-container {
    max-width: 200px;
    margin: 0 0.25rem;
  }

  .search-input {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }

  .nav-actions {
    gap: 0.75rem;
  }

  .category-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }

  .category-option {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }

  .profile-dropdown {
    min-width: 200px;
  }
}
</style>
