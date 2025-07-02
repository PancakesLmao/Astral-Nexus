<template>
  <div class="dashboard min-vh-100">
    <Header />

    <main class="main-content container py-5">
      <div class="row">
        <div class="col-12">
          <div class="welcome-section text-center mb-5">
            <h1 class="display-4 mb-3">
              {{ languageStore.t('welcomeToDashboard') }}
            </h1>
            <p class="lead" v-if="user">{{ languageStore.t('hello') }}, {{ user.name }}!</p>
          </div>

          <!-- User Info Card -->
          <div class="row justify-content-center" v-if="user">
            <div class="col-md-6 col-lg-4">
              <div class="user-card">
                <div class="text-center mb-4">
                  <img :src="user.picture" :alt="user.name" class="user-avatar" />
                  <h3 class="mt-3">{{ user.name }}</h3>
                  <p class="text-muted">{{ user.email }}</p>
                  <span class="badge bg-success">{{ user.provider.toUpperCase() }}</span>
                </div>

                <div class="user-actions">
                  <button @click="logout" class="btn btn-outline-danger w-100" :disabled="loading">
                    <LogOut class="me-2" :size="16" />
                    {{ languageStore.t('logout') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div class="text-center" v-if="loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">{{ languageStore.t('loading') }}</p>
          </div>

          <!-- Error State -->
          <div class="alert alert-danger" v-if="error">
            <h5>{{ languageStore.t('error') }}</h5>
            <p>{{ error }}</p>
            <router-link to="/login" class="btn btn-primary">
              {{ languageStore.t('backToLogin') }}
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import Header from '@/shared/components/Header.vue'
import { useLanguageStore } from '@/shared/stores/language'

const languageStore = useLanguageStore()
const router = useRouter()
const route = useRoute()

const user = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch current user info
const fetchUser = async () => {
  try {
    const response = await fetch('http://localhost:3001/auth/me', {
      credentials: 'include', // Important for cookies
    })

    if (response.ok) {
      const data = await response.json()
      user.value = data.user
    } else {
      const errorData = await response.json()
      error.value = errorData.error || 'Failed to fetch user info'
    }
  } catch (err) {
    console.error('Failed to fetch user:', err)
    error.value = 'Failed to connect to server'
  } finally {
    loading.value = false
  }
}

// Logout handler
const logout = async () => {
  try {
    loading.value = true

    const response = await fetch('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      // Redirect to login page
      router.push('/login')
    } else {
      console.error('Logout failed')
    }
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    loading.value = false
  }
}

// Check for OAuth errors in URL
const checkOAuthError = () => {
  const errorParam = route.query.error
  if (errorParam === 'oauth_failed') {
    error.value = 'OAuth authentication failed. Please try again.'
  }
}

onMounted(() => {
  languageStore.initializeLanguage()
  checkOAuthError()

  if (!error.value) {
    fetchUser()
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  background: linear-gradient(135deg, #1a1b23 0%, #2d2e36 100%);
  min-height: 100vh;
  color: white;
}

.main-content {
  padding-top: 120px; /* Account for fixed header */
}

.user-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 15px;
  color: #ff6b7a;
}

.btn {
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-outline-danger {
  border: 2px solid #dc3545;
  color: #dc3545;
  background: transparent;
}

.btn-outline-danger:hover {
  background: #dc3545;
  color: white;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}
</style>
