# Post Creation System

## Overview

Authenticated users can create blog posts with title, content, game category, and visibility settings through a modal form interface.

## Architecture

### Frontend

- **NewPost.vue** - Modal form for post creation with game category loading
- **Sidebar.vue** - Desktop create button
- **BottomBar.vue** - Mobile create button
- **Posts Store (Pinia)** - `createPost()` action for state management

### Backend API

- `POST /api/blog/posts` - Create new post (requires authentication)
- `GET /api/blog/posts` - List posts with filtering and pagination
- `GET /api/blog/posts/:id` - Get single post by ID
- `PUT /api/blog/posts/:id` - Update post (guarded by authGuard middleware)
- `DELETE /api/blog/posts/:id` - Delete post (guarded by authGuard middleware)
- `GET /api/blog/game-categories` - List available game categories

## User Flow

1. User clicks "Create Post" button
2. NewPost modal opens with form
3. Game categories load from API
4. User fills in title, content, game category (optional), visibility
5. Form validates input
6. User submits
7. Backend validates authentication (via authGuard middleware) and data
8. Post created in database
9. Post list refreshed with new post

## API Endpoints

### Create Post

```http
POST /api/blog/posts
Authorization: Bearer <supabase_jwt>
Content-Type: application/json

{
  "title": "My Gaming Experience",
  "content": "This is my detailed post about...",
  "game_id": "uuid-of-game-category",
  "visibility": "public",
  "published": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "new-post-uuid",
    "created_at": "2025-12-06T12:00:00Z",
    "updated_at": "2025-12-06T12:00:00Z"
  }
}
```

### Get Posts

```http
GET /api/blog/posts?page=1&limit=10&game_category=Genshin&search=tips
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "post-uuid",
      "title": "Gaming Tips",
      "content": "...",
      "author": { "id": "user-id", "name": "Author Name", "picture": "url" },
      "game_category": "Random Game",
      "visibility": "public",
      "likes_count": 5,
      "comments_count": 2,
      "is_liked": false,
      "created_at": "2025-12-06T10:00:00Z",
      "updated_at": "2025-12-06T10:00:00Z"
    }
  ],
  "pagination": { "total": 42, "page": 1, "limit": 10 }
}
```

### Update Post

```http
PUT /api/blog/posts/:id
Authorization: Bearer <supabase_jwt>

{
  "title": "Updated Title",
  "content": "Updated content...",
  "visibility": "private"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "id": "post-uuid",
    "updated_at": "2025-12-06T14:00:00Z"
  }
}
```

### Delete Post

```http
DELETE /api/blog/posts/:id
Authorization: Bearer <supabase_jwt>
```

**Response:**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### Get Game Categories

```http
GET /api/blog/game-categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "category-uuid",
      "game_name": "Genshin Impact",
      "created_at": "2025-08-01T10:00:00Z"
    }
  ]
}
```

## Validation

### Frontend

- **Title**: Required, 1-500 characters
- **Content**: Required, minimum 1 character
- **Game Category**: Optional, must be valid UUID
- **Visibility**: Optional, enum: "public" | "private" | "followers"
- **Published**: Optional, defaults to true

### Backend

- **Authentication**: Supabase JWT required (authGuard middleware on POST, PUT, DELETE)
- **Data Validation**: Elysia schema validation enforced
- **Foreign Key Validation**: game_id must reference valid game_category
- **Auto-user Creation**: New user records created from JWT token on first action

## Authentication & Authorization

All write operations (POST, PUT, DELETE) are guarded by `authGuard` Elysia middleware requiring valid Supabase JWT in Authorization header. User records auto-created from JWT token on first post creation.

**Security:**

- CSRF protection via session validation
- SQL injection prevention via parameterized queries
- JWT validation on all protected endpoints
