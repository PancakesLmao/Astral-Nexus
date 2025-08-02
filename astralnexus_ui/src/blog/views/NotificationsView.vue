<template>
  <div id="notifications" class="px-5 py-0">
    <h1 class="text-2xl font-bold text-foreground">{{ languageStore.t('notifications') }}</h1>
    <p class="text-dark-300 mb-6">{{ languageStore.t('notificationsDescription') }}</p>

    <!-- Empty State -->
    <div class="text-center py-16">
      <h3 class="text-xl font-semibold text-[#b8aff7] mb-2">
        {{ languageStore.t('noNotifications') }}
      </h3>
      <p class="text-gray-400 max-w-md mx-auto">
        {{ languageStore.t('noNotificationsDescription') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/shared/stores/language'

const languageStore = useLanguageStore()
</script>
