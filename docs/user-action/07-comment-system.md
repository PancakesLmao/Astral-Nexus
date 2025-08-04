# Comment System

## Overview

The comment system enables users to engage in discussions on posts through threaded comments. The system supports real-time comment creation, viewing, and liking with complete database integration and optimistic updates.

## Key Features

### 1. **Real-time Comments**

- Create new comments with instant feedback
- Load comments dynamically when viewing posts
- Real-time comment count updates
- Asynchronous HTTP requests for all operations

### 2. **Comment Interactions**

- Like/unlike individual comments
- View comment like counts
- Author information display
- Optimistic updates for instant UX

### 3. **Database Integration**

- Complete removal of mock data
- PostgreSQL backend with UUID primary keys
- Proper user authentication and authorization
- Database triggers for automatic count updates

### 4. **User Experience**

- Seamless comment form integration
- Loading states and error handling
- Consistent author name display
- Mobile-responsive design

## Architecture

### Frontend Components

1. **PostDetail.vue**

   - Comment display section
   - New comment form
   - Comment interaction buttons
   - Loading and empty states

2. **PostList.vue**

   - Comment count display
   - Click to open PostDetail for commenting

3. **Posts Store (Pinia)**
   - `loadComments(postId)` - Fetch comments from API
   - `submitComment(content, postId)` - Create new comment
   - `likeComment(commentId)` - Like/unlike comment
   - Centralized comment state management

### Backend API

1. **GET /api/comments/:postId**

   - Retrieve all comments for a post
   - Include author information and like status
   - Authentication-aware (shows is_liked status)

2. **POST /api/comments**

   - Create new comment
   - Requires authentication
   - Returns complete comment object

3. **POST /api/comments/:id/like**
   - Toggle like/unlike on comment
   - Authentication required
   - Updates comment like count

### Database Schema

1. **comments table**

   ```sql
   CREATE TABLE comments (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       content TEXT NOT NULL,
       post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
       author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
       likes_count INTEGER DEFAULT 0,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **comment_likes table**

   ```sql
   CREATE TABLE comment_likes (
       comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (comment_id, user_id)
   );
   ```

3. **Database Triggers**
   - Auto-update comments_count in posts table
   - Auto-update likes_count in comments table

## User Flow

### Comment Creation Flow

1. User opens PostDetail modal
2. Comments automatically load for the post
3. User types in comment form
4. User clicks "Post Comment"
5. Optimistic update adds comment to UI
6. API call creates comment in database
7. Comment appears with proper author info

### Comment Viewing Flow

1. User clicks on post (comment count)
2. PostDetail modal opens
3. Comments load asynchronously
4. Loading state shown during fetch
5. Comments display with author names and like counts

### Comment Like Flow

1. User clicks like button on comment
2. Optimistic update changes UI state
3. API call toggles like in database
4. Like count updates in real-time
5. Error handling with state rollback

## Implementation Details

### API Endpoints

#### Get Comments

```http
GET /api/comments/:postId
Authorization: Bearer <session_token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "4ce3a659-3097-47df-9a80-010f73663a9b",
      "postId": "8d6cca4a-156e-4714-9ca4-bfff63720011",
      "author": {
        "id": "9baf831a-2d3e-4244-bd93-f6952e2a08c0",
        "name": "PancakesLmao",
        "email": "phucthin29@gmail.com",
        "picture": "https://cdn.discordapp.com/avatars/..."
      },
      "content": "Great post!",
      "likes_count": 3,
      "is_liked": true,
      "created_at": "2025-08-03T18:11:30.711Z"
    }
  ],
  "message": "Retrieved 1 comments for post"
}
```

#### Create Comment

```http
POST /api/comments
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "postId": "8d6cca4a-156e-4714-9ca4-bfff63720011",
  "content": "This is my comment!"
}
```

#### Like Comment

```http
POST /api/comments/:id/like
Authorization: Bearer <session_token>
```

### Frontend State Management

#### Load Comments

```typescript
async loadComments(postId: string | number) {
  this.loadingComments = true
  try {
    const comments = await apiClient.fetchComments(postId.toString())
    this.postComments = comments
  } catch (error) {
    console.error('Failed to load comments:', error)
    throw error
  } finally {
    this.loadingComments = false
  }
}
```

#### Submit Comment

```typescript
async submitComment(content: string, postId: string | number) {
  try {
    const newComment = await apiClient.createComment({
      postId: postId.toString(),
      content: content.trim(),
    })

    // Add to local state
    this.postComments.unshift(newComment)

    // Update post comment count
    const post = this.posts.find(p => p.id === postId.toString())
    if (post) {
      post.comments_count = (post.comments_count || 0) + 1
    }
  } catch (error) {
    console.error('Failed to submit comment:', error)
    throw error
  }
}
```

## Data Consistency

### Schema Alignment

- **Frontend Types**: User interface with name, email, picture (no username)
- **Backend Response**: Full User object with UUID strings
- **Database Schema**: UUID primary keys, proper foreign key relationships

### Type Safety

```typescript
export interface Comment {
  id: string; // UUID
  content: string;
  author: User;
  post_id: string; // UUID
  parent_comment_id?: string; // UUID
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  is_liked?: boolean;
  replies?: Comment[];
}

export interface User {
  id: string; // UUID in database
  name: string; // Required, from database
  email: string; // Required, from database
  picture?: string; // Optional Discord profile picture
  provider_id?: string; // UUID, optional for frontend
  bio?: string;
  created_at?: string;
  updated_at?: string;
}
```

## Authentication & Authorization

### Requirements

- Authentication required for:
  - Creating comments
  - Liking comments
  - Viewing personalized like status

### Session Management

- Multiple authentication methods:
  - Bearer token in Authorization header
  - X-Session-ID header
  - Session cookie

### Security Features

- User can only create comments as themselves
- Proper session validation
- SQL injection prevention with parameterized queries

## Error Handling

### Frontend Error Scenarios

- Network connectivity issues
- Authentication failures
- Server errors (500)
- Invalid data responses

### Backend Error Responses

- 401: Unauthenticated user
- 404: Post/comment not found
- 422: Validation errors
- 500: Server/database errors

### Error Recovery

- Optimistic updates with rollback
- User-friendly error messages
- Retry mechanisms for transient failures

## Performance Optimizations

### Database Optimizations

- Indexed columns for fast lookups:
  - `comments.post_id`
  - `comments.author_id`
  - `comment_likes.comment_id`
  - `comment_likes.user_id`

### Frontend Optimizations

- Lazy loading of comments (only when PostDetail opens)
- Optimistic updates for instant feedback
- Efficient state management with computed properties

### API Optimizations

- Single query to fetch comments with author info
- JOIN queries to get like status efficiently
- Proper HTTP status codes for client caching

## Testing Strategy

### Frontend Tests

- Comment form validation
- Comment display rendering
- Like button interactions
- Error state handling
- Loading state management

### Backend Tests

- API endpoint responses
- Authentication validation
- Database integrity
- Error handling scenarios
- SQL query performance

### Integration Tests

- End-to-end comment creation flow
- Like synchronization between components
- Authentication flow testing

## Future Enhancements

### Planned Features

1. **Threaded Comments**

   - Reply to specific comments
   - Nested comment display
   - Parent-child relationship handling

2. **Comment Moderation**

   - Edit own comments
   - Delete own comments
   - Admin moderation tools

3. **Rich Text Comments**

   - Markdown support
   - @mentions
   - Emoji reactions

4. **Real-time Updates**

   - WebSocket integration
   - Live comment updates
   - Notification system

5. **Comment Analytics**
   - Popular comments
   - Engagement metrics
   - User activity tracking

## Migration from Mock Data

### Completed Migrations

- ✅ Removed all hardcoded comment arrays
- ✅ Replaced mock API calls with real HTTP requests
- ✅ Updated component props to use real data
- ✅ Aligned type definitions with database schema
- ✅ Implemented proper error handling

### Benefits Achieved

- Real-time data synchronization
- Database persistence
- Proper user authentication
- Scalable architecture
- Production-ready implementation
