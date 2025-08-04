# Post Creation System

## Overview

The post creation system enables authenticated users to create new blog posts with rich metadata including game categories, post types, tags, and visibility settings. The system features a comprehensive form interface with real-time validation and integrates seamlessly with the existing blog architecture.

## Key Features

### 1. **Rich Post Creation Form**

- Title and content input with validation
- Game category selection from dynamic API data
- Post type categorization (Discussion, Guide, News, etc.)
- Tag system for content organization
- Visibility control (Public, Followers Only, Private)
- Responsive design for desktop and mobile

### 2. **Real-time Validation**

- Frontend form validation
- Backend authentication and data validation
- Content sanitization and security measures
- User-friendly error messages

### 3. **Dynamic Content Loading**

- Game categories loaded from API
- Dropdown interfaces with search capability
- Loading states and error handling
- Optimistic UI updates

### 4. **Multi-Platform Support**

- Desktop modal interface
- Mobile-optimized dialog
- Touch-friendly controls
- Responsive form layouts

## Architecture

### Frontend Components

1. **NewPost.vue (Main Component)**

   - Modal/dialog interface for post creation
   - Form validation and state management
   - Responsive design switching
   - Real-time game category loading

2. **Integration Components**

   - Sidebar.vue: Desktop create post button
   - BottomBar.vue: Mobile create post button
   - HomeView.vue: Post list integration

3. **Posts Store (Pinia)**
   - `createPost(postData)` - Main creation method
   - Authentication validation
   - Data transformation for backend
   - Post list refresh after creation

### Backend API

1. **POST /api/posts**

   - Create new blog post
   - Multiple authentication methods
   - Data validation and sanitization
   - Database insertion with triggers

2. **GET /api/game-categories**
   - Fetch available game categories
   - Used for post categorization
   - Filtered for post creation context

### Database Schema

1. **posts table**

   ```sql
   CREATE TABLE posts (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       title VARCHAR(255) NOT NULL,
       content TEXT NOT NULL,
       author_id UUID NOT NULL REFERENCES users(id),
       game_id UUID REFERENCES game_categories(id),
       post_type VARCHAR(50) DEFAULT 'Discussion',
       tags TEXT[], -- Array of tag strings
       visibility VARCHAR(20) DEFAULT 'public',
       published BOOLEAN DEFAULT true,
       likes_count INTEGER DEFAULT 0,
       comments_count INTEGER DEFAULT 0,
       shares_count INTEGER DEFAULT 0,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **game_categories table**
   ```sql
   CREATE TABLE game_categories (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       game_name VARCHAR(255) NOT NULL UNIQUE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

## User Flow

### Post Creation Workflow

1. User clicks "Create Post" button (Sidebar or BottomBar)
2. NewPost modal opens with form interface
3. Game categories load dynamically from API
4. User fills in post details:
   - Title (required, 1-255 characters)
   - Content (required, markdown supported)
   - Game category (optional, from dropdown)
   - Post type (optional, predefined options)
   - Tags (optional, comma-separated)
   - Visibility (optional, defaults to public)
5. Form validation ensures required fields
6. User submits form
7. Authentication validation on backend
8. Post created in database
9. User redirected to updated post list
10. Success feedback displayed

### Form Validation Flow

1. Real-time frontend validation
2. Required field checking
3. Character limit enforcement
4. Backend authentication validation
5. Data sanitization and security checks
6. Database constraint validation

## Implementation Details

### API Endpoints

#### Create Post

```http
POST /api/posts
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "title": "My Gaming Experience",
  "content": "This is my detailed post about...",
  "game_id": "uuid-of-game-category",
  "post_type": "guide",
  "tags": ["gaming", "tips", "strategy"],
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
    "created_at": "2025-08-04T12:00:00Z",
    "updated_at": "2025-08-04T12:00:00Z"
  }
}
```

#### Get Game Categories

```http
GET /api/game-categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "category-uuid",
      "game_name": "Valorant",
      "created_at": "2025-08-01T10:00:00Z"
    }
  ]
}
```

### Frontend Implementation

#### Form Data Structure

```typescript
interface CreatePostRequest {
  title: string;
  content: string;
  game_id?: string;
  post_type?: string;
  tags?: string[];
  visibility?: "public" | "private" | "followers";
  published?: boolean;
}
```

#### Post Creation Method

```typescript
async createPost(postData: CreatePostRequest) {
  // Authentication check
  if (!userStore.isAuthenticated) {
    throw new Error('User must be authenticated to create posts')
  }

  // Data transformation
  const backendData = {
    title: postData.title,
    content: postData.content,
    game_id: postData.game_id?.trim() || undefined,
    post_type: postData.post_type || 'Discussion',
    tags: postData.tags || [],
    visibility: postData.visibility || 'public',
    published: true,
  }

  // API call
  const response = await apiClient.createPost(backendData)

  // Refresh post list
  await this.fetchPosts({ page: 1, ...this.currentFilter })

  return response
}
```

#### Form Validation

```typescript
const isFormValid = computed(() => {
  return !!(
    formData.value.title.trim() &&
    formData.value.content.trim() &&
    formData.value.title.length <= 255 &&
    formData.value.content.length >= 1
  );
});
```

## Data Flow & Validation

### Frontend Validation

- **Title**: Required, 1-255 characters
- **Content**: Required, minimum 1 character
- **Game Category**: Optional, must be valid UUID from API
- **Post Type**: Optional, from predefined list
- **Tags**: Optional, comma-separated, converted to array
- **Visibility**: Optional, enum validation

### Backend Validation

- **Authentication**: Session/token validation required
- **Data Sanitization**: XSS prevention, content cleaning
- **Database Constraints**: Foreign key validation for game_id
- **Business Rules**: Published posts must have title and content

### Database Triggers

```sql
-- Update posts count for game categories
CREATE OR REPLACE FUNCTION update_game_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE game_categories
        SET posts_count = posts_count + 1
        WHERE id = NEW.game_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE game_categories
        SET posts_count = posts_count - 1
        WHERE id = OLD.game_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Authentication & Authorization

### Requirements

- User must be authenticated to create posts
- Session validation on every request
- Multiple authentication methods supported

### Security Features

- CSRF protection via session validation
- Content sanitization to prevent XSS
- SQL injection prevention with parameterized queries
- Rate limiting (future enhancement)

### Authentication Flow

```typescript
// Multiple authentication sources
let sessionId =
  headers.authorization?.substring(7) || // Bearer token
  headers["x-session-id"] || // Session header
  cookie.astral_session?.value; // Session cookie

// Session validation
const session = await queryOne(
  `
  SELECT s.*, u.id as user_id, u.email, u.name, u.picture
  FROM sessions s
  JOIN users u ON s.user_id = u.id
  WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP
`,
  [sessionId]
);
```

## User Experience Design

### Desktop Interface

- Modal overlay with form
- Two-column layout for categories/types
- Large textarea for content
- Dropdown selections with search
- Clear action buttons

### Mobile Interface

- Full-screen dialog
- Single-column stacked layout
- Touch-optimized controls
- Larger tap targets
- Scrollable content area

### Responsive Behavior

```typescript
const isDesktop = computed(() => windowWidth.value >= 1024)

// Dynamic component switching
<div v-if="isDesktop" class="desktop-layout">
<div v-else class="mobile-layout">
```

## Error Handling

### Frontend Error Scenarios

- Network connectivity issues
- Authentication failures
- Form validation errors
- API response errors

### Backend Error Responses

- 401: Authentication required
- 422: Validation errors
- 500: Server/database errors

### Error Recovery

```typescript
try {
  const newPost = await postsStore.createPost(formData.value);
  emit("created", newPost);
  closeDialog();
} catch (error) {
  console.error("Failed to create post:", error);
  // Show user-friendly error message
  errorMessage.value = "Failed to create post. Please try again.";
} finally {
  isSubmitting.value = false;
}
```

## Performance Optimizations

### Frontend Optimizations

- Lazy loading of game categories
- Debounced form validation
- Optimized re-renders with computed properties
- Efficient dropdown state management

### Backend Optimizations

- Indexed database columns:
  - `posts.author_id`
  - `posts.game_id`
  - `posts.created_at`
  - `posts.visibility`
- Prepared SQL statements
- Connection pooling

### API Optimizations

- Minimal data transfer in responses
- Efficient JSON serialization
- Proper HTTP status codes
- Cacheable game categories

## Testing Strategy

### Frontend Tests

- Form validation logic
- Component state management
- API integration mocking
- Responsive behavior
- Error state handling

### Backend Tests

- API endpoint functionality
- Authentication validation
- Data validation logic
- Database operations
- Error response handling

### Integration Tests

- End-to-end post creation flow
- Authentication integration
- Database consistency
- Cross-browser compatibility

## Future Enhancements

### Planned Features

1. **Rich Text Editor**

   - Markdown editor with preview
   - Image upload and embedding
   - Code syntax highlighting
   - Link previews and embeds

2. **Advanced Post Types**

   - Poll posts with voting
   - Image/video galleries
   - Live streaming integration
   - Event announcements

3. **Content Management**

   - Post drafts and auto-save
   - Scheduled publishing
   - Post editing and versioning
   - Bulk operations

4. **Social Features**

   - @mentions in posts
   - Cross-posting to other platforms
   - Post templates
   - Collaboration features

5. **Analytics & Insights**
   - Post performance metrics
   - Engagement analytics
   - Trending topics
   - Content recommendations

## Migration & Deployment

### Database Migrations

- Add new columns for enhanced features
- Update triggers for count management
- Index optimization for performance
- Data type migrations

### API Versioning

- Backward compatibility maintenance
- Feature flag implementations
- Gradual rollout strategies
- Client update coordination

## Monitoring & Maintenance

### Performance Metrics

- Post creation success rate
- API response times
- Database query performance
- User engagement metrics

### Error Monitoring

- Failed post creation attempts
- Authentication errors
- Database constraint violations
- Client-side error reporting

### Regular Maintenance

- Database optimization
- Index maintenance
- Cache invalidation
- Security updates
