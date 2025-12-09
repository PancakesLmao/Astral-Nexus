<template>
  <div class="notification-box">
    <!-- Loading State -->
    <div v-if="loading" class="p-6 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="text-gray-400 mt-2">{{ languageStore.t('loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 text-center">
      <div class="text-red-400 mb-2">
        <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <p class="text-red-400">{{ error }}</p>
      <button
        @click="() => loadNotifications()"
        class="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="notifications.length === 0" class="p-8 text-center">
      <h3 class="text-xs font-semibold text-[#b8aff7] mb-2">
        {{ languageStore.t('noNotifications') }}
      </h3>
      <p class="text-gray-400 max-w-sm mx-auto">
        {{ languageStore.t('noNotificationsDescription') }}
      </p>
    </div>

    <!-- Notifications List - Compact Card Design -->
    <div v-else>
      <!-- New Indicator -->
      <div v-if="hasNewNotifications" class="flex items-center gap-1 px-4 py-2">
        <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span class="text-xs text-red-400">New notifications</span>
      </div>

      <!-- Notifications - scrollable list -->
      <div class="space-y-3 max-h-[600px] overflow-y-auto px-4 py-4 notification-scroll">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item flex items-start gap-3 p-3 rounded-lg border border-[rgba(184,175,247,0.1)] bg-[rgba(39,12,59,0.2)] transition-all duration-200 cursor-pointer hover:bg-[rgba(39,12,59,0.4)]"
        >
          <!-- Compact Icon -->
          <div class="flex-shrink-0 mt-0.5">
            <component
              :is="getNotificationIcon(notification.type)"
              :size="16"
              :class="getNotificationIconColor(notification.type)"
            />
          </div>

          <!-- Compact Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-300 leading-tight line-clamp-2">
              <span class="font-medium text-foreground">{{ notification.title }}</span> -
              {{ notification.message }}
            </p>
            <p class="text-xs text-gray-600 mt-1">
              {{ formatRelativeTime(notification.created_at) }}
            </p>
          </div>

          <!-- Delete Button -->
          <button
            @click.stop="deleteNotification(notification.id)"
            class="flex-shrink-0 p-1 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Heart, MessageCircle, UserPlus, AtSign, Info } from 'lucide-vue-next'
import { useLanguageStore } from '@/shared/stores/language'
import { useUserStore } from '@/shared/stores/user'
import { apiClient } from '@/shared/api'
import type { Notification, PaginationInfo } from '@/shared/types'

const languageStore = useLanguageStore()
const userStore = useUserStore()

const notifications = ref<Notification[]>([])
const pagination = ref<PaginationInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const hasNewNotifications = ref(false)
const pollingInterval = ref<NodeJS.Timeout | null>(null)

const currentUser = computed(() => userStore.user)

// Notification icons mapping
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return Heart
    case 'comment':
      return MessageCircle
    case 'follow':
      return UserPlus
    case 'mention':
      return AtSign
    case 'system':
      return Info
    default:
      return Info
  }
}

const getNotificationIconColor = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return 'text-red-400'
    case 'comment':
      return 'text-blue-400'
    case 'follow':
      return 'text-green-400'
    case 'mention':
      return 'text-yellow-400'
    case 'system':
      return 'text-[#b8aff7]'
    default:
      return 'text-gray-400'
  }
}

const getNotificationIconClass = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return 'bg-red-500/20 text-red-400'
    case 'comment':
      return 'bg-blue-500/20 text-blue-400'
    case 'follow':
      return 'bg-green-500/20 text-green-400'
    case 'mention':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'system':
      return 'bg-purple-500/20 text-[#b8aff7]'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString()
}

const loadNotifications = async (page: number = 1) => {
  if (!currentUser.value?.id) {
    error.value = 'User not logged in'
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await apiClient.fetchNotifications({
      user_id: currentUser.value.id,
      page,
      limit: 10,
    })

    notifications.value = result.notifications
    pagination.value = result.pagination
    currentPage.value = page
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load notifications'
    console.error('Failed to load notifications:', err)
  } finally {
    loading.value = false
  }
}

const deleteNotification = async (notificationId: string) => {
  try {
    await apiClient.deleteNotification(notificationId)

    // Remove from local list
    notifications.value = notifications.value.filter((n) => n.id !== notificationId)

    // If no notifications left on current page and not first page, go to previous page
    if (notifications.value.length === 0 && currentPage.value > 1) {
      await loadNotifications(currentPage.value - 1)
    }
  } catch (err) {
    console.error('Failed to delete notification:', err)
    // You could show a toast notification here
  }
}

const refreshNotifications = () => {
  hasNewNotifications.value = false
  loadNotifications(1) // Reload from first page
}

const startPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }

  // Poll every 30 seconds for new notifications
  pollingInterval.value = setInterval(async () => {
    if (!currentUser.value?.id) return

    try {
      const result = await apiClient.fetchNotifications({
        user_id: currentUser.value.id,
        page: 1,
        limit: 1, // Just check if there are any new notifications
      })

      // Check if there are unread notifications (notifications that are newer than what we have)
      if (result.notifications.length > 0 && notifications.value.length > 0) {
        const latestNotification = result.notifications[0]
        const currentLatest = notifications.value[0]

        if (latestNotification.created_at > currentLatest.created_at) {
          hasNewNotifications.value = true
        }
      } else if (result.notifications.length > 0 && notifications.value.length === 0) {
        hasNewNotifications.value = true
      }
    } catch (err) {
      console.error('Failed to poll notifications:', err)
    }
  }, 30000) // 30 seconds
}

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// Load notifications when component mounts
onMounted(() => {
  if (currentUser.value?.id) {
    loadNotifications()
    startPolling()
  }
})

// Stop polling when component unmounts
onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.notification-box {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Custom scrollbar styling */
.notification-scroll::-webkit-scrollbar {
  width: 6px;
}

.notification-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.notification-scroll::-webkit-scrollbar-thumb {
  background: rgba(184, 175, 247, 0.3);
  border-radius: 3px;
}

.notification-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(184, 175, 247, 0.5);
}
</style>
