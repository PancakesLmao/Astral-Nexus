<template>
  <button
    class="flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      localIsLiked
        ? 'text-primary-400 hover:text-primary-300'
        : 'text-dark-400 hover:text-primary-400',
      buttonClass,
    ]"
    @click.stop="handleClick"
    :disabled="loading"
  >
    <ThumbsUp
      :class="['w-3 h-3 transition-transform', iconClass, { 'fill-current': localIsLiked }]"
    />
    <span :class="countClass">{{ localLikesCount }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ThumbsUp } from 'lucide-vue-next'
import { apiClient } from '@/shared/api'

interface Props {
  commentId: string
  postId: string
  isLiked?: boolean
  likesCount?: number
  iconClass?: string
  countClass?: string
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  isLiked: false,
  likesCount: 0,
  iconClass: '',
  countClass: 'text-sm',
  buttonClass: '',
})

const emit = defineEmits<{
  update: [commentId: string, isLiked: boolean, likesCount: number]
  error: [error: Error]
}>()

const loading = ref(false)
const localIsLiked = ref(false)
const localLikesCount = ref(0)

// Initialize from props only once on mount
onMounted(() => {
  localIsLiked.value = props.isLiked
  localLikesCount.value = props.likesCount
})

const handleClick = async () => {
  if (loading.value) {
    return
  }

  // Store original values for rollback
  const originalLiked = localIsLiked.value
  const originalCount = localLikesCount.value

  // Optimistic update
  localIsLiked.value = !originalLiked
  localLikesCount.value = originalLiked ? Math.max(0, originalCount - 1) : originalCount + 1

  loading.value = true
  try {
    // Call API to toggle like
    await apiClient.likeComment(props.commentId)

    // Fetch updated comments to get real state from server (like PostLikeButton does with fetchSinglePost)
    const comments = await apiClient.fetchComments(props.postId)
    const updatedComment = comments.find((c) => c.id === props.commentId)

    if (updatedComment) {
      // Update with server truth - backend uses snake_case 'is_liked'
      localIsLiked.value = updatedComment.is_liked ?? false
      localLikesCount.value = updatedComment.likes_count || 0

      // Emit update to parent
      emit('update', props.commentId, localIsLiked.value, localLikesCount.value)
    }
  } catch (error) {
    console.error('Failed to toggle comment like:', error)

    // Rollback on error
    localIsLiked.value = originalLiked
    localLikesCount.value = originalCount

    emit('error', error as Error)
  } finally {
    loading.value = false
  }
}
</script>
