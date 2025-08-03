<template>
  <div id="blog-app" class="d-flex">
    <TopBar :user-stats="userStats" :loading-stats="isLoadingStats"></TopBar>
    <Sidebar
      :user-stats="userStats"
      :loading-stats="isLoadingStats"
      @refresh-stats="refreshUserStats"
    ></Sidebar>
    <div class="main-content my-6">
      <router-view />
    </div>
    <TrendingBar></TrendingBar>
    <BottomBar :user-stats="userStats" :loading-stats="isLoadingStats"></BottomBar>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopBar from '@/shared/components/TopBar.vue'
import Sidebar from '@/shared/components/Sidebar.vue'
import TrendingBar from '@/shared/components/TrendingBar.vue'
import BottomBar from '@/shared/components/BottomBar.vue'
import { useLanguageStore } from '@/shared/stores/language'
import { useUser } from '@/shared/composables/useUser'
import { apiClient } from '@/shared/api'
import type { UserStats } from '@/shared/types'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const { user, initializeUser } = useUser()

// User stats management
const userStats = ref<UserStats>({
  posts: 0,
  comments: 0,
  notifications: 0,
  following: 0,
  followers: 0,
})

const isLoadingStats = ref(false)

// Function to fetch user statistics
const fetchUserStats = async () => {
  if (!user.value?.id) return

  try {
    isLoadingStats.value = true
    const stats = await apiClient.fetchUserStats(user.value.id.toString())
    userStats.value = stats
    console.log('User stats fetched:', stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    // Keep default values on error
  } finally {
    isLoadingStats.value = false
  }
}

// Function for child components to trigger stats refresh
const refreshUserStats = async () => {
  await fetchUserStats()
}

// Watch for user changes to fetch stats
watch(
  user,
  (newUser) => {
    if (newUser?.id) {
      fetchUserStats()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  // Extract language from URL parameters
  const langFromUrl = route.query.lang as string

  if (langFromUrl) {
    console.log('Language preference received from OAuth redirect:', langFromUrl)

    // Set the language in the language store (this will handle cookie storage)
    languageStore.setLanguage(langFromUrl)

    const query = { ...route.query }
    delete query.lang

    router.replace({
      path: route.path,
      query: Object.keys(query).length > 0 ? query : undefined,
    })

    console.log('Language preference set across subdomains via cookie:', langFromUrl)
  } else {
    languageStore.initializeLanguage()
  }

  // Initialize user and fetch stats
  await initializeUser()
})
</script>

<style scoped>
.main-content {
  margin-left: 280px; /* Match sidebar width */
  margin-top: 80px; /* Account for TopBar height */
  margin-bottom: 80px; /* Account for BottomBar height on mobile */
  width: calc(100vw - 280px - 10rem); /* Subtract sidebar + trending bar widths */
  min-height: calc(100vh - 160px); /* Account for top and bottom spacing */
  padding: 0 2rem;
}

#blog-app {
  min-height: 100vh;
  position: relative;
}

/* Hide TrendingBar on mobile */
@media (max-width: 991.98px) {
  :deep(.trending-bar) {
    display: none;
  }
}

/* Mobile view */
@media (max-width: 991.98px) {
  .main-content {
    margin-left: 0; /* No sidebar on mobile */
    width: 100vw; /* Full width when both sidebar and trending bar are hidden */
    padding: 0 1rem;
  }
}

@media (max-width: 767.98px) {
  .main-content {
    width: 100vw; /* Full width on small mobile */
    margin-bottom: 100px;
    padding: 0 1rem;
  }
}
</style>
