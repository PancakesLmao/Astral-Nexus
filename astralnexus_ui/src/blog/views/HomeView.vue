<template>
  <div id="home" class="px-5 py-0">
    <div class="search-bar mb-4">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Search..."
        class="form-control"
      />
    </div>
    <!-- Content list -->
    <PostList
      :posts="posts"
      :loading="isLoading"
      :loading-more="isLoadingMore"
      :has-more="hasMorePosts"
      @select-post="openPostDetail"
      @toggle-like="handleLike"
      @toggle-comments="handleComments"
      @share-post="handleShare"
      @show-post-options="showPostOptions"
      @load-more="loadMorePosts"
    />
    <PostDetail
      :is-open="showPostDetail"
      :post="selectedPost"
      :comments="postComments"
      :current-user="currentUser"
      :loading-comments="loadingComments"
      :allow-comments="true"
      @close="closePostDetail"
      @toggle-like="handleLike"
      @submit-comment="submitComment"
      @reply-to-comment="handleReply"
      @toggle-comment-like="handleCommentLike"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PostList from '@/shared/components/PostList.vue'
import PostDetail from '@/shared/components/PostDetail.vue'
import type { Post, Comment, User } from '@/shared/types'

// Sample current user (you'll get this from your auth system)
const currentUser = ref<User>({
  id: 1,
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  avatar: undefined,
  bio: 'Just a test user exploring the platform',
  created_at: '2024-01-01T00:00:00Z',
})

// Sample posts data
const posts = ref<Post[]>([
  {
    id: 1,
    title: 'Epic Genshin Impact Adventure: Exploring the New Region',
    content: `Just finished exploring the new region in Genshin Impact and I'm absolutely blown away! The attention to detail in the environment design is incredible.

The new quests really dive deep into the lore of this world, and the character development is top-notch. I especially loved the puzzle mechanics - they're challenging but not frustrating.

Has anyone else tried the new boss fight? I'd love to hear your strategies! The rewards are definitely worth the effort.

What's your favorite part about the new update? Let me know in the comments!`,
    author: {
      id: 123,
      username: 'genshin_explorer',
      name: 'Alex Chen',
      email: 'alex@example.com',
      bio: 'Genshin Impact enthusiast and adventure seeker',
      created_at: '2024-01-01T00:00:00Z',
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    comments_count: 15,
    likes_count: 42,
    shares_count: 8,
    game_category: 'Genshin Impact',
    post_type: 'Discussion',
    tags: ['genshin', 'exploration', 'new-region', 'adventure'],
    is_liked: false,
    is_bookmarked: false,
    visibility: 'public',
  },
  {
    id: 2,
    title: 'Honkai Star Rail: Best Team Compositions for Endgame',
    content: `After months of testing different team compositions, I've found some incredible synergies that have helped me clear the most challenging content.

Here are my top 3 recommendations:

1. **Hypercarry Jingliu Team**: Jingliu + Bronya + Tingyun + Bailu
   - Incredible single-target damage
   - Great for boss fights

2. **DoT Team**: Kafka + Sampo + Silver Wolf + Bailu
   - Amazing for multi-enemy scenarios
   - Consistent damage over time

3. **Break Team**: Xueyi + Ruan Mei + Harmony Trailblazer + Gallagher
   - Super fun to play
   - Great for newer players

What teams have you been running? I'd love to see your compositions and strategies!`,
    author: {
      id: 456,
      username: 'star_rail_strategist',
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      bio: 'Honkai Star Rail theorycrafting expert',
      created_at: '2024-01-02T00:00:00Z',
    },
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T15:45:00Z',
    comments_count: 23,
    likes_count: 67,
    shares_count: 12,
    game_category: 'Honkai Star Rail',
    post_type: 'Guide',
    tags: ['honkai-star-rail', 'teams', 'strategy', 'endgame'],
    is_liked: true,
    is_bookmarked: true,
    visibility: 'public',
  },
  {
    id: 3,
    title: 'Zenless Zone Zero: First Impressions and Gameplay Review',
    content: `Just got early access to Zenless Zone Zero and I'm here to share my first impressions!

**What I Love:**
• The combat system feels incredibly smooth and responsive
• Character designs are absolutely stunning
• The urban aesthetic is a refreshing change from fantasy settings
• Sound design and music are phenomenal

**Areas for Improvement:**
• Tutorial could be more comprehensive
• Some UI elements feel cluttered
• Battery consumption on mobile is quite high

**Overall Rating: 8.5/10**

The game has incredible potential and I can't wait to see how it evolves. The beta has been a blast so far!

Are you planning to play when it launches? What are you most excited about?`,
    author: {
      id: 789,
      username: 'zzz_beta_tester',
      name: 'Jordan Kim',
      email: 'jordan@example.com',
      bio: 'Game reviewer and beta tester',
      created_at: '2024-01-03T00:00:00Z',
    },
    created_at: '2024-01-13T09:20:00Z',
    updated_at: '2024-01-13T09:20:00Z',
    comments_count: 31,
    likes_count: 89,
    shares_count: 18,
    game_category: 'Zenless Zone Zero',
    post_type: 'Review',
    tags: ['zenless-zone-zero', 'beta', 'review', 'first-impressions'],
    is_liked: false,
    is_bookmarked: false,
    visibility: 'public',
  },
])

// Sample comments for post detail
const postComments = ref<Comment[]>([
  {
    id: 1,
    content:
      'Great post! I totally agree about the new region. The music there is absolutely beautiful too!',
    author: {
      id: 201,
      username: 'music_lover',
      name: 'Sam Wilson',
      created_at: '2024-01-01T00:00:00Z',
    },
    post_id: 1,
    created_at: '2024-01-15T11:15:00Z',
    likes_count: 5,
    is_liked: false,
  },
  {
    id: 2,
    content:
      'The boss fight was challenging but so rewarding! I used a freeze team with Ganyu and it worked perfectly.',
    author: {
      id: 202,
      username: 'freeze_team_fan',
      name: 'Lisa Zhang',
      created_at: '2024-01-01T00:00:00Z',
    },
    post_id: 1,
    created_at: '2024-01-15T12:30:00Z',
    likes_count: 3,
    is_liked: true,
  },
])

const searchQuery = ref('')
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMorePosts = ref(true)
const showPostDetail = ref(false)
const selectedPost = ref<Post | null>(null)
const loadingComments = ref(false)

// Methods
const handleSearch = () => {
  // Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

const openPostDetail = (post: Post) => {
  selectedPost.value = post
  showPostDetail.value = true
  loadComments(post.id)
}

const closePostDetail = () => {
  showPostDetail.value = false
  selectedPost.value = null
  postComments.value = []
}

const loadComments = async (postId: number | string) => {
  loadingComments.value = true
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Filter comments for this post
    const filteredComments = postComments.value.filter((comment) => comment.post_id === postId)
    postComments.value = filteredComments
  } finally {
    loadingComments.value = false
  }
}

const handleLike = (post: Post) => {
  // Toggle like status
  const postIndex = posts.value.findIndex((p) => p.id === post.id)
  if (postIndex !== -1) {
    posts.value[postIndex].is_liked = !posts.value[postIndex].is_liked
    posts.value[postIndex].likes_count = posts.value[postIndex].is_liked
      ? (posts.value[postIndex].likes_count || 0) + 1
      : Math.max(0, (posts.value[postIndex].likes_count || 0) - 1)
  }
  console.log('Liked/unliked post:', post.id)
}

const handleComments = (post: Post) => {
  openPostDetail(post)
}

const handleShare = (post: Post) => {
  // Implement share functionality
  console.log('Sharing post:', post.id)
  // You could copy to clipboard, open share dialog, etc.
  navigator.clipboard.writeText(`Check out this post: ${post.title}`)
}

const showPostOptions = (post: Post) => {
  // Show options menu (edit, delete, report, etc.)
  console.log('Show options for post:', post.id)
}

const loadMorePosts = () => {
  isLoadingMore.value = true

  // Simulate loading more posts
  setTimeout(() => {
    // In real app, you'd fetch more posts from API
    hasMorePosts.value = false // No more posts for demo
    isLoadingMore.value = false
  }, 1000)
}

const submitComment = async (content: string, postId: number | string) => {
  console.log('Submitting comment:', content, 'for post:', postId)

  // Create new comment
  const newComment: Comment = {
    id: Date.now(), // In real app, this would come from API
    content,
    author: currentUser.value,
    post_id: postId,
    created_at: new Date().toISOString(),
    likes_count: 0,
    is_liked: false,
  }

  // Add to comments list
  postComments.value.push(newComment)

  // Update post comment count
  const postIndex = posts.value.findIndex((p) => p.id === postId)
  if (postIndex !== -1) {
    posts.value[postIndex].comments_count = (posts.value[postIndex].comments_count || 0) + 1
  }
}

const handleReply = (comment: Comment) => {
  console.log('Reply to comment:', comment.id)
  // Implement reply functionality
}

const handleCommentLike = (comment: Comment) => {
  console.log('Like comment:', comment.id)
  // Toggle comment like
  const commentIndex = postComments.value.findIndex((c) => c.id === comment.id)
  if (commentIndex !== -1) {
    postComments.value[commentIndex].is_liked = !postComments.value[commentIndex].is_liked
    postComments.value[commentIndex].likes_count = postComments.value[commentIndex].is_liked
      ? (postComments.value[commentIndex].likes_count || 0) + 1
      : Math.max(0, (postComments.value[commentIndex].likes_count || 0) - 1)
  }
}

// Initialize on mount
onMounted(() => {
  // In real app, you'd fetch posts from API here
  console.log('HomeView mounted, posts loaded:', posts.value.length)
})
</script>

<style scoped>
.search-bar input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #542f87;
  border-radius: 12px;
  background-color: rgba(10, 11, 15, 0.8);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-bar input:focus {
  border-color: #b8aff7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(184, 175, 247, 0.2);
  background-color: rgba(10, 11, 15, 0.95);
  transform: translateY(-2px);
}

.search-bar input::placeholder {
  color: #b8aff7;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.search-bar input:hover {
  border-color: #b8aff7;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184, 175, 247, 0.1);
}

.search-bar input:focus::placeholder {
  color: #d1eafd;
  opacity: 0.8;
  transform: translateX(4px);
}
</style>
