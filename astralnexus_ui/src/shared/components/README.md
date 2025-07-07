# PostList and PostDetail Components Usage

## PostList Component

A reusable component that displays a list of posts with pagination and interaction capabilities.

### Props

- `posts: Post[]` - Array of posts to display
- `loading?: boolean` - Whether posts are currently loading (default: false)
- `loadingMore?: boolean` - Whether more posts are being loaded (default: false)
- `hasMore?: boolean` - Whether there are more posts to load (default: true)

### Events

- `selectPost(post: Post)` - Emitted when a post is clicked
- `toggleLike(post: Post)` - Emitted when like button is clicked
- `toggleComments(post: Post)` - Emitted when comments button is clicked
- `sharePost(post: Post)` - Emitted when share button is clicked
- `showPostOptions(post: Post)` - Emitted when options menu is clicked
- `loadMore()` - Emitted when load more button is clicked

### Usage Example

```vue
<template>
  <PostList
    :posts="posts"
    :loading="isLoading"
    :loading-more="isLoadingMore"
    :has-more="hasMorePosts"
    @select-post="openPostDetail"
    @toggle-like="handleLike"
    @toggle-comments="handleComments"
    @share-post="handleShare"
    @show-post-options="showOptions"
    @load-more="loadMorePosts"
  />
</template>

<script setup>
import { ref } from 'vue'
import PostList from '@/shared/components/PostList.vue'
import type { Post } from '@/shared/types'

const posts = ref<Post[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMorePosts = ref(true)

const openPostDetail = (post: Post) => {
  // Open post detail dialog
}

const handleLike = (post: Post) => {
  // Handle like/unlike
}

// ... other handlers
</script>
```

## PostDetail Component

A modal dialog component that displays detailed post information with comments.

### Props

- `isOpen: boolean` - Whether the dialog is open
- `post: Post | null` - The post to display
- `comments?: Comment[]` - Array of comments (default: [])
- `currentUser?: User | null` - Current logged-in user (default: null)
- `allowComments?: boolean` - Whether commenting is allowed (default: true)
- `loadingComments?: boolean` - Whether comments are loading (default: false)

### Events

- `close()` - Emitted when dialog should be closed
- `toggleLike(post: Post)` - Emitted when like button is clicked
- `toggleComments(post: Post)` - Emitted when comments button is clicked
- `sharePost(post: Post)` - Emitted when share button is clicked
- `showPostOptions(post: Post)` - Emitted when options menu is clicked
- `submitComment(content: string, postId: number | string)` - Emitted when comment is submitted
- `replyToComment(comment: Comment)` - Emitted when reply button is clicked
- `toggleCommentLike(comment: Comment)` - Emitted when comment like is clicked

### Usage Example

```vue
<template>
  <div>
    <!-- Your page content -->

    <PostDetail
      :is-open="showPostDetail"
      :post="selectedPost"
      :comments="postComments"
      :current-user="currentUser"
      :loading-comments="isLoadingComments"
      @close="closePostDetail"
      @toggle-like="handleLike"
      @submit-comment="handleCommentSubmit"
      @reply-to-comment="handleReply"
      @toggle-comment-like="handleCommentLike"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PostDetail from '@/shared/components/PostDetail.vue'
import type { Post, Comment, User } from '@/shared/types'

const showPostDetail = ref(false)
const selectedPost = ref<Post | null>(null)
const postComments = ref<Comment[]>([])
const currentUser = ref<User | null>(null)
const isLoadingComments = ref(false)

const closePostDetail = () => {
  showPostDetail.value = false
  selectedPost.value = null
  postComments.value = []
}

const handleCommentSubmit = async (content: string, postId: number | string) => {
  // Submit comment to API
  // Refresh comments
}

// ... other handlers
</script>
```

## Combined Usage in Views

Here's how to use both components together:

```vue
<template>
  <div class="container mx-auto px-4">
    <h1>My Posts</h1>

    <PostList
      :posts="posts"
      :loading="isLoading"
      :loading-more="isLoadingMore"
      :has-more="hasMorePosts"
      @select-post="openPost"
      @toggle-like="handleLike"
      @load-more="loadMorePosts"
    />

    <PostDetail
      :is-open="showDetail"
      :post="selectedPost"
      :comments="comments"
      :current-user="user"
      :loading-comments="loadingComments"
      @close="closeDetail"
      @toggle-like="handleLike"
      @submit-comment="submitComment"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PostList from '@/shared/components/PostList.vue'
import PostDetail from '@/shared/components/PostDetail.vue'
import type { Post, Comment, User } from '@/shared/types'

// State
const posts = ref<Post[]>([])
const comments = ref<Comment[]>([])
const selectedPost = ref<Post | null>(null)
const user = ref<User | null>(null)
const showDetail = ref(false)
const isLoading = ref(false)
const loadingComments = ref(false)

// Methods
const openPost = async (post: Post) => {
  selectedPost.value = post
  showDetail.value = true
  await loadComments(post.id)
}

const closeDetail = () => {
  showDetail.value = false
  selectedPost.value = null
  comments.value = []
}

const loadComments = async (postId: number | string) => {
  loadingComments.value = true
  try {
    // Fetch comments from API
    // comments.value = await api.getComments(postId)
  } finally {
    loadingComments.value = false
  }
}

const submitComment = async (content: string, postId: number | string) => {
  try {
    // Submit comment to API
    // const newComment = await api.createComment({ content, post_id: postId })
    // comments.value.push(newComment)
  } catch (error) {
    console.error('Failed to submit comment:', error)
  }
}

onMounted(() => {
  // Load initial posts
})
</script>
```

## Data Structure Examples

### Post Object

```typescript
const samplePost: Post = {
  id: 1,
  title: 'Epic Genshin Impact Adventure',
  content: 'Just finished the latest Archon Quest...',
  author: {
    id: 123,
    username: 'gamer123',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
  },
  created_at: '2024-01-15T10:30:00Z',
  comments_count: 5,
  likes_count: 12,
  shares_count: 3,
  game_category: 'Genshin Impact',
  post_type: 'Discussion',
  tags: ['genshin', 'archon-quest', 'adventure'],
}
```

### Comment Object

```typescript
const sampleComment: Comment = {
  id: 1,
  content: 'Great post! I loved that quest too.',
  author: {
    id: 456,
    username: 'commenter',
    name: 'Jane Smith',
  },
  post_id: 1,
  created_at: '2024-01-15T11:00:00Z',
  likes_count: 2,
}
```
