<template>
  <div id="my-posts" class="px-5 py-0">
    <h1>My Posts</h1>
    <p>Welcome to the My Posts page. Here you can view and manage your posts.</p>
    <router-link to="/myposts/:id"></router-link>
  </div>
</template>

<script setup lang="ts">
import PostDetail from '@/shared/components/PostDetail.vue';
</script>
