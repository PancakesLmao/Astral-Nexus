<template>
  <!-- Dialog Overlay -->
  <div v-if="isOpen" class="fixed inset-0 z-[1000] overflow-y-auto">
    <!-- Desktop Layout (sm and above) -->
    <div
      class="desktop-dialog hidden sm:flex min-h-full items-center justify-center p-4 text-center dialog-container"
      @click="closeDialog"
    >
      <!-- Background -->
      <div
        class="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      ></div>

      <!-- Dialog Panel (Desktop) -->
      <div
        class="relative transform overflow-y-auto rounded-xl bg-dark-900 border border-accent/30 px-6 pb-6 pt-5 text-left shadow-xl transition-all w-full max-w-2xl sm:my-8 dialog-panel"
        @click.stop
      >
        <!-- Dialog Header and Visibility -->
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-accent">Create New Post</h3>
            <button @click="closeDialog" class="text-gray-400 hover:text-white transition-colors" aria-label="Close dialog">
              <X :size="20" />
            </button>
          </div>
          <!-- Visibility Select -->
          <div class="mt-3 w-1/2 max-w-xs">
            <label for="visibility" class="block text-sm font-medium text-gray-300 mb-1">
              Visibility
            </label>
            <select
              id="visibility"
              v-model="formData.visibility"
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
            >
              <option value="public">Public</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <!-- Post Form -->
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <!-- Title Input -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              required
              placeholder="What's your post about?"
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white placeholder-gray-400 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
            />
          </div>

          <!-- Game Category and Post Type -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Game Category Select -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-300 mb-1">
                Game Category
              </label>
              <select
                id="category"
                v-model="formData.game_category"
                class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
              >
                <option value="">Select a game</option>
                <option value="genshin">Genshin Impact</option>
                <option value="hsr">Honkai Star Rail</option>
                <option value="zzz">Zenless Zone Zero</option>
                <option value="hi3">Honkai Impact 3rd</option>
                <option value="tot">Tears of Themis</option>
              </select>
            </div>

            <!-- Post Type Select -->
            <div>
              <label for="post_type" class="block text-sm font-medium text-gray-300 mb-1">
                Post Type
              </label>
              <select
                id="post_type"
                v-model="formData.post_type"
                class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
              >
                <option value="general">General Discussion</option>
                <option value="guide">Guide</option>
                <option value="news">News</option>
                <option value="fanart">Fan Art</option>
                <option value="theory">Theory</option>
                <option value="question">Question</option>
              </select>
            </div>
          </div>

          <!-- Content Textarea -->
          <div>
            <label for="content" class="block text-sm font-medium text-gray-300 mb-1">
              Content
            </label>
            <textarea
              id="content"
              v-model="formData.content"
              required
              rows="3"
              placeholder="Share your thoughts..."
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white placeholder-gray-400 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Tags Input -->
          <div>
            <label for="tags" class="block text-sm font-medium text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="gaming, tips, discussion"
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white placeholder-gray-400 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              @click="closeDialog"
              class="px-4 py-2 text-sm font-medium text-gray-300 bg-dark-700 border border-gray-600 rounded-lg hover:bg-dark-600 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !formData.title || !formData.content"
              class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-accent-dark to-accent rounded-lg hover:from-accent to-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </span>
              <span v-else>Create Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Mobile Layout (below sm) -->
    <div
      class="mobile-dialog flex sm:hidden profile-modal-overlay"
      @click="closeDialog"
    >
      <!-- Dialog Panel (Mobile) -->
      <div
        class="profile-modal w-full max-w-[400px] overflow-y-auto"
        @click.stop
      >
        <!-- Dialog Header -->
        <div class="modal-header">
          <h3 class="text-lg font-semibold text-accent">Create New Post</h3>
          <button class="close-btn" @click="closeDialog" aria-label="Close dialog">
            <X :size="20" />
          </button>
        </div>

        <!-- Post Form -->
        <form @submit.prevent="handleSubmit" class="space-y-3 px-4 pb-4">
          <!-- Title Input -->
          <div>
            <label for="title-mobile" class="block text-xs font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              id="title-mobile"
              v-model="formData.title"
              type="text"
              required
              placeholder="What's your post about?"
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white placeholder-gray-400 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
            />
          </div>

          <!-- Game Category and Post Type -->
          <div class="grid grid-cols-1 gap-3">
            <!-- Game Category Select -->
            <div>
              <label for="category-mobile" class="block text-xs font-medium text-gray-300 mb-1">
                Game Category
              </label>
              <select
                id="category-mobile"
                v-model="formData.game_category"
                class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
              >
                <option value="">Select a game</option>
                <option value="genshin">Genshin Impact</option>
                <option value="hsr">Honkai Star Rail</option>
                <option value="zzz">Zenless Zone Zero</option>
                <option value="hi3">Honkai Impact 3rd</option>
                <option value="tot">Tears of Themis</option>
              </select>
            </div>

            <!-- Post Type Select -->
            <div>
              <label for="post_type-mobile" class="block text-xs font-medium text-gray-300 mb-1">
                Post Type
              </label>
              <select
                id="post_type-mobile"
                v-model="formData.post_type"
                class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
              >
                <option value="general">General Discussion</option>
                <option value="guide">Guide</option>
                <option value="news">News</option>
                <option value="fanart">Fan Art</option>
                <option value="theory">Theory</option>
                <option value="question">Question</option>
              </select>
            </div>
          </div>

          <!-- Content Textarea -->
          <div>
            <label for="content-mobile" class="block text-xs font-medium text-gray-300 mb-1">
              Content
            </label>
            <textarea
              id="content-mobile"
              v-model="formData.content"
              required
              rows="3"
              placeholder="Share your thoughts..."
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white placeholder-gray-400 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Tags Input -->
          <div>
            <label for="tags-mobile" class="block text-xs font-medium text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              id="tags-mobile"
              v-model="tagsInput"
              type="text"
              placeholder="gaming, tips, discussion"
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white placeholder-gray-400 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
            />
          </div>

          <!-- Visibility Select -->
          <div>
            <label for="visibility-mobile" class="block text-xs font-medium text-gray-300 mb-1">
              Visibility
            </label>
            <select
              id="visibility-mobile"
              v-model="formData.visibility"
              class="w-full px-3 py-2 bg-dark-800 border border-accent/30 rounded-lg text-white text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
            >
              <option value="public">Public</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-2 pt-3">
            <button
              type="button"
              @click="closeDialog"
              class="px-4 py-2 text-sm font-medium text-gray-300 bg-dark-700 border border-gray-600 rounded-lg hover:bg-dark-600 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !formData.title || !formData.content"
              class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-accent-dark to-accent rounded-lg hover:from-accent to-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </span>
              <span v-else>Create Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import { usePostsStore } from '@/shared/stores/posts'
import { CreatePostRequest } from '@/shared/types'

interface Props {
  isOpen: boolean
  user?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'created', post: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const postsStore = usePostsStore()
const isSubmitting = ref(false)
const tagsInput = ref('')

// Form data
const formData = ref<CreatePostRequest>({
  title: '',
  content: '',
  game_category: '',
  post_type: 'general',
  tags: [],
  visibility: 'public',
})

// Convert tags input to array
const parsedTags = computed(() => {
  return tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
})

// Update formData tags when parsedTags changes
watch(parsedTags, (newTags) => {
  formData.value.tags = newTags
})

// Reset form when dialog opens/closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    } else {
      console.log('NewPost dialog opened, isOpen:', isOpen, 'Screen width:', window.innerWidth)
    }
  },
)

const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    game_category: '',
    post_type: 'general',
    tags: [],
    visibility: 'public',
  }
  tagsInput.value = ''
}

const closeDialog = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!props.user) {
    console.error('User not found')
    return
  }

  isSubmitting.value = true

  try {
    // Create the post using the store
    const newPost = await postsStore.createPost(formData.value, props.user)

    // Emit success event
    emit('created', newPost)

    // Close dialog
    closeDialog()

    console.log('Post created successfully:', newPost)
  } catch (error) {
    console.error('Failed to create post:', error)
    // You could add toast notification here
  } finally {
    isSubmitting.value = false
  }
}

// Debug log on mount to check for duplicate instances
onMounted(() => {
  console.log('NewPost component mounted, isOpen:', props.isOpen)
})
</script>

<style scoped>
/* Custom backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Dialog container adjustments */
.dialog-container {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Desktop-specific styles */
.desktop-dialog {
  display: none;
}

@media (min-width: 640px) {
  .desktop-dialog {
    display: flex;
  }

  .dialog-panel {
    max-height: calc(100vh - 4rem); /* Account for top/bottom padding */
    overflow-y: auto;
  }
}

/* Mobile-specific styles (aligned with profile modal) */
.mobile-dialog {
  display: flex;
}

@media (min-width: 640px) {
  .mobile-dialog {
    display: none !important;
  }
}

.profile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.profile-modal {
  background: rgba(10, 11, 15, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  max-width: 400px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(184, 175, 247, 0.2);
}

.close-btn {
  background: rgba(184, 175, 247, 0.1);
  border: 1px solid rgba(184, 175, 247, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b8aff7;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(184, 175, 247, 0.2);
}

/* Scrollbar for mobile dialog panel */
.profile-modal {
  scrollbar-width: thin;
  scrollbar-color: #542f87 rgba(10, 11, 15, 0.1);
}

.profile-modal::-webkit-scrollbar {
  width: 6px;
}

.profile-modal::-webkit-scrollbar-track {
  background: rgba(10, 11, 15, 0.1);
  border-radius: 3px;
}

.profile-modal::-webkit-scrollbar-thumb {
  background: #542f87;
  border-radius: 3px;
}

.profile-modal::-webkit-scrollbar-thumb:hover {
  background: #b8aff7;
}

/* Accent colors */
.accent-dark {
  color: #542f87;
}

.accent-light {
  color: #c9c0ff;
}

/* Mobile form adjustments */
@media (max-width: 639.98px) {
  .dialog-container {
    padding: 0;
  }

  input,
  select,
  textarea {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  button {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
