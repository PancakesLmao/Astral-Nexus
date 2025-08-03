<template>
  <div id="notifications" class="px-5 py-0">
    <h1 class="text-2xl font-bold text-foreground mb-6">{{ languageStore.t('notifications') }}</h1>

    <NotificationBox />
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/shared/stores/language'
import NotificationBox from '@/shared/components/NotificationBox.vue'

const languageStore = useLanguageStore()
</script>
