<template>
  <div class="sidebar flex flex-column px-5 fixed bg-[#0a0b0f]">
    <div class="sidebar-header d-flex align-items-start justify-content-center flex-column">
      <router-link class="navbar-brand my-4" to="/">
        <span class="brand-text">AstralNexus</span>
      </router-link>
    </div>
    <nav class="sidebar-nav">
      <ul class="nav-list d-flex flex-column align-items-stretch p-0 m-0">
        <li>
          <router-link to="/" class="nav-item">
            <House :size="20" />
            <span>{{ languageStore.t('home') }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/myposts" class="nav-item">
            <BookOpen :size="20" />
            <span>{{ languageStore.t('myposts') }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/events" class="nav-item">
            <Calendar :size="20" />
            <span>{{ languageStore.t('events') }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile" class="nav-item">
            <User :size="20" />
            <span>{{ languageStore.t('profile') }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="sidebar-footer mt-auto">
      <!-- Current user profile -->
      <div class="user-profile mb-3" @click="toggleUserDropdown" v-if="user">
        <div class="nav-item user-info">
          <img :src="user.picture" :alt="user.name" class="user-avatar" />
          <span class="user-name">{{ user.name }}</span>
        </div>

        <!-- User Dropdown -->
        <div class="user-dropdown" v-show="isUserDropdownOpen">
          <button class="dropdown-item" @click="handleLogout">
            <LogOut :size="16" />
            <span>{{ languageStore.t('logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { House, BookOpen, User, Calendar, LogOut } from 'lucide-vue-next'
import { API_BASE_URL } from '@/shared/api'
import { useLanguageStore } from '@/shared/stores/language'
import { getCookie, checkUserAuth, redirectToLogin } from '@/shared/utils'

const router = useRouter()
const languageStore = useLanguageStore()
const isUserDropdownOpen = ref(false)
const user = ref<any>(null)
const loading = ref(false)

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

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

const handleLogout = async () => {
  try {
    // Get session for logout request
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
      // Redirect to login page
      window.location.href = 'http://localtest.me:3000/login'
    } else {
      console.error('Logout failed')
    }
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    isUserDropdownOpen.value = false
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-profile')) {
    isUserDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchUser()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.sidebar {
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  border-right: rgba(255, 255, 255, 0.1) 1px solid;
  z-index: 1000;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin: 0.5rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #b8aff7;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 100%;
}

.nav-item:hover {
  color: #b8aff7;
  background-color: #270c3b;
  box-shadow: 0 4px 12px #270c3b;
}

.nav-item.router-link-active {
  color: #b8aff7;
  background-color: #270c3b;
  font-weight: 600;
  box-shadow: 0 4px 12px #270c3b;
}

.nav-item span {
  font-weight: inherit;
}

.user-profile {
  position: relative;
  cursor: pointer;
}

.user-info {
  justify-content: space-between;
  border: 1px solid #542f87;
}

.user-info:hover {
  background-color: #270c3b;
  border-color: #b8aff7;
}

.user-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #0a0b0f;
  border: 1px solid #542f87;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #b8aff7;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.dropdown-item:hover {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
}

/* User Avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #542f87;
  object-fit: cover;
}

.user-name {
  flex: 1;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
