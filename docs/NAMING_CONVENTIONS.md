# Naming Conventions Guide

This document outlines the naming convention standards followed throughout the Astral Nexus project to ensure consistency, maintainability, and clarity across all layers of the application.

## Overview

The project follows a layered naming convention approach:

- **Database & API**: `snake_case` (industry standard for databases and REST APIs)
- **Backend Internal Code**: `camelCase` for variables and functions (JavaScript/TypeScript convention)
- **Frontend**: `camelCase` for code and Vue props (Vue.js and JavaScript conventions), `snake_case` for data from API

## Detailed Convention Breakdown

### 1. Database Layer

**Convention: `snake_case`**

All PostgreSQL column names use snake_case to follow SQL conventions and industry best practices.

```sql
-- ✅ Correct
SELECT id, post_id, author_id, likes_count, is_liked, created_at, updated_at
FROM posts WHERE post_id = $1

-- ❌ Incorrect
SELECT id, postId, authorId, likesCount, isLiked, createdAt, updatedAt
FROM posts WHERE postId = $1
```

**Common Fields:**

- `created_at`, `updated_at` - Timestamps
- `post_id`, `author_id`, `user_id`, `comment_id` - Foreign keys
- `likes_count`, `comments_count`, `shares_count` - Counters
- `is_liked`, `is_bookmarked`, `is_following` - Booleans
- `game_name`, `parent_comment_id` - Domain-specific fields

---

### 2. Backend API Responses

**Convention: `snake_case`**

All fields returned in API responses must use snake_case to match database columns and ensure consistency. This eliminates redundancy and provides a single source of truth.

```typescript
// ✅ Correct API Response
{
  success: true,
  data: {
    post_id: "uuid",
    author_id: "uuid",
    likes_count: 10,
    is_liked: false,
    created_at: "2025-12-04T...",
    updated_at: "2025-12-04T..."
  }
}

// ❌ Incorrect - Don't return both formats
{
  success: true,
  data: {
    postId: "uuid",           // ❌ Redundant
    post_id: "uuid",          // ✅ Keep only this
    isLiked: false,           // ❌ Redundant
    is_liked: false,          // ✅ Keep only this
    createdAt: "2025-12-04", // ❌ Redundant
    created_at: "2025-12-04" // ✅ Keep only this
  }
}
```

---

### 3. Backend Schemas (Elysia/TypeScript)

**Convention: `snake_case`**

Schema definitions validate API responses and must use snake_case fields to match both database and API response format.

```typescript
// ✅ Correct
Post: t.Object({
  id: t.String({ format: "uuid" }),
  post_id: t.String({ format: "uuid" }),
  author_id: t.String({ format: "uuid" }),
  likes_count: t.Number(),
  is_liked: t.Optional(t.Boolean()),
  created_at: t.String({ format: "date-time" }),
  updated_at: t.String({ format: "date-time" }),
});

// ❌ Incorrect
Post: t.Object({
  id: t.String(),
  postId: t.String(), // ❌ Doesn't match database/API
  authorId: t.String(),
  likesCount: t.Number(),
  isLiked: t.Boolean(),
});
```

---

### 4. Backend Internal Code (Variables & Functions)

**Convention: `camelCase` for variables and functions**

Internal route parameters and local variables can use camelCase since they're not exposed to the API. This follows JavaScript/TypeScript conventions.

```typescript
// ✅ Correct - Internal variables use camelCase
.get("/:postId", async ({ params: { postId }, user, set }) => {
  const authorId = user.id;
  const commentId = body.id;

  // Database query uses snake_case
  const query = `
    SELECT post_id, author_id, created_at
    FROM posts WHERE post_id = $1
  `;

  // Response transformation converts database to API format
  const transformedPost = {
    post_id: post.post_id,      // ✅ API field uses snake_case
    author_id: post.author_id,
    created_at: post.created_at
  };

  return { success: true, data: transformedPost };
})

// ❌ Incorrect - Exposing camelCase in response
return {
  success: true,
  data: {
    postId: post.post_id,  // ❌ Wrong - should be post_id
    authorId: post.author_id
  }
};
```

---

### 5. Frontend TypeScript Types & Interfaces

**Convention: `snake_case`**

Type definitions must match API responses exactly to ensure type safety and prevent bugs.

```typescript
// ✅ Correct - Types match API snake_case
export interface Post {
  id: string;
  post_id: string;
  author_id: string;
  likes_count: number;
  is_liked?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  likes_count?: number;
  is_liked?: boolean;
  created_at: string;
  updated_at?: string;
}

// ❌ Incorrect - Types don't match API
export interface Post {
  id: string;
  postId: string; // ❌ Won't match API response
  authorId: string;
  likesCount: number;
  isLiked?: boolean;
}
```

---

### 6. Frontend Vue Component Props

**Convention: `camelCase`**

Vue component props use camelCase following Vue.js conventions and JavaScript standards. However, they receive snake_case data from the API.

```vue
<!-- ✅ Correct - Props are camelCase (Vue convention) -->
<script setup lang="ts">
interface Props {
  postId: string;
  isLiked?: boolean;
  likesCount?: number;
  buttonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLiked: false,
  likesCount: 0,
});
</script>

<template>
  <button :class="buttonClass">
    {{ likesCount }}
  </button>
</template>

<!-- ✅ Correct - Parent passes data correctly -->
<PostLikeButton
  :postId="post.id"
  :isLiked="post.is_liked"
  :likesCount="post.likes_count"
/>

<!-- ❌ Incorrect - Props should be camelCase -->
<script setup lang="ts">
interface Props {
  post_id: string; // ❌ Should be postId (Vue convention)
  is_liked?: boolean; // ❌ Should be isLiked
}
</script>
```

---

### 7. Frontend Component Internal Code

**Convention: `camelCase`**

Component methods, internal variables, and functions use camelCase following JavaScript conventions.

```typescript
// ✅ Correct - Component code is camelCase
const handleLikeClick = async () => {
  const originalLiked = localIsLiked.value;
  const originalCount = localLikesCount.value;

  // But access API data using snake_case
  const updatedPost = await apiClient.fetchSinglePost(props.postId);
  localIsLiked.value = updatedPost.is_liked ?? false;
  localLikesCount.value = updatedPost.likes_count || 0;

  emit("update", localIsLiked.value, localLikesCount.value);
};

// ❌ Incorrect - Don't use snake_case for internal logic
const handle_like_click = async () => {
  // ❌ Should be camelCase
  const original_liked = localIsLiked.value;
};
```

---

### 8. Frontend Store Methods & State

**Convention: `camelCase` for methods, `snake_case` for state data**

Store methods are camelCase (JavaScript convention), but internal state stores actual API data in snake_case format.

```typescript
// ✅ Correct - Store pattern
export const usePostsStore = defineStore("posts", () => {
  // State holds data exactly as received from API (snake_case)
  const posts = ref<Post[]>([]);

  // Methods are camelCase
  const loadPosts = async (params) => {
    const response = await apiClient.fetchPosts(params);
    // State updates with API data (snake_case preserved)
    posts.value = response.data.posts; // Maintains snake_case from API
  };

  const submitComment = async (content, postId) => {
    // Send data as snake_case to API
    const newComment = await apiClient.createComment({
      post_id: postId, // ✅ Convert parameter to snake_case
      content: content.trim(),
    });
    return newComment; // Returns snake_case from API
  };

  return { posts, loadPosts, submitComment };
});
```

---

### 9. Frontend API Methods

**Convention: `camelCase` method names, `snake_case` data exchange**

API methods have camelCase names (JavaScript convention) but exchange snake_case data with the backend.

```typescript
// ✅ Correct - API Client
export class ApiClient {
  // Method names are camelCase
  async fetchSinglePost(postId: string): Promise<Post> {
    // Response contains snake_case data
    return response.data; // { id, post_id, author_id, is_liked, ... }
  }

  async createComment(
    commentData: { post_id: string; content: string }
  ): Promise<Comment> {
    // Send snake_case data to API
    const response = await fetch('/api/blog/comments', {
      method: 'POST',
      body: JSON.stringify({
        post_id: commentData.post_id,  // ✅ Snake_case in request
        content: commentData.content
      })
    });
    return response.json(); // Returns snake_case data
  }

  async likePost(postId: string): Promise<void> {
    // Internal uses camelCase, but endpoint is snake_case aware
    await fetch(`/api/blog/posts/${postId}/like`, { method: 'POST' });
  }
}

// ❌ Incorrect - Mixing conventions
async createComment(commentData: { postId: string; content: string }) {
  // ❌ Parameter should be post_id to match API
  return fetch('/api/blog/comments', {
    body: JSON.stringify({ postId: commentData.postId })
  });
}
```

---

## Summary Table

| Layer                           | Convention   | Examples                                  | Notes                        |
| ------------------------------- | ------------ | ----------------------------------------- | ---------------------------- |
| **Database Columns**            | `snake_case` | `created_at`, `post_id`, `likes_count`    | SQL standard                 |
| **API Responses**               | `snake_case` | All response fields                       | Matches database             |
| **API Schemas**                 | `snake_case` | Schema field definitions                  | Validates responses          |
| **Backend Variables/Functions** | `camelCase`  | `const postId`, `function handleSubmit()` | Internal only, JS convention |
| **Frontend Types**              | `snake_case` | Interface properties match API            | Type safety                  |
| **Vue Component Props**         | `camelCase`  | `:isLiked`, `:likesCount`                 | Vue convention               |
| **Frontend Component Code**     | `camelCase`  | Methods, variables, functions             | JavaScript convention        |
| **Store Methods**               | `camelCase`  | `loadPosts()`, `submitComment()`          | JavaScript convention        |
| **Store State Data**            | `snake_case` | State holds API data as-is                | Type safety                  |
| **API Method Names**            | `camelCase`  | `fetchSinglePost()`, `createComment()`    | JavaScript convention        |
| **API Request/Response Data**   | `snake_case` | Data exchanged with server                | API contract                 |

---

## Real-World Example

Here's a complete flow showing all naming conventions in practice:

### 1. Database Query

```sql
SELECT post_id, author_id, likes_count, is_liked, created_at
FROM posts WHERE post_id = $1;
```

### 2. Backend Route (Internal + Response)

```typescript
.get("/:postId", async ({ params: { postId } }) => {
  // Internal variable: camelCase
  const query = `SELECT post_id, author_id, likes_count, is_liked
                 FROM posts WHERE post_id = $1`;

  // Response uses snake_case (matches schema)
  return {
    success: true,
    data: {
      post_id: row.post_id,
      author_id: row.author_id,
      likes_count: row.likes_count,
      is_liked: row.is_liked,
      created_at: row.created_at
    }
  };
})
```

### 3. Frontend Type Definition

```typescript
export interface Post {
  post_id: string; // Matches API response
  author_id: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}
```

### 4. Frontend API Client Method

```typescript
// Method name: camelCase
async fetchSinglePost(postId: string): Promise<Post> {
  // Returns data with snake_case properties
  const response = await fetch(`/api/blog/posts/${postId}`);
  return response.json(); // { post_id, author_id, likes_count, is_liked, ... }
}
```

### 5. Frontend Store Method

```typescript
// Method: camelCase
const loadPostDetail = async (postId: string) => {
  // Calls camelCase method which returns snake_case data
  const post = await apiClient.fetchSinglePost(postId);
  // State stores snake_case as received
  selectedPost.value = post; // { post_id, author_id, is_liked, ... }
};
```

### 6. Vue Component Usage

```vue
<script setup lang="ts">
// Props: camelCase (Vue convention)
interface Props {
  postId: string;
  isLiked?: boolean;
  likesCount?: number;
}

const handleLike = async () => {
  // Access component data from API (snake_case preserved)
  const updatedPost = await apiClient.fetchSinglePost(props.postId);
  localIsLiked.value = updatedPost.is_liked;
  localLikesCount.value = updatedPost.likes_count;
};
</script>

<template>
  <!-- Pass prop correctly -->
  <PostLikeButton
    :postId="post.id"
    :isLiked="post.is_liked"
    :likesCount="post.likes_count"
  />
</template>
```

---

## Common Mistakes to Avoid

| Mistake                                             | Problem                                      | Fix                                |
| --------------------------------------------------- | -------------------------------------------- | ---------------------------------- |
| Returning `createdAt` in API                        | Schema validation fails (422 error)          | Return `created_at`                |
| Type has `postId` but API returns `post_id`         | TypeScript doesn't catch, runtime bugs occur | Match type to API                  |
| Vue prop named `post_Id` or `post-Id`               | Confusion, doesn't follow conventions        | Use `postId` (camelCase)           |
| Store method named `load_posts`                     | Violates JavaScript convention               | Rename to `loadPosts`              |
| Backend internal var named `post_id` exposed in API | Inconsistent with API standard               | Internal: `postId`, API: `post_id` |

---

## Enforcing Standards

To maintain consistency across the project:

1. **Code Review**: Check naming conventions in PR reviews
2. **Schema Validation**: Mismatched names cause errors
3. **Type Safety**: TypeScript catches type mismatches at compile time
4. **Linting**: Consider ESLint rules for camelCase/snake_case in specific contexts

---
