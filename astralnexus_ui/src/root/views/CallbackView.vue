<template>
  <div class="callback-container">
    <div class="callback-content">
      <div class="spinner"></div>
      <p class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/shared/lib/supabase'
import { getBlogUrl } from '@/shared/utils'

const router = useRouter()
const message = ref('Authenticating with Discord...')

onMounted(async () => {
  try {
    // Check if this is an OAuth callback (has code or error parameter)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    // If no OAuth callback parameters, redirect to landing page
    if (!code && !error) {
      console.log('No OAuth callback detected, redirecting to landing page')
      router.push('/landing')
      return
    }

    // Handle OAuth error from Discord/Supabase
    if (error) {
      const errorDescription = urlParams.get('error_description')
      console.error('OAuth error:', error, errorDescription)
      message.value = errorDescription || error
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      return
    }

    // This is an OAuth callback with code - process it
    console.log('OAuth Callback: Processing authentication code...')

    // Supabase automatically detects the code in the URL and exchanges it for a session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session retrieval error:', sessionError)
      message.value = 'Authentication failed. Please try again.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }

    if (session) {
      console.log('✅ Session established successfully')
      message.value = 'Login successful! Redirecting...'

      // Redirect to blog after a short delay
      setTimeout(() => {
        console.log('Redirecting to blog subdomain:', getBlogUrl())
        window.location.href = getBlogUrl()
      }, 800)
    } else {
      console.log('No session found')
      message.value = 'No session found. Redirecting to login...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error)
    message.value = 'Something went wrong. Please try again.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
})
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1b23 0%, #2d2e36 100%);
}

.callback-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(184, 175, 247, 0.3);
  border-top: 4px solid #b8aff7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.message {
  color: #b8aff7;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.5px;
}
</style>
