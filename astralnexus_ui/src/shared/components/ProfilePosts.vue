<template>
  <div id="profile-posts" class="py-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="text-dark-400">Loading posts...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="text-center py-12 text-gray-400">
      <p class="text-lg mb-2 text-[#b8aff7]">No posts yet</p>
      <p class="text-sm text-gray-600">Start sharing your thoughts with the community!</p>
    </div>

    <!-- Posts Grid -->
    <div v-else class="space-y-4">
      <!-- Post Card -->
      <article
        v-for="post in posts"
        :key="post.id"
        class="bg-[#270C3B] border border-[#542f87] rounded-lg p-6 hover:border-accent/30 transition-all duration-300 animate-fade-in cursor-pointer"
        @click="$emit('selectPost', post)"
      >
        <div class="flex items-start gap-4">
          <!-- Author Avatar -->
          <div
            class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold"
          >
            {{ getAvatarInitial(post.author?.name || post.author?.username || 'A') }}
          </div>

          <!-- Post Content -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-accent font-medium"
                >@{{ post.author?.username || 'username' }}</span
              >
              <span class="text-dark-400 text-sm">•</span>
              <span class="text-dark-400 text-sm">{{ formatTimeAgo(post.created_at) }}</span>
            </div>

            <h2
              class="text-lg font-semibold text-foreground mb-2 hover:text-accent transition-colors"
            >
              {{ post.title }}
            </h2>

            <p class="text-dark-300 mb-4 line-clamp-3">
              {{ post.content }}
            </p>

            <!-- Post Actions -->
            <div class="flex items-center gap-6 text-dark-400">
              <button
                class="flex items-center gap-2 hover:text-accent transition-colors"
                @click.stop="$emit('toggleComments', post)"
              >
                <MessageSquareMore class="w-4 h-4" />
                <span class="text-sm">{{ post.comments_count || 0 }}</span>
              </button>
              <button
                class="flex items-center gap-2 hover:text-primary-400 transition-colors"
                @click.stop="$emit('toggleLike', post)"
              >
                <ThumbsUp class="w-4 h-4" />
                <span class="text-sm">{{ post.likes_count || 0 }}</span>
              </button>
              <button
                class="flex items-center gap-2 hover:text-secondary-400 transition-colors"
                @click.stop="$emit('sharePost', post)"
              >
                <Repeat2 class="w-4 h-4" />
                <span class="text-sm">{{ post.shares_count || 0 }}</span>
              </button>
            </div>
          </div>

          <!-- More Options -->
          <button
            class="text-dark-400 hover:text-foreground transition-colors"
            @click.stop="$emit('showPostOptions', post)"
          >
            <Ellipsis class="w-5 h-5" />
          </button>
        </div>
      </article>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMore && !loading" class="text-center mt-8">
      <button
        class="px-6 py-3 border border-[#542f87] text-[#b8aff7] rounded-lg transition-all duration-300 hover:bg-[#542f87]/10"
        @click="$emit('loadMore')"
        :disabled="loadingMore"
      >
        {{ loadingMore ? 'Loading...' : 'Load More Posts' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MessageSquareMore, ThumbsUp, Ellipsis, Repeat2 } from 'lucide-vue-next'
import type { Post } from '@/shared/types'

// Props
interface Props {
  posts: Post[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  posts: () => [],
  loading: false,
  loadingMore: false,
  hasMore: true,
})

// Emits
const emit = defineEmits<{
  selectPost: [post: Post]
  toggleLike: [post: Post]
  toggleComments: [post: Post]
  sharePost: [post: Post]
  showPostOptions: [post: Post]
  loadMore: []
}>()

// Helper functions
const getAvatarInitial = (name: string): string => {
  return name.charAt(0).toUpperCase()
}

const formatTimeAgo = (dateString: string): string => {
  const now = new Date()
  const postDate = new Date(dateString)
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
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
