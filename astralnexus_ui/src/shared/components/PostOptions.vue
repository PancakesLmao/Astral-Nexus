<template>
  <div v-if="isOpen" class="fixed inset-0 z-40" @click="closeMenu">
    <!-- Dropdown Menu -->
    <div
      class="absolute bg-dark-800 border-2 border-accent rounded-lg shadow-xl z-[1000] w-48"
      :style="{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        maxHeight: 'calc(100vh - 20px)',
        overflowY: 'auto',
        backgroundColor: '#270C3B',
      }"
      @click.stop
    >
      <!-- Delete Button (only for owner) -->
      <button
        v-if="isOwner"
        class="w-full px-4 py-2 text-left text-white font-medium transition-colors text-sm first:rounded-t-lg hover:bg-white/10 focus:outline-none"
        @click="handleDelete"
        :disabled="deleting"
      >
        {{ deleting ? 'Deleting...' : 'Delete Post' }}
      </button>

      <!-- Edit Button (only for owner) - TODO -->
      <button
        v-if="isOwner"
        class="w-full px-4 py-2 text-left text-white transition-colors text-sm opacity-50 cursor-not-allowed hover:bg-white/10"
        disabled
        title="Edit functionality coming soon"
      >
        Edit (TODO)
      </button>

      <!-- Report Button (for non-owners) - TODO -->
      <button
        v-if="!isOwner"
        class="w-full px-4 py-2 text-left text-white transition-colors text-sm first:rounded-t-lg opacity-50 cursor-not-allowed hover:bg-white/10"
        disabled
        title="Report functionality coming soon"
      >
        Report (TODO)
      </button>

      <!-- Copy Link - TODO -->
      <button
        class="w-full px-4 py-2 text-left text-white transition-colors text-sm opacity-50 cursor-not-allowed last:rounded-b-lg hover:bg-white/10"
        disabled
        title="Copy link functionality coming soon"
      >
        Copy Link (TODO)
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Post } from '@/shared/types'
import { apiClient } from '@/shared/api'

interface Props {
  isOpen: boolean
  post: Post | null
  position: { top: number; left: number }
  isOwner: boolean
  userId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  delete: [postId: string | number]
  edit: [post: Post]
  report: [post: Post]
}>()

const deleting = ref(false)

// Calculate adjusted position to prevent overflow
const adjustedPosition = computed(() => {
  const MENU_WIDTH = 192 // w-48 = 12rem = 192px
  const MENU_HEIGHT = 180 // Approximate height for 4 items
  const PADDING = 10

  let top = props.position.top
  let left = props.position.left

  // Adjust for right overflow
  if (typeof window !== 'undefined') {
    if (left + MENU_WIDTH + PADDING > window.innerWidth) {
      left = window.innerWidth - MENU_WIDTH - PADDING
    }
    // Adjust for bottom overflow
    if (top + MENU_HEIGHT + PADDING > window.innerHeight) {
      top = Math.max(PADDING, top - MENU_HEIGHT - 5)
    }
  }

  return { top, left }
})

const closeMenu = () => {
  emit('close')
}

const handleDelete = async () => {
  if (!props.post || !props.userId) return

  if (!window.confirm('Are you sure you want to delete this post?')) return

  deleting.value = true
  try {
    await apiClient.deleteUserPost(props.userId, props.post.id.toString())
    emit('delete', props.post.id)
    emit('close')
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('Failed to delete post. Please try again.')
  } finally {
    deleting.value = false
  }
}
</script>
