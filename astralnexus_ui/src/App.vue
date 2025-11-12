<template>
  <div id="app">
    <!-- Root/Landing Layout -->
    <template v-if="isRootRoute">
      <RouterView />
    </template>

    <!-- Blog Layout -->
    <template v-else-if="isBlogRoute">
      <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div class="container mx-auto px-4 py-8">
          <RouterView />
        </div>
        <BottomBar />
      </div>
    </template>

    <!-- Admin Layout -->
    <template v-else-if="isAdminRoute">
      <div class="min-h-screen bg-gray-100">
        <RouterView />
      </div>
    </template>

    <!-- Default Layout -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomBar from './shared/components/BottomBar.vue'

const route = useRoute()

const isRootRoute = computed(() => {
  return route.path === '/' || route.path === '/login'
})

const isBlogRoute = computed(() => {
  return route.path.startsWith('/blog')
})

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
