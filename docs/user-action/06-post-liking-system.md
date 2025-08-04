# Post Liking System

## Overview

The post liking system allows users to express their appreciation for posts by clicking a like button. The system implements optimistic updates for instant user feedback while maintaining data consistency with the backend.

## Key Features

### 1. **Optimistic Updates**

- Instant UI feedback when user clicks like/unlike
- State changes immediately in the UI
- API call happens in the background
- Rollback mechanism if API call fails

### 2. **Real-time Synchronization**

- Like state synchronized between PostList and PostDetail components
- Uses centralized state management (Pinia store)
- Single source of truth for post data

### 3. **Visual Feedback**

- Like button changes color when liked (primary-400)
- Filled heart icon for liked state
- Live like count updates
- Hover effects for better UX

## Architecture

### Frontend Components

1. **PostList.vue**

   - Displays like button with current state
   - Handles like/unlike click events
   - Shows live like count

2. **PostDetail.vue**

   - Modal view with detailed post information
   - Like functionality identical to PostList
   - Synchronized state with PostList

3. **Posts Store (Pinia)**
   - Centralized state management
   - `likePost(postId)` action
   - Optimistic updates with error handling
   - State synchronization between components

### Backend API

1. **POST /api/posts/:id/like**
   - Toggle like/unlike for authenticated users
   - Returns action performed ("liked" or "unliked")
   - Updates like count in database
   - Authentication required

### Database Schema

1. **post_likes table**

   ```sql
   CREATE TABLE post_likes (
       post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (post_id, user_id)
   );
   ```

2. **posts table**

   ```sql
   likes_count INTEGER DEFAULT 0
   ```

3. **Database Triggers**
   - Auto-increment/decrement likes_count when post_likes records are added/removed

## User Flow

### Like Action Flow

1. User clicks like button
2. UI immediately updates (optimistic update)
3. API call sent to backend
4. Backend validates authentication
5. Backend toggles like status in database
6. Backend returns success/failure
7. If failure, UI rolls back changes

### Unlike Action Flow

1. User clicks unlike button (when post is already liked)
2. UI immediately updates (removes like state)
3. API call sent to backend
4. Backend removes like record from database
5. Backend returns success
6. UI state remains consistent

## Implementation Details

### API Endpoints

#### Like/Unlike Post

```http
POST /api/posts/:id/like
Authorization: Bearer <session_token>
Content-Type: application/json
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

### Frontend State Management

#### Store Action

```typescript
async likePost(postId: string) {
  // Find post
  const post = this.posts.find(p => p.id === postId)
  if (!post) return

  // Store original state for rollback
  const originalLiked = post.is_liked
  const originalCount = post.likes_count || 0

  // Optimistic update
  post.is_liked = !originalLiked
  post.likes_count = originalLiked ? originalCount - 1 : originalCount + 1

  try {
    // API call
    await apiClient.likePost(postId)
  } catch (error) {
    // Rollback on error
    post.is_liked = originalLiked
    post.likes_count = originalCount
    throw error
  }
}
```

## Authentication

### Requirements

- User must be authenticated
- Session token required in headers
- Unauthenticated requests return 401

### Session Validation

- Multiple authentication methods supported:
  - Authorization header: `Bearer <token>`
  - X-Session-ID header
  - Cookie: `astral_session`

## Error Handling

### Frontend Errors

- Network failures
- Authentication errors
- Server errors
- Automatic rollback of optimistic updates

### Backend Errors

- Invalid post ID (404)
- Unauthenticated user (401)
- Database errors (500)

## Performance Considerations

### Database Optimization

- Indexed post_likes table for fast lookups
- Composite primary key (post_id, user_id)
- Database triggers for automatic count updates

### Frontend Optimization

- Debounced API calls (prevent rapid clicking)
- Optimistic updates for instant feedback
- Centralized state to prevent duplicate API calls

## Security

### Authentication

- All like actions require valid session
- User can only like/unlike posts (cannot like on behalf of others)

### Rate Limiting

- Backend should implement rate limiting for like actions
- Prevent spam liking/unliking

## Testing

### Frontend Tests

- Component like button interactions
- Store action testing with mocked API
- Optimistic update rollback scenarios

### Backend Tests

- Authentication validation
- Like/unlike toggle logic
- Database integrity
- Error response handling

## Future Enhancements

### Potential Features

1. **Like Notifications**

   - Notify post authors when their posts are liked
   - Real-time notification system

2. **Like Analytics**

   - Track like patterns and trends
   - Popular posts identification

3. **Social Features**

   - Show who liked a post
   - Like activity feeds

4. **Performance**
   - Implement caching for frequently accessed posts
   - Background synchronization for offline actions
