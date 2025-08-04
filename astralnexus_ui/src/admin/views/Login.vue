<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="login min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative"
  >
    <!-- Background overlay -->
    <div class="overlay position-absolute"></div>

    <!-- Login Form Card -->
    <div class="login-card position-relative">
      <div class="back-to-home">
        <a href="http://localtest.me:3000" class="home-link">
          <ArrowLeft class="arrow-icon" />
          Back to Home
        </a>
      </div>

      <div class="card-header text-center">
        <h1 class="card-title bg-light">Admin Login</h1>
      </div>

      <div class="card-body">
        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="auth-form d-flex flex-column">
          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message mb-3">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="formData.email"
              type="email"
              class="form-control"
              placeholder="admin@astralnexus.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="formData.password"
              type="password"
              class="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="auth-btn position-relative d-flex align-items-center justify-content-center"
          >
            <svg v-if="!isLoading" width="100%" height="100%">
              <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" />
            </svg>
            <span v-if="isLoading" class="loading-spinner me-2"></span>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'

const isLoading = ref(false)
const errorMessage = ref('')

const formData = ref({
  email: '',
  password: '',
})

const handleSubmit = async () => {
  if (!formData.value.email || !formData.value.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://api.localtest.me:3001/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: formData.value.email,
        password: formData.value.password,
      }),
    })

    const data = await response.json()

    if (data.success) {
      // Redirect to admin dashboard on subdomain
      window.location.href = 'http://admin.localtest.me:3000'
    } else {
      errorMessage.value = data.message || 'Invalid email or password'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1b23 0%, #2d2e36 100%);
  position: relative;
}

.overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  z-index: 2;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-header {
  margin-bottom: 2rem;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #ff6b35, #f7931e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-form {
  gap: 1.5rem;
}

.form-group {
  gap: 0.5rem;
}

.form-label {
  color: #f7931e;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-control {
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-control:focus {
  outline: none;
  border-color: #ff6b35;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.error-message {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.auth-btn {
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  color: #f7931e;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.35s ease;
  margin-top: 0.5rem;
  position: relative;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-btn svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.auth-btn rect {
  fill: none;
  stroke: #ff6b35;
  stroke-width: 2;
  stroke-dasharray: 300, 0;
  transition: all 0.35s linear;
  rx: 8px;
  ry: 8px;
}

.auth-btn:hover:not(:disabled) {
  color: #ff6b35;
}

.auth-btn:hover:not(:disabled) rect {
  stroke-width: 3;
  stroke-dasharray: 15, 285;
  stroke-dashoffset: 30;
  transition: all 1.35s cubic-bezier(0.19, 1, 0.22, 1);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ff6b35;
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

.back-to-home {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.home-link:hover {
  color: #ff6b35;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

/* Responsive for smaller screen */
@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
    max-width: none;
  }

  .card-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem 1rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .form-control {
    padding: 0.75rem;
  }

  .auth-btn {
    padding: 0.875rem 1.5rem;
  }
}
</style>
