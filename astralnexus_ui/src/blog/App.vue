<template>
  <div id="blog-app" class="d-flex">
    <Sidebar></Sidebar>
    <div class="main-content my-4">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/shared/components/Sidebar.vue'
import { useLanguageStore } from '@/shared/stores/language'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()

onMounted(() => {
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
})
</script>

<style>
.main-content {
  margin-left: 280px; /* Match sidebar width */
  width: calc(100vw - 280px);
  min-height: 100vh;
}

#blog-app {
  min-height: 100vh;
}
</style>
