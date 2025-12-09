<template>
  <div id="notifications" class="py-0">
    <NotificationBox />
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/shared/stores/language'
import NotificationBox from '@/shared/components/NotificationBox.vue'

const languageStore = useLanguageStore()
</script>
