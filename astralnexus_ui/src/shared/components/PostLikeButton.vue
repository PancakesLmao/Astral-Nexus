<template>
  <button
    class="flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      localIsLiked
        ? 'text-primary-400 hover:text-primary-300'
        : 'text-dark-400 hover:text-primary-400',
      buttonClass,
    ]"
    @click.stop="handleClick"
    :disabled="loading"
  >
    <ThumbsUp :class="['transition-transform', iconClass, { 'fill-current': localIsLiked }]" />
    <span v-if="showCount" :class="countClass">{{ localLikesCount }}</span>
    <span v-if="showLabel" :class="labelClass">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ThumbsUp } from 'lucide-vue-next'
import { apiClient } from '@/shared/api'

interface Props {
  postId: string
  isLiked?: boolean
  likesCount?: number
  showCount?: boolean
  showLabel?: boolean
  label?: string
  iconClass?: string
  countClass?: string
  labelClass?: string
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  isLiked: false,
  likesCount: 0,
  showCount: true,
  showLabel: false,
  label: 'Likes',
  iconClass: 'w-5 h-5',
  countClass: 'text-sm',
  labelClass: 'text-sm',
  buttonClass: '',
})

const emit = defineEmits<{
  update: [isLiked: boolean, likesCount: number]
  error: [error: Error]
}>()

const loading = ref(false)
const localIsLiked = ref(props.isLiked)
const localLikesCount = ref(props.likesCount)

// Watch props to keep internal state synced
watch(
  () => props.isLiked,
  (newVal) => {
    localIsLiked.value = newVal
  },
)

watch(
  () => props.likesCount,
  (newVal) => {
    localLikesCount.value = newVal
  },
)

const handleClick = async () => {
  if (loading.value) return

  // Store original values for rollback
  const originalLiked = localIsLiked.value
  const originalCount = localLikesCount.value

  // Optimistic update
  localIsLiked.value = !originalLiked
  localLikesCount.value = originalLiked ? Math.max(0, originalCount - 1) : originalCount + 1

  loading.value = true
  try {
    // Call API
    await apiClient.likePost(props.postId)

    // Fetch real state from server to ensure sync
    const updatedPost = await apiClient.fetchSinglePost(props.postId)

    // Update with server truth
    localIsLiked.value = updatedPost.is_liked || false
    localLikesCount.value = updatedPost.likes_count || 0

    // Emit update to parent
    emit('update', localIsLiked.value, localLikesCount.value)
  } catch (error) {
    console.error('Failed to toggle like:', error)

    // Rollback on error
    localIsLiked.value = originalLiked
    localLikesCount.value = originalCount

    emit('error', error as Error)
  } finally {
    loading.value = false
  }
}
</script>
