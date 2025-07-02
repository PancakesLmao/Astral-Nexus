<template>
  <div
    class="login min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative"
  >
    <!-- Background overlay -->
    <div class="overlay position-absolute"></div>

    <!-- Login Form Card -->
    <div class="login-card position-relative">
      <!-- Back to Home -->
      <div class="back-to-home">
        <router-link to="/" class="home-link">
          <ArrowLeft class="arrow-icon" />
          {{ languageStore.t('backToHome') }}
        </router-link>
      </div>
      <div class="card-header text-center">
        <h1 class="card-title bg-light">
          {{ languageStore.t('welcomeBack') }}
        </h1>
      </div>

      <div class="card-body">
        <!-- <form @submit.prevent="handleSubmit" class="auth-form d-flex flex-column">
          <div class="form-group">
            <label class="form-label">{{ languageStore.t('email') }}</label>
            <input
              v-model="formData.email"
              type="email"
              class="form-control"
              :placeholder="languageStore.t('emailPlaceholder')"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">{{ languageStore.t('password') }}</label>
            <input
              v-model="formData.password"
              type="password"
              class="form-control"
              :placeholder="languageStore.t('passwordPlaceholder')"
              required
            >
          </div>

          <div class="form-group text-end">
            <a href="#" class="forgot-password">
              {{ languageStore.t('forgotPassword') }}
            </a>
          </div>

          <button type="submit" class="auth-btn position-relative d-flex align-items-center justify-content-center">
            <svg>
              <rect x="0" y="0" fill="none" width="100%" height="100%"/>
            </svg>
            {{ languageStore.t('signIn') }}
          </button>
        </form>

        <div class="divider">
          <span class="divider-text position-relative">{{ languageStore.t('orContinueWith') }}</span>
        </div> -->

        <!-- Google Sign In Button -->
        <button
          @click="handleGoogleSignIn"
          class="google-btn position-relative d-flex align-items-center justify-content-center mb-3"
        >
          <svg class="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {{ languageStore.t('signInWithGoogle') }}
        </button>

        <!-- Discord Sign In Button -->
        <button
          @click="handleDiscordSignIn"
          class="discord-btn position-relative d-flex align-items-center justify-content-center"
        >
          <svg class="discord-icon" viewBox="0 0 24 24" fill="#FFFFFF">
            <path
              d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
            />
          </svg>
          {{ languageStore.t('signInWithDiscord') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useLanguageStore } from '@/shared/stores/language'

const languageStore = useLanguageStore()
const router = useRouter()
const loading = ref(false)

// Initialize language on component mount
onMounted(() => {
  languageStore.initializeLanguage()
})

// const formData = ref({
//   email: '',
//   password: ''
// });

// Form submission handler
// const handleSubmit = () => {
//   console.log('Sign in data:', formData.value);
//   // TODO: Implement actual sign in API call
// };

// Google Sign In handler
const handleGoogleSignIn = async (): Promise<void> => {
  try {
    loading.value = true
    console.log('Initiating Google Sign In...')

    // Redirect to Google OAuth endpoint
    window.location.href = 'http://localhost:3001/auth/google'
  } catch (error) {
    console.error('Google Sign In error:', error)
    loading.value = false
  }
}

// Discord Sign In handler
const handleDiscordSignIn = async (): Promise<void> => {
  try {
    loading.value = true
    console.log('Initiating Discord Sign In...')

    // Redirect to Discord OAuth endpoint
    window.location.href = 'http://localhost:3001/auth/discord'
  } catch (error) {
    console.error('Discord Sign In error:', error)
    loading.value = false
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
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #d1eafd, #b8aff7);
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
  color: #d1eafd;
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
  border-color: #b8aff7;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(184, 175, 247, 0.1);
}

.forgot-password {
  color: #b8aff7;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #d1eafd;
  text-decoration: underline;
}

.auth-btn {
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  color: #d1eafd;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.35s ease;
  margin-top: 0.5rem;
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
  stroke: #d1eafd;
  stroke-width: 2;
  stroke-dasharray: 300, 0;
  transition: all 0.35s linear;
  rx: 8px;
  ry: 8px;
}

.auth-btn:hover {
  color: #d1eafd;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.auth-btn:hover rect {
  stroke-width: 3;
  stroke-dasharray: 15, 285;
  stroke-dashoffset: 30;
  transition: all 1.35s cubic-bezier(0.19, 1, 0.22, 1);
}

.divider {
  margin: 2rem 0;
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider-text {
  background: #24252a;
  padding: 0 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.google-btn {
  background: #fff;
  color: #333;
  border: 2px solid #ddd;
  border-radius: 15px;
  padding: 1rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.google-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: #4285f4;
}

.google-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.discord-btn {
  background: #5865f2;
  color: white;
  border: 2px solid #5865f2;
  border-radius: 15px;
  padding: 1rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
  width: 100%;
  box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3);
}

.discord-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(88, 101, 242, 0.4);
  background: #4752c4;
  border-color: #4752c4;
  color: white;
}

.discord-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
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
  color: #b8aff7;
  transform: translateX(-2px);
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.home-link:hover .arrow-icon {
  transform: translateX(-2px);
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

  .toggle-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
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
