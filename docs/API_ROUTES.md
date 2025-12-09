# API Routes Documentation

## Route Organization

### App Routes (`/`)

Application metadata and health check endpoints.

- **`GET /`** - Root endpoint with API information
- **`GET /health`** - Health check including database connectivity
- **`GET /version`** - API version information

### API Routes (starts with `/api`)
#### Authentication Routes (`/auth`)

All authentication-related endpoints are grouped under the `/auth` prefix for easier middleware management.

- **`GET /auth/me`** - Get current authenticated user
- **`POST /auth/logout`** - Logout endpoint
- **`POST /auth/verify`** - Verify authentication token

#### Blog Routes (`/blog`)

All blog-related operations including posts, comments, and interactions are grouped under `/blog` for centralized middleware control.

##### Posts (`/blog/posts`)

- **`GET /blog/posts`** - Get paginated list of posts
  - Query params: `page`, `limit`, `game_category`, `search`, `sort_by`, `sort_order`, `author_id`
- **`GET /blog/posts/:id`** - Get single post by ID
- **`POST /blog/posts`** - Create new post (authenticated)
- **`PUT /blog/posts/:id`** - Update post (authenticated)
- **`DELETE /blog/posts/:id`** - Delete post (authenticated)
- **`POST /blog/posts/:id/like`** - Like/unlike post (authenticated)

##### Comments (`/blog/comments`)

- **`GET /blog/comments/:postId`** - Get comments for a post
- **`POST /blog/comments`** - Create comment (authenticated)
- **`PUT /blog/comments/:id`** - Update comment (authenticated)
- **`DELETE /blog/comments/:id`** - Delete comment (authenticated)
- **`POST /blog/comments/:id/like`** - Like/unlike comment (authenticated)

##### Notification Routes (`/blog/notifications`)

- **`GET /blog/notifications`** - Get paginated notifications (authenticated)
- **`POST /blog/notifications`** - Create notification (authenticated)
- **`DELETE /blog/notifications/:id`** - Delete notification (authenticated)
- **`PATCH /blog/notifications/:id/read`** - Mark notification as read (authenticated)
- **`GET /blog/notifications/count`** - Get unread notification count (authenticated)

##### Game Categories Routes (`/blog/game-categories`)

- **`GET /blog/game-categories`** - Get list of game categories

#### User Routes (`/users`)

All user-related endpoints for user management and profile operations.

- **`GET /users/stats/:userId`** - Get user statistics (posts, comments, notifications, etc.)
- **`GET /users/:userId`** - Get user profile
- **`PUT /users/:userId`** - Update user profile (authenticated)
- **`GET /users/profile/{user_id}/posts`** - Get posts by user for profile view
- **`DELET /users/profile/{id}/posts/{postId}`** - Delete a post from user profile (authenticated)

#### Admin Routes (`/admin`)

Administrative endpoints for system management.

- **`POST /admin/login`** - Admin login
- **`GET /admin/users`** - List users (admin only)
- **`POST /admin/users/:userId/ban`** - Ban user (admin only)