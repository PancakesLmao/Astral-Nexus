<template>
  <div class="profile-header">
    <!-- Cover Image -->
    <div class="cover-image">
      <div class="cover-static-bg"></div>
    </div>

    <!-- Profile Info -->
    <div class="profile-info relative">
      <div class="container profile-content flex">
        <!-- Profile Picture -->
        <div class="picture-container relative">
          <img :src="user.picture || defaultPicture" :alt="user.name" class="profile-picture" />
        </div>

        <!-- User Details -->
        <div class="user-details">
          <div class="user-main-info">
            <h1 class="user-name">{{ user.name || user.username }}</h1>
            <p class="username">@{{ user.username || 'user' }}</p>
            <div class="user-meta">
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="profile-actions">
            <button
              class="btn"
              :class="isFollowing ? 'btn-secondary' : 'btn-primary'"
              @click="$emit('follow')"
            >
              <UserPlus :size="18" />
              {{ isFollowing ? languageStore.t('following') : languageStore.t('follow') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import { useLanguageStore } from '../stores/language'
import type { User } from '@/shared/types'

// Language store
const languageStore = useLanguageStore()

interface Props {
  user: User
  isFollowing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFollowing: false,
})

const emit = defineEmits<{
  follow: []
}>()

const defaultPicture = '/src/shared/assets/6636876050dcade8ec8e3023b1afe9bc.png'
</script>

<style scoped>
.profile-header {
  position: relative;
  margin-bottom: 2rem;
  background: #0a0b0f;
  border-radius: 0 0 1rem 1rem;
  overflow: hidden;
}

.cover-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 0 0 1rem 1rem;
}

.cover-static-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #542f87 0%, #270c3b 50%, #b8aff7 100%);
}

.profile-info {
  margin-top: -100px;
  z-index: 10;
}

.profile-content {
  align-items: flex-end;
  gap: 2rem;
  padding: 0 2rem;
}

.picture-container {
  flex-shrink: 0;
}

.profile-picture {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 6px solid #0a0b0f;
  object-fit: cover;
  background: #270c3b;
}

.user-details {
  flex: 1;
  padding-bottom: 1rem;
  color: white;
}

.user-main-info {
  margin-bottom: 1rem;
}

.user-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #b8aff7;
  margin: 0;
  line-height: 1.2;
}

.username {
  font-size: 1.2rem;
  color: #888;
  margin: 0.5rem 0;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #542f87;
  color: white;
}

.btn-primary:hover {
  background: #6a3ba8;
  box-shadow: 0 4px 12px rgba(184, 175, 247, 0.3);
}

.btn-secondary {
  background: rgba(184, 175, 247, 0.1);
  color: #b8aff7;
  border: 1px solid rgba(184, 175, 247, 0.3);
}

.btn-secondary:hover {
  background: rgba(184, 175, 247, 0.2);
  border-color: rgba(184, 175, 247, 0.5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .cover-image {
    height: 200px;
  }

  .profile-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 1rem;
    gap: 1rem;
  }

  .profile-picture {
    width: 120px;
    height: 120px;
  }

  .user-name {
    font-size: 2rem;
  }

  .user-meta {
    justify-content: center;
  }

  .profile-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .profile-picture {
    width: 100px;
    height: 100px;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>
