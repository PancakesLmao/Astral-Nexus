<script setup lang="ts">
import Sidebar from '@/components/platform/Sidebar.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="platform" class="d-flex">
    <Sidebar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.main-content {
  flex: 1;
  padding: 20px;
}
</style>
