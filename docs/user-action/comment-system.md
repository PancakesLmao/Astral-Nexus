# Comment System

## Overview

Users can create, read, update, delete, and like comments on posts. Full CRUD operations with authentication required for write operations.

## Architecture

### Frontend

- **PostDetail.vue** - Comment display and creation form
- **Comments Store (Pinia)** - `loadComments()`, `submitComment()`, `deleteComment()`, `likeComment()` actions

### Backend API

- `GET /api/blog/comments/:postId` - Get all comments for a post
- `POST /api/blog/comments` - Create new comment (requires authentication)
- `PUT /api/blog/comments/:id` - Update comment (author only)
- `DELETE /api/blog/comments/:id` - Delete comment (author only)
- `POST /api/blog/comments/:id/like` - Toggle like/unlike (requires authentication)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id)
  );
  ```

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

````json
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
## API Endpoints

### Get Comments

```http
GET /api/blog/comments/:postId
````

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "comment-uuid",
      "content": "Great post!",
      "author": {
        "id": "user-uuid",
        "name": "User Name",
        "email": "user@example.com",
        "picture": "avatar-url"
      },
      "post_id": "post-uuid",
      "likes_count": 2,
      "is_liked": false,
      "created_at": "2025-12-06T10:00:00Z",
      "updated_at": "2025-12-06T10:00:00Z"
    }
  ]
}
```

### Create Comment

```http
POST /api/blog/comments
Authorization: Bearer <supabase_jwt>
Content-Type: application/json

{
  "post_id": "post-uuid",
  "content": "This is my comment!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": "new-comment-uuid",
    "content": "This is my comment!",
    "author": {
      "id": "user-uuid",
      "name": "Your Name",
      "email": "you@example.com"
    },
    "post_id": "post-uuid",
    "likes_count": 0,
    "is_liked": false,
    "created_at": "2025-12-06T12:00:00Z"
  }
}
```

### Update Comment

```http
PUT /api/blog/comments/:id
Authorization: Bearer <supabase_jwt>

{
  "content": "Updated comment text"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": { "id": "comment-uuid", "updated_at": "2025-12-06T14:00:00Z" }
}
```

### Delete Comment

```http
DELETE /api/blog/comments/:id
Authorization: Bearer <supabase_jwt>
```

**Response:**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### Like/Unlike Comment

```http
POST /api/blog/comments/:id/like
Authorization: Bearer <supabase_jwt>
```

**Response:**

```json
{
  "success": true,
  "message": "Comment liked successfully",
  "data": { "action": "liked" }
}
```

## User Flow

1. User opens post detail
2. Comments load from API
3. User sees all comments with author info and like count
4. User can:
   - Create new comment via form
   - Like/unlike any comment
   - Edit/delete own comments
5. Like/unlike uses optimistic updates (instant UI feedback)
6. Comment count auto-updates on post

## Validation

### Frontend

- **Content**: Required, 1-5000 characters
- **Post ID**: Required, must be valid UUID
- **Post must exist**: Foreign key validation

### Backend

- **Authentication**: Supabase JWT required (authGuard middleware on POST, PUT, DELETE)
- **Data validation**: Elysia schema validation
- **Authorization**: PUT/DELETE check user is comment author
- **Auto-user creation**: New user records created from JWT token on first comment

## Authentication & Authorization

All write operations (POST, PUT, DELETE) are guarded by `authGuard` Elysia middleware requiring valid Supabase JWT. PUT/DELETE verify user is the comment author.

## Threading (Schema-Ready)

The `parent_comment_id` column exists in the database schema to support threaded/nested comments, but nested reply endpoints are not currently exposed via the API. This is ready for future implementation.
