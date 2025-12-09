# Post & Comment Liking System

## Overview

Users can like/unlike posts and comments. The system uses optimistic updates for instant UI feedback with automatic rollback on API failures.

## Architecture

### Frontend

- **PostLikeButton.vue** - Like button component for posts
- **CommentLikeButton.vue** - Like button component for comments
- **Posts Store (Pinia)** - `likePost(postId)` action with optimistic updates
- **Comments Store (Pinia)** - `likeComment(commentId)` action with optimistic updates

### Backend API

- `POST /api/blog/posts/:id/like` - Toggle like/unlike for a post (requires authentication)
- `POST /api/blog/comments/:id/like` - Toggle like/unlike for a comment (requires authentication)

## User Flow

### Like Action

1. User clicks like button on post/comment
2. UI immediately updates (optimistic update):
   - Button fills with color
   - Like count increments
3. API call sent to backend in background
4. Backend validates authentication
5. Database record inserted into post_likes/comment_likes
6. Database trigger auto-increments likes_count
7. If API fails, UI rolls back to previous state

### Unlike Action

1. User clicks unlike button (on already-liked post/comment)
2. UI immediately updates:
   - Button unfills
   - Like count decrements
3. API call sent to backend
4. Database record deleted from post_likes/comment_likes
5. Database trigger auto-decrements likes_count

## API Endpoints

### Like/Unlike Post

```http
POST /api/blog/posts/:id/like
Authorization: Bearer <supabase_jwt>
```

**Response:**

```json
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "action": "liked"
  }
}
```

**Or if unlike:**

```json
{
  "success": true,
  "message": "Post unliked successfully",
  "data": {
    "action": "unliked"
  }
}
```

### Like/Unlike Comment

```http
POST /api/blog/comments/:id/like
Authorization: Bearer <supabase_jwt>
```

**Response:** Same structure as post like endpoint

## Implementation Pattern

### Optimistic Updates (Frontend)

```typescript
async likePost(postId: string) {
  // Find post in store
  const post = this.posts.find(p => p.id === postId)
  if (!post) return

  // Save original state for rollback
  const originalLiked = post.is_liked
  const originalCount = post.likes_count || 0

  // Optimistic update (immediate UI change)
  post.is_liked = !originalLiked
  post.likes_count = originalLiked ? originalCount - 1 : originalCount + 1

  try {
    // API call in background
    await apiClient.likePost(postId)
  } catch (error) {
    // Rollback on failure
    post.is_liked = originalLiked
    post.likes_count = originalCount
    throw error
  }
}
```

## Authentication

- Supabase JWT required in Authorization header
- Auto-user creation: New user records created from JWT token on first like
- 401 response if no valid JWT provided

## Error Handling

- **Network errors**: Automatic rollback to previous state
- **Authentication errors**: 401 response, user prompted to login
- **Validation errors**: 422 response with error details
- **Server errors**: 500 response, automatic rollback

## Performance

- Database triggers auto-maintain like counts
- Indexed composite keys (post_id, user_id) for fast lookups
- Optimistic updates eliminate perceived latency
- State centralized in Pinia store to prevent duplicate API calls
