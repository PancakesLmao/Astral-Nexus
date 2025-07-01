<template>
  <div class="login min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative">
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
          {{ isSignUp ? languageStore.t('createAccount') : languageStore.t('welcomeBack') }}
        </h1>

        <!-- Mode Toggle Buttons -->
        <div class="mode-toggle">
          <button
            class="toggle-btn"
            :class="{ 'active': !isSignUp }"
            @click="isSignUp = false"
          >
            {{ languageStore.t('signIn') }}
          </button>
          <button
            class="toggle-btn"
            :class="{ 'active': isSignUp }"
            @click="isSignUp = true"
          >
            {{ languageStore.t('signUp') }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="auth-form d-flex flex-column">
          <div v-if="isSignUp" class="form-group d-flex flex-column">
            <label class="form-label">{{ languageStore.t('username') }}</label>
            <input
              v-model="formData.username"
              type="text"
              class="form-control"
              :placeholder="languageStore.t('usernamePlaceholder')"
              required
            >
          </div>

          <!-- Email -->
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

          <!-- Password -->
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

          <!-- Confirm Password (Sign Up only) -->
          <div v-if="isSignUp" class="form-group">
            <label class="form-label">{{ languageStore.t('confirmPassword') }}</label>
            <input
              v-model="formData.confirmPassword"
              type="password"
              class="form-control"
              :placeholder="languageStore.t('confirmPasswordPlaceholder')"
              required
            >
          </div>

          <!-- Forgot Password (Sign In only) -->
          <div v-if="!isSignUp" class="form-group text-end">
            <a href="#" class="forgot-password">
              {{ languageStore.t('forgotPassword') }}
            </a>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="auth-btn position-relative d-flex align-items-center justify-content-center">
            <svg>
              <rect x="0" y="0" fill="none" width="100%" height="100%"/>
            </svg>
            {{ isSignUp ? languageStore.t('signUp') : languageStore.t('signIn') }}
          </button>
        </form>

        <!-- Switch Mode Text -->
        <div class="switch-mode text-center">
          <span class="switch-text">
            {{ isSignUp ? languageStore.t('alreadyHaveAccount') : languageStore.t('dontHaveAccount') }}
          </span>
          <button
            class="switch-btn"
            @click="isSignUp = !isSignUp"
          >
            {{ isSignUp ? languageStore.t('signIn') : languageStore.t('signUp') }}
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import { useLanguageStore } from '@/shared/stores/language';

const languageStore = useLanguageStore();
const router = useRouter();

// Initialize language on component mount
onMounted(() => {
  languageStore.initializeLanguage();
});

const isSignUp = ref(false);
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Form submission handler
const handleSubmit = () => {
  if (isSignUp.value) {
    if (formData.value.password !== formData.value.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Sign up data:', formData.value);
    // TODO: Implement actual sign up API call
  } else {
    // Sign in logic
    console.log('Sign in data:', {
      email: formData.value.email,
      password: formData.value.password
    });
    // TODO: Implement actual sign in API call
  }
};

const resetForm = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
};

// Watch for mode changes to reset form
import { watch } from 'vue';
watch(isSignUp, () => {
  resetForm();
});
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
  background: linear-gradient(135deg, #D1EAFD, #B8AFF7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mode-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 0.25rem;
  gap: 0.25rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.toggle-btn.active {
  background: rgba(184, 175, 247, 0.2);
  color: #B8AFF7;
  font-weight: 600;
}

.toggle-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.auth-form {
  gap: 1.5rem;
}

.form-group {
  gap: 0.5rem;
}

.form-label {
  color: #D1EAFD;
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
  border-color: #B8AFF7;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(184, 175, 247, 0.1);
}

.forgot-password {
  color: #B8AFF7;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #D1EAFD;
  text-decoration: underline;
}

.auth-btn {
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  color: #D1EAFD;
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
  stroke: #D1EAFD;
  stroke-width: 2;
  stroke-dasharray: 300, 0;
  transition: all 0.35s linear;
  rx: 8px;
  ry: 8px;
}

.auth-btn:hover {
  color: #D1EAFD;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.auth-btn:hover rect {
  stroke-width: 3;
  stroke-dasharray: 15, 285;
  stroke-dashoffset: 30;
  transition: all 1.35s cubic-bezier(0.19, 1, 0.22, 1);
}

.switch-mode {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.switch-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.switch-btn {
  background: none;
  border: none;
  color: #B8AFF7;
  cursor: pointer;
  font-weight: 600;
  margin-left: 0.5rem;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.switch-btn:hover {
  color: #D1EAFD;
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
  color: #B8AFF7;
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
