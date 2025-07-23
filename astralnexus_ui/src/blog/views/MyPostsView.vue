<template>
  <div id="my-posts" class="px-5 py-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-foreground">My Posts</h1>
      <button
        class="px-4 py-2 bg-accent text-dark-900 rounded-lg hover:bg-accent-light transition-colors font-medium"
      >
        Create New Post
      </button>
    </div>
    <p class="text-dark-300 mb-6">Manage your posts and see how they're performing.</p>

    <!-- My Posts List -->
    <PostList
      :posts="myPosts"
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

    <!-- Post Detail Modal -->
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

// Sample user's posts
const myPosts = ref<Post[]>([
  {
    id: 4,
    title: "My Journey Through Honkai Impact 3rd - A Beginner's Guide",
    content: `As someone who just started playing Honkai Impact 3rd, I wanted to share my experience and some tips for other newcomers.

**Getting Started:**
• The tutorial is comprehensive but can be overwhelming
• Focus on the main story first - it's really engaging
• Don't worry about the gacha system initially

**Key Tips I Learned:**
1. **Valkyrie Management**: Start with Lightning Empress, she's great for beginners
2. **Resource Management**: Don't spend crystals randomly - save for good banners
3. **Daily Activities**: Complete daily missions for steady progression
4. **Join an Armada**: The community is incredibly helpful

**My Favorite Aspects:**
• The combat system is incredibly satisfying
• Character stories are emotional and well-written
• Graphics are stunning even on mobile

I'm still learning, but I'm absolutely hooked! If you have any beginner tips, please share them in the comments!`,
    author: currentUser.value,
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z',
    comments_count: 8,
    likes_count: 25,
    shares_count: 3,
    game_category: 'Honkai Impact 3rd',
    post_type: 'Guide',
    tags: ['honkai-impact-3rd', 'beginner', 'guide', 'tips'],
    is_liked: false,
    is_bookmarked: false,
    visibility: 'public',
  },
  {
    id: 5,
    title: 'Thoughts on the Latest Genshin Impact Event',
    content: `The current event in Genshin Impact has been quite the experience! Here are my thoughts:

**What I Loved:**
• The storyline was engaging and well-paced
• New mechanics were fun to learn
• Rewards were generous and worthwhile
• Co-op integration worked smoothly

**What Could Be Better:**
• Some of the challenges felt repetitive
• The event currency exchange rates could be improved
• More variety in gameplay modes would be nice

**Overall Rating: 7.5/10**

It's a solid event that's definitely worth participating in. The primogem rewards alone make it worthwhile for F2P players like myself.

What did you think of the event? Are you planning to complete all the challenges?`,
    author: currentUser.value,
    created_at: '2024-01-10T16:45:00Z',
    updated_at: '2024-01-10T16:45:00Z',
    comments_count: 12,
    likes_count: 18,
    shares_count: 2,
    game_category: 'Genshin Impact',
    post_type: 'Discussion',
    tags: ['genshin-impact', 'event', 'review', 'f2p'],
    is_liked: false,
    is_bookmarked: false,
    visibility: 'public',
  },
])

// Sample comments for the user's posts
const postComments = ref<Comment[]>([
  {
    id: 3,
    content:
      'Great guide! I wish I had this when I started playing. The Lightning Empress tip is spot on!',
    author: {
      id: 203,
      username: 'veteran_captain',
      name: 'Mike Johnson',
      created_at: '2024-01-01T00:00:00Z',
    },
    post_id: 4,
    created_at: '2024-01-12T15:30:00Z',
    likes_count: 2,
    is_liked: false,
  },
  {
    id: 4,
    content:
      'Thanks for sharing your experience! The armada tip is really important for new players.',
    author: {
      id: 204,
      username: 'helpful_senpai',
      name: 'Anna Lee',
      created_at: '2024-01-01T00:00:00Z',
    },
    post_id: 4,
    created_at: '2024-01-12T17:00:00Z',
    likes_count: 1,
    is_liked: true,
  },
])

// Component state
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMorePosts = ref(false) // User only has 2 posts
const showPostDetail = ref(false)
const selectedPost = ref<Post | null>(null)
const loadingComments = ref(false)

// Methods (same as HomeView)
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
    await new Promise((resolve) => setTimeout(resolve, 500))
    const filteredComments = postComments.value.filter((comment) => comment.post_id === postId)
    postComments.value = filteredComments
  } finally {
    loadingComments.value = false
  }
}

const handleLike = (post: Post) => {
  const postIndex = myPosts.value.findIndex((p) => p.id === post.id)
  if (postIndex !== -1) {
    myPosts.value[postIndex].is_liked = !myPosts.value[postIndex].is_liked
    myPosts.value[postIndex].likes_count = myPosts.value[postIndex].is_liked
      ? (myPosts.value[postIndex].likes_count || 0) + 1
      : Math.max(0, (myPosts.value[postIndex].likes_count || 0) - 1)
  }
}

const handleComments = (post: Post) => {
  openPostDetail(post)
}

const handleShare = (post: Post) => {
  console.log('Sharing post:', post.id)
  navigator.clipboard.writeText(`Check out my post: ${post.title}`)
}

const showPostOptions = (post: Post) => {
  console.log('Show options for my post:', post.id)
  // Options would include: Edit, Delete, Change Visibility, etc.
}

const loadMorePosts = () => {
  // No more posts to load for this user
  console.log('No more posts to load')
}

const submitComment = async (content: string, postId: number | string) => {
  const newComment: Comment = {
    id: Date.now(),
    content,
    author: currentUser.value,
    post_id: postId,
    created_at: new Date().toISOString(),
    likes_count: 0,
    is_liked: false,
  }

  postComments.value.push(newComment)

  const postIndex = myPosts.value.findIndex((p) => p.id === postId)
  if (postIndex !== -1) {
    myPosts.value[postIndex].comments_count = (myPosts.value[postIndex].comments_count || 0) + 1
  }
}

const handleReply = (comment: Comment) => {
  console.log('Reply to comment:', comment.id)
}

const handleCommentLike = (comment: Comment) => {
  const commentIndex = postComments.value.findIndex((c) => c.id === comment.id)
  if (commentIndex !== -1) {
    postComments.value[commentIndex].is_liked = !postComments.value[commentIndex].is_liked
    postComments.value[commentIndex].likes_count = postComments.value[commentIndex].is_liked
      ? (postComments.value[commentIndex].likes_count || 0) + 1
      : Math.max(0, (postComments.value[commentIndex].likes_count || 0) - 1)
  }
}

onMounted(() => {
  console.log('MyPostsView mounted, user posts loaded:', myPosts.value.length)
})
</script>
