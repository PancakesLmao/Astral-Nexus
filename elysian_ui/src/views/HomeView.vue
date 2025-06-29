<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div id="home" class="">
    <h1>Welcome to Honkai Blog</h1>
    <p>Your ultimate platform for sharing Honkai Impact 3rd contents</p>
    <button @click="goToLogin">Get Started</button>
  </div>
</template>
