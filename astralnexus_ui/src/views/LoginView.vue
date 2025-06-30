<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../utils/auth'

const router = useRouter()
const { login } = useAuth()

const handleLogin = () => {
  login('demo-token')
  router.push('/')
}
</script>

<template>
  <div id="login">
    <h1>Login</h1>
    <p>Login to access your Honkai Blog platform</p>
    <button class="" @click="handleLogin">Login</button>
  </div>
</template>
