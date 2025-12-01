<template>
  <!-- Dialog Overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
      @click="handleBackdropClick"
    >
      <!-- Dialog Content -->
      <div
        class="bg-dark-800 border border-dark-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-visible"
        @click.stop
      >
        <!-- Dialog Header -->
        <div class="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 class="text-xs font-semibold text-foreground">Post Details</h2>
          <button
            class="text-dark-400 hover:text-foreground transition-colors"
            @click="$emit('close')"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Post Content -->
        <div class="p-6" @click="closeMenu">
          <div v-if="post">
            <!-- Post Header -->
            <article class="bg-[#542f87] border border-[#542f87] rounded-lg p-8 mb-6 relative">
              <div class="flex items-start gap-4 mb-6">
                <!-- Author Avatar -->
                <div
                  class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl"
                >
                  {{ getAvatarInitial(post.author?.name || 'A') }}
                </div>

                <!-- Post Meta -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-accent font-semibold text-lg">{{
                      post.author?.name || 'Anonymous'
                    }}</span>
                    <span class="text-dark-400">•</span>
                    <span class="text-dark-400">{{ formatTimeAgo(post.created_at) }}</span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-dark-400">
                    <span v-if="post.game_category">{{ post.game_category }}</span>
                    <span v-if="post.game_category && post.post_type">•</span>
                    <span v-if="post.post_type">{{ post.post_type }}</span>
                  </div>
                </div>

                <!-- More Options -->
                <div class="relative group">
                  <button
                    class="text-dark-400 hover:text-foreground transition-colors p-2 hover:bg-dark-700 rounded"
                    @click.stop="showOptions = !showOptions"
                    title="Post options"
                  >
                    <Ellipsis class="w-6 h-6" />
                  </button>

                  <!-- Delete Menu -->
                  <div
                    v-show="showOptions"
                    class="absolute right-0 top-full mt-1 border-2 border-accent rounded-lg shadow-xl z-50 min-w-[200px]"
                    :style="{ backgroundColor: '#270C3B' }"
                    @click.stop
                  >
                    <button
                      v-if="isPostOwner"
                      class="w-full px-4 py-2 text-left text-white font-medium hover:bg-white/10 transition-colors text-sm first:rounded-t-lg last:rounded-b-lg"
                      @click="handleDeletePost"
                      :disabled="deleting"
                    >
                      {{ deleting ? 'Deleting...' : 'Delete Post' }}
                    </button>
                    <button
                      v-if="isPostOwner"
                      class="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors text-sm opacity-50 cursor-not-allowed"
                      disabled
                      title="Edit functionality coming soon"
                    >
                      Edit (TODO)
                    </button>
                    <button
                      v-if="!isPostOwner"
                      class="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors text-sm opacity-50 cursor-not-allowed first:rounded-t-lg"
                      disabled
                      title="Report functionality coming soon"
                    >
                      Report (TODO)
                    </button>
                    <button
                      class="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors text-sm opacity-50 cursor-not-allowed last:rounded-b-lg"
                      disabled
                      title="Copy link functionality coming soon"
                    >
                      Copy Link (TODO)
                    </button>
                  </div>
                </div>
              </div>

              <!-- Post Title -->
              <h1 class="text-3xl font-bold text-foreground mb-4">
                {{ post.title }}
              </h1>

              <!-- Post Content -->
              <div class="prose prose-invert max-w-none mb-6">
                <div class="text-dark-200 leading-relaxed whitespace-pre-wrap">
                  {{ post.content }}
                </div>
              </div>

              <!-- Post Tags -->
              <div v-if="post.tags && post.tags.length > 0" class="mb-6">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="px-3 py-1 bg-dark-700 text-accent text-sm rounded-full"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>

              <!-- Post Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-dark-700">
                <div class="flex items-center gap-6">
                  <button
                    class="flex items-center gap-2 text-dark-400 hover:text-accent transition-colors"
                    @click="$emit('toggleComments', post)"
                  >
                    <MessageSquareMore class="w-5 h-5" />
                    <span>{{ post.comments_count || 0 }} Comments</span>
                  </button>
                  <button
                    class="flex items-center gap-2 transition-colors"
                    :class="
                      post.is_liked
                        ? 'text-primary-400 hover:text-primary-300'
                        : 'text-dark-400 hover:text-primary-400'
                    "
                    @click="handleToggleLike(post)"
                  >
                    <ThumbsUp class="w-5 h-5" :class="{ 'fill-current': post.is_liked }" />
                    <span>{{ post.likes_count || 0 }} Likes</span>
                  </button>
                  <button
                    class="flex items-center gap-2 text-dark-400 hover:text-secondary-400 transition-colors"
                    @click="$emit('sharePost', post)"
                  >
                    <Repeat2 class="w-5 h-5" />
                    <span>{{ post.shares_count || 0 }} Shares</span>
                  </button>
                </div>
              </div>
            </article>

            <!-- Comments Section -->
            <div class="bg-dark-800/30 border border-dark-700 rounded-lg p-6">
              <h3 class="text-xs font-semibold text-foreground mb-4">Comments</h3>

              <!-- Comment Form -->
              <div class="mb-6" v-if="allowComments">
                <div class="flex gap-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center text-dark-900 font-semibold"
                  >
                    {{ getAvatarInitial(currentUser?.name || 'U') }}
                  </div>
                  <div class="flex-1">
                    <textarea
                      v-model="newComment"
                      class="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-foreground placeholder-dark-400 focus:border-accent focus:outline-none resize-none"
                      rows="3"
                      placeholder="Write a comment..."
                      :disabled="submittingComment"
                    ></textarea>
                    <div class="flex justify-end mt-2">
                      <button
                        class="px-4 py-2 bg-accent text-dark-900 rounded-lg hover:bg-accent-light transition-colors font-medium disabled:opacity-50"
                        @click="submitComment"
                        :disabled="!newComment.trim() || submittingComment"
                      >
                        {{ submittingComment ? 'Posting...' : 'Post Comment' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comments List -->
              <div class="space-y-4">
                <div
                  v-if="comments.length === 0 && !loadingComments"
                  class="text-center py-4 text-dark-400"
                >
                  No comments yet. Be the first to comment!
                </div>

                <div v-if="loadingComments" class="text-center py-4 text-dark-400">
                  Loading comments...
                </div>

                <!-- Comment Item -->
                <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="flex gap-3 p-4 bg-dark-700/50 rounded-lg"
                >
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold"
                  >
                    {{ getAvatarInitial(comment.author?.name || 'C') }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-accent font-medium"
                        >@{{ comment.author?.name || 'commenter' }}</span
                      >
                      <span class="text-dark-400 text-sm">{{
                        formatTimeAgo(comment.created_at)
                      }}</span>
                    </div>
                    <p class="text-dark-200 whitespace-pre-wrap">
                      {{ comment.content }}
                    </p>
                    <div class="flex items-center gap-4 mt-2 text-sm text-dark-400">
                      <button
                        class="hover:text-accent transition-colors"
                        @click="$emit('replyToComment', comment)"
                      >
                        Reply
                      </button>
                      <button
                        class="flex items-center gap-1 hover:text-primary-400 transition-colors"
                        @click="$emit('toggleCommentLike', comment)"
                      >
                        <ThumbsUp class="w-3 h-3" />
                        <span>{{ comment.likes_count || 0 }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else class="text-center py-8">
            <div class="text-dark-400">Loading post...</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { MessageSquareMore, ThumbsUp, Ellipsis, Repeat2, X } from 'lucide-vue-next'
import type { Post, Comment, User } from '@/shared/types'
import { usePostsStore } from '@/shared/stores/posts'
import { useUserStore } from '@/shared/stores/user'
import { apiClient } from '@/shared/api'

// Props
interface Props {
  isOpen: boolean
  post: Post | null
  comments?: Comment[]
  currentUser?: User | null
  allowComments?: boolean
  loadingComments?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  post: null,
  comments: () => [],
  currentUser: null,
  allowComments: true,
  loadingComments: false,
})

// Emits
const emit = defineEmits<{
  close: []
  toggleComments: [post: Post]
  sharePost: [post: Post]
  showPostOptions: [post: Post]
  submitComment: [content: string, postId: number | string]
  replyToComment: [comment: Comment]
  toggleCommentLike: [comment: Comment]
  deletePost: [postId: string | number]
  openPostOptions: []
}>()

const newComment = ref('')
const submittingComment = ref(false)
const showOptions = ref(false)
const deleting = ref(false)

// Use the posts store and user store
const postsStore = usePostsStore()
const userStore = useUserStore()

// Check if current user is the post owner
const isPostOwner = computed(() => {
  // First try to use the prop currentUser, then fall back to store user
  const user = props.currentUser || userStore.user

  if (!props.post || !user) {
    console.log('PostDetail: Missing post or user', {
      hasPost: !!props.post,
      hasPropUser: !!props.currentUser,
      hasStoreUser: !!userStore.user,
    })
    return false
  }
  const isOwner = props.post.author_id === user.id
  console.log('PostDetail: Checking ownership', {
    postAuthorId: props.post.author_id,
    userId: user.id,
    isOwner,
  })
  return isOwner
})

const handleToggleLike = async (post: Post) => {
  try {
    await postsStore.likePost(post.id.toString())
  } catch (error) {
    console.error('Failed to like post:', error)
  }
}

// Delete post handler
const handleDeletePost = async () => {
  if (!props.post) return

  // Use prop user if available, otherwise use store user
  const user = props.currentUser || userStore.user
  if (!user) return

  if (!window.confirm('Are you sure you want to delete this post?')) return

  deleting.value = true
  try {
    await apiClient.deleteUserPost(user.id, props.post.id.toString())
    showOptions.value = false
    emit('deletePost', props.post.id)
    emit('close')
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('Failed to delete post. Please try again.')
  } finally {
    deleting.value = false
  }
}

// Methods
const handleBackdropClick = () => {
  emit('close')
}

const closeMenu = () => {
  showOptions.value = false
}

const submitComment = async () => {
  if (!newComment.value.trim() || !props.post) return

  submittingComment.value = true
  try {
    emit('submitComment', newComment.value.trim(), props.post.id)
    newComment.value = ''
  } finally {
    submittingComment.value = false
  }
}

const getAvatarInitial = (name: string): string => {
  return name.charAt(0).toUpperCase()
}

const formatTimeAgo = (dateString: string): string => {
  try {
    const now = new Date()
    const postDate = new Date(dateString)

    // Check if the date is valid
    if (isNaN(postDate.getTime())) {
      return 'recently'
    }

    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`
    }
  } catch (error) {
    return 'recently'
  }
}

// Watch for dialog close to reset form
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      newComment.value = ''
      submittingComment.value = false
      showOptions.value = false
    }
  },
)
</script>
