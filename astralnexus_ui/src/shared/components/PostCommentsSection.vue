<template>
  <div class="bg-dark-800/30 border border-dark-700 rounded-lg p-6">
    <h3 class="text-xl font-semibold text-foreground mb-4">Comments</h3>

    <!-- Comment Form -->
    <div class="mb-6" v-if="allowComments && currentUser">
      <div class="flex gap-3">
        <div
          class="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center text-dark-900 font-semibold flex-shrink-0"
        >
          {{ getAvatarInitial(currentUser?.name || 'U') }}
        </div>
        <div class="flex-1">
          <textarea
            v-model="commentText"
            class="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-foreground placeholder-dark-400 focus:border-accent focus:outline-none resize-none"
            rows="3"
            placeholder="Write a comment..."
            :disabled="submitting"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              class="px-4 py-2 bg-accent text-dark-900 rounded-lg hover:bg-accent-light transition-colors font-medium disabled:opacity-50"
              @click="handleSubmit"
              :disabled="!commentText.trim() || submitting"
            >
              {{ submitting ? 'Posting...' : 'Post Comment' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login prompt -->
    <div v-else-if="allowComments && !currentUser" class="text-center py-4 text-dark-400">
      Please log in to comment
    </div>

    <!-- Comments List -->
    <div class="space-y-4">
      <div v-if="comments.length === 0 && !loading" class="text-center py-4 text-dark-400">
        No comments yet. Be the first to comment!
      </div>

      <div v-if="loading" class="text-center py-4 text-dark-400">Loading comments...</div>

      <!-- Comment Item -->
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-3 p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700/70 transition-colors"
      >
        <div
          class="w-10 h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
        >
          {{ getAvatarInitial(comment.author?.name || 'C') }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-accent font-medium">@{{ comment.author?.name || 'commenter' }}</span>
            <span class="text-dark-400 text-sm">{{ formatTimeAgo(comment.created_at) }}</span>
          </div>
          <p class="text-dark-200 whitespace-pre-wrap break-words">
            {{ comment.content }}
          </p>
          <div class="flex items-center gap-4 mt-2 text-sm text-dark-400">
            <button
              class="hover:text-accent transition-colors"
              @click="$emit('reply', comment)"
              v-if="allowComments && currentUser"
            >
              Reply
            </button>
            <CommentLikeButton
              :commentId="comment.id"
              :postId="postId"
              :isLiked="comment.is_liked"
              :likesCount="comment.likes_count"
              @update="handleCommentLikeUpdate"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Comment, User } from '@/shared/types'
import CommentLikeButton from './CommentLikeButton.vue'

interface Props {
  postId: string
  comments?: Comment[]
  currentUser?: User | null
  allowComments?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  comments: () => [],
  currentUser: null,
  allowComments: true,
  loading: false,
})

const emit = defineEmits<{
  submit: [content: string]
  reply: [comment: Comment]
  commentLikeUpdate: [commentId: string, isLiked: boolean, likesCount: number]
}>()

const commentText = ref('')
const submitting = ref(false)

const handleSubmit = async () => {
  if (!commentText.value.trim() || submitting.value) return

  submitting.value = true
  try {
    emit('submit', commentText.value.trim())
    commentText.value = ''
  } finally {
    submitting.value = false
  }
}

const handleCommentLikeUpdate = (commentId: string, isLiked: boolean, likesCount: number) => {
  // Find and update the comment in the local array
  const comment = props.comments.find((c) => c.id === commentId)
  if (comment) {
    // Only update if values actually changed to prevent unnecessary reactivity
    if (comment.is_liked !== isLiked || comment.likes_count !== likesCount) {
      comment.is_liked = isLiked
      comment.likes_count = likesCount
    }
  }
  // Emit to parent for any additional handling
  emit('commentLikeUpdate', commentId, isLiked, likesCount)
}

const getAvatarInitial = (name: string): string => {
  return name.charAt(0).toUpperCase()
}

const formatTimeAgo = (dateString: string): string => {
  const now = new Date()
  const postDate = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return `${Math.floor(diffInSeconds / 604800)}w ago`
}
</script>
