import { Elysia, t } from "elysia";
import { queryAll, queryOne, query, exists, count } from "../utils/database";
import { authMiddleware } from "../middleware/auth";

// Post response schemas for Swagger documentation
const PostAuthorSchema = t.Object({
  id: t.String({ format: "uuid", description: "Author unique identifier" }),
  username: t.String({ description: "Author username" }),
  name: t.String({ description: "Author display name" }),
  email: t.String({ format: "email", description: "Author email address" }),
  picture: t.Optional(t.String({ description: "Author profile picture URL" })),
  bio: t.Optional(t.String({ description: "Author biography" })),
  created_at: t.String({
    format: "date-time",
    description: "Account creation timestamp",
  }),
});

const PostSchema = t.Object({
  id: t.String({ format: "uuid", description: "Post unique identifier" }),
  title: t.String({ description: "Post title" }),
  content: t.String({ description: "Post content (markdown supported)" }),
  author: PostAuthorSchema,
  created_at: t.String({
    format: "date-time",
    description: "Post creation timestamp",
  }),
  updated_at: t.String({
    format: "date-time",
    description: "Post last update timestamp",
  }),
  published: t.Boolean({ description: "Post publication status" }),
  visibility: t.String({
    enum: ["public", "private", "followers"],
    description: "Post visibility level",
  }),
  game_category: t.Optional(
    t.String({ description: "Associated game category" })
  ),
  post_type: t.Optional(
    t.String({ description: "Type of post (Discussion, Guide, Review, etc.)" })
  ),
  tags: t.Optional(t.Array(t.String({ description: "Post tags" }))),
  likes_count: t.Number({ description: "Number of likes" }),
  comments_count: t.Number({ description: "Number of comments" }),
  shares_count: t.Number({ description: "Number of shares" }),
  is_liked: t.Optional(
    t.Boolean({ description: "Whether current user liked this post" })
  ),
  is_bookmarked: t.Optional(
    t.Boolean({ description: "Whether current user bookmarked this post" })
  ),
});

const PostsListResponse = t.Object({
  success: t.Boolean({ description: "Request success status" }),
  message: t.String({ description: "Response message" }),
  data: t.Object({
    posts: t.Array(PostSchema),
    pagination: t.Object({
      page: t.Number({ description: "Current page number" }),
      limit: t.Number({ description: "Posts per page" }),
      total: t.Number({ description: "Total number of posts" }),
      totalPages: t.Number({ description: "Total number of pages" }),
      hasNext: t.Boolean({ description: "Whether there are more pages" }),
      hasPrev: t.Boolean({ description: "Whether there are previous pages" }),
    }),
  }),
});

const PostDetailResponse = t.Object({
  success: t.Boolean({ description: "Request success status" }),
  message: t.String({ description: "Response message" }),
  data: t.Object({
    post: PostSchema,
  }),
});

const CreatePostSchema = t.Object({
  title: t.String({
    minLength: 1,
    maxLength: 255,
    description: "Post title (1-255 characters)",
  }),
  content: t.String({
    minLength: 1,
    description: "Post content (markdown supported)",
  }),
  game_id: t.Optional(
    t.String({
      format: "uuid",
      description: "Game category ID (optional)",
    })
  ),
  post_type: t.Optional(
    t.String({
      description: "Type of post (Discussion, Guide, Review, etc.)",
    })
  ),
  tags: t.Optional(
    t.Array(
      t.String({
        description: "Post tags (array of strings)",
      })
    )
  ),
  visibility: t.Optional(
    t.String({
      enum: ["public", "private", "followers"],
      default: "public",
      description: "Post visibility level",
    })
  ),
  published: t.Optional(
    t.Boolean({
      default: true,
      description: "Whether to publish immediately",
    })
  ),
});

const UpdatePostSchema = t.Object({
  title: t.Optional(
    t.String({
      minLength: 1,
      maxLength: 255,
      description: "Post title (1-255 characters)",
    })
  ),
  content: t.Optional(
    t.String({
      minLength: 1,
      description: "Post content (markdown supported)",
    })
  ),
  game_id: t.Optional(
    t.String({
      format: "uuid",
      description: "Game category ID",
    })
  ),
  post_type: t.Optional(
    t.String({
      description: "Type of post (Discussion, Guide, Review, etc.)",
    })
  ),
  tags: t.Optional(
    t.Array(
      t.String({
        description: "Post tags (array of strings)",
      })
    )
  ),
  visibility: t.Optional(
    t.String({
      enum: ["public", "private", "followers"],
      description: "Post visibility level",
    })
  ),
  published: t.Optional(
    t.Boolean({
      description: "Publication status",
    })
  ),
});

// Posts API routes
export const postsRoutes = new Elysia({ prefix: "/api/posts" })
  .get(
    "/",
    async ({ query }) => {
      try {
        const page = Math.max(1, parseInt(query.page as string) || 1);
        const limit = Math.min(
          50,
          Math.max(1, parseInt(query.limit as string) || 10)
        );
        const offset = (page - 1) * limit;
        const gameCategory = query.game_category as string;
        const postType = query.post_type as string;
        const authorId = query.author_id as string;
        const visibility = (query.visibility as string) || "public";
        const search = query.search as string;
        const sortBy = (query.sort_by as string) || "created_at";
        const sortOrder = (query.sort_order as string) || "DESC";

        // Build WHERE conditions
        let whereConditions = ["p.published = TRUE"];
        const queryParams: any[] = [];
        let paramIndex = 1;

        // Visibility filter
        if (visibility) {
          whereConditions.push(`p.visibility = $${paramIndex}`);
          queryParams.push(visibility);
          paramIndex++;
        }

        // Author filter
        if (authorId) {
          whereConditions.push(`p.author_id = $${paramIndex}`);
          queryParams.push(authorId);
          paramIndex++;
        }

        // Game category filter
        if (gameCategory) {
          whereConditions.push(`gc.game_name ILIKE $${paramIndex}`);
          queryParams.push(`%${gameCategory}%`);
          paramIndex++;
        }

        // Post type filter (stored as custom field - we'll add this to schema later)
        if (postType) {
          whereConditions.push(
            `p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex}`
          );
          queryParams.push(`%${postType}%`);
          paramIndex++;
        }

        // Search filter
        if (search) {
          whereConditions.push(
            `(p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`
          );
          queryParams.push(`%${search}%`);
          paramIndex++;
        }

        const whereClause =
          whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

        // Build ORDER BY clause
        const validSortFields = [
          "created_at",
          "updated_at",
          "title",
          "likes_count",
          "comments_count",
        ];
        const validSortOrders = ["ASC", "DESC"];
        const orderField = validSortFields.includes(sortBy)
          ? sortBy
          : "created_at";
        const orderDirection = validSortOrders.includes(sortOrder.toUpperCase())
          ? sortOrder.toUpperCase()
          : "DESC";

        // Get total count
        const totalQuery = `
          SELECT COUNT(*) as total
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN game_categories gc ON p.game_id = gc.id
          ${whereClause}
        `;
        const totalResult = await queryOne(totalQuery, queryParams);
        const total = parseInt(totalResult?.total || "0");

        // Get posts with pagination
        const postsQuery = `
          SELECT
            p.id,
            p.title,
            p.content,
            p.published,
            p.visibility,
            p.likes_count,
            p.comments_count,
            p.shares_count,
            p.created_at,
            p.updated_at,
            u.id as author_id,
            u.name as author_name,
            u.email as author_email,
            u.picture as author_picture,
            gc.game_name as game_category
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN game_categories gc ON p.game_id = gc.id
          ${whereClause}
          ORDER BY p.${orderField} ${orderDirection}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        queryParams.push(limit, offset);
        const posts = await queryAll(postsQuery, queryParams);

        // Transform posts to match frontend format
        const transformedPosts = posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: {
            id: post.author_id,
            username: post.author_name,
            name: post.author_name,
            email: post.author_email,
            picture: post.author_picture,
            bio: "", // I'll add bio to users table later
            created_at: new Date(post.created_at).toISOString(),
          },
          created_at: new Date(post.created_at).toISOString(),
          updated_at: new Date(post.updated_at).toISOString(),
          published: post.published,
          visibility: post.visibility,
          game_category: post.game_category || undefined, // Convert null to undefined for schema validation
          post_type: "Discussion", // Default for now, I'll add this field later
          tags: [], // We'll add tags support later
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          is_liked: false, // TODO: Check if current user liked this post
          is_bookmarked: false, // TODO: Check if current user bookmarked this post
        }));

        const totalPages = Math.ceil(total / limit);

        return {
          success: true,
          message: "Posts retrieved successfully",
          data: {
            posts: transformedPosts,
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          },
        };
      } catch (error) {
        console.error("Error fetching posts:", error);
        return {
          success: false,
          message: "Failed to fetch posts",
          data: {
            posts: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Posts per page (default: 10, max: 50)" })
        ),
        game_category: t.Optional(
          t.String({ description: "Filter by game category" })
        ),
        post_type: t.Optional(t.String({ description: "Filter by post type" })),
        author_id: t.Optional(
          t.String({ format: "uuid", description: "Filter by author ID" })
        ),
        visibility: t.Optional(
          t.String({ description: "Filter by visibility (default: public)" })
        ),
        search: t.Optional(
          t.String({ description: "Search in title and content" })
        ),
        sort_by: t.Optional(
          t.String({
            description:
              "Sort field (created_at, updated_at, title, likes_count, comments_count)",
          })
        ),
        sort_order: t.Optional(
          t.String({ description: "Sort order (ASC, DESC)" })
        ),
      }),
      response: PostsListResponse,
      detail: {
        tags: ["Posts"],
        summary: "Get all posts",
        description: `
        Retrieve a paginated list of posts with optional filtering and sorting.

        **Query Parameters:**
        - \`page\`: Page number (default: 1)
        - \`limit\`: Posts per page (default: 10, max: 50)
        - \`game_category\`: Filter by game category name
        - \`post_type\`: Filter by post type
        - \`visibility\`: Filter by visibility (public, private, followers)
        - \`search\`: Search term for title and content
        - \`sort_by\`: Sort field (created_at, updated_at, title, likes_count, comments_count)
        - \`sort_order\`: Sort direction (ASC, DESC)
        `,
      },
    }
  )
  .get(
    "/:id",
    async ({ params }) => {
      try {
        const postQuery = `
          SELECT
            p.id,
            p.title,
            p.content,
            p.published,
            p.visibility,
            p.likes_count,
            p.comments_count,
            p.shares_count,
            p.created_at,
            p.updated_at,
            u.id as author_id,
            u.name as author_name,
            u.email as author_email,
            u.picture as author_picture,
            gc.game_name as game_category
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN game_categories gc ON p.game_id = gc.id
          WHERE p.id = $1 AND p.published = TRUE
        `;

        const post = await queryOne(postQuery, [params.id]);

        if (!post) {
          return {
            success: false,
            message: "Post not found",
            error: "The requested post does not exist or is not published",
          };
        }

        const transformedPost = {
          id: post.id,
          title: post.title,
          content: post.content,
          author: {
            id: post.author_id,
            username: post.author_email?.split("@")[0] || "user",
            name: post.author_name,
            email: post.author_email,
            picture: post.author_picture,
            bio: "",
            created_at: new Date(post.created_at).toISOString(),
          },
          created_at: new Date(post.created_at).toISOString(),
          updated_at: new Date(post.updated_at).toISOString(),
          published: post.published,
          visibility: post.visibility,
          game_category: post.game_category || undefined,
          // Convert null to undefined for schema validation
          post_type: "Discussion",
          tags: [],
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          is_liked: false,
          is_bookmarked: false,
        };

        return {
          success: true,
          message: "Post retrieved successfully",
          data: {
            post: transformedPost,
          },
        };
      } catch (error) {
        console.error("Error fetching post:", error);
        return {
          success: false,
          message: "Failed to fetch post",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid", description: "Post unique identifier" }),
      }),
      response: PostDetailResponse,
      detail: {
        tags: ["Posts"],
        summary: "Get post by ID",
        description: `
        Retrieve a specific post by its unique identifier.

        **Path Parameters:**
        - \`id\`: Post UUID
        `,
      },
    }
  )

  // Create post endpoint - with manual authentication
  .post(
    "/",
    async ({ body, cookie, headers }) => {
      try {
        // Manual authentication check
        let sessionId: string | null = null;

        // Check Authorization header (Bearer token)
        const authHeader = headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          sessionId = authHeader.substring(7);
        }

        // Check X-Session-ID header
        const sessionHeader = headers["x-session-id"];
        if (sessionHeader && !sessionId) {
          sessionId = sessionHeader;
        }

        // Check cookie as fallback
        const cookieName = "astral_session";
        if (!sessionId && cookie && cookie[cookieName]?.value) {
          sessionId = cookie[cookieName].value;
        }

        if (!sessionId) {
          return {
            success: false,
            message: "Authentication required",
            error: "No session found",
          };
        }

        // Get session from database
        const sessionQuery = `
          SELECT s.*, u.id as user_id, u.email, u.name, u.picture, p.provider_name
          FROM sessions s
          JOIN users u ON s.user_id = u.id
          JOIN providers p ON u.provider_id = p.id
          WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP
        `;

        const session = await queryOne(sessionQuery, [sessionId]);

        if (!session) {
          return {
            success: false,
            message: "Authentication required",
            error: "Invalid or expired session",
          };
        }

        const user = {
          id: session.user_id,
          email: session.email,
          name: session.name,
          picture: session.picture,
          provider: session.provider_name,
        };

        const insertQuery = `
          INSERT INTO posts (title, content, author_id, game_id, published, visibility)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, created_at, updated_at
        `;

        const result = await queryOne(insertQuery, [
          body.title,
          body.content,
          user.id, // Use authenticated user's ID
          body.game_id || null,
          body.published ?? true,
          body.visibility || "public",
        ]);

        return {
          success: true,
          message: "Post created successfully",
          data: {
            id: result.id,
            created_at:
              result.created_at instanceof Date
                ? result.created_at.toISOString()
                : result.created_at,
            updated_at:
              result.updated_at instanceof Date
                ? result.updated_at.toISOString()
                : result.updated_at,
          },
        };
      } catch (error) {
        console.error("Error creating post:", error);
        return {
          success: false,
          message: "Failed to create post",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: CreatePostSchema,
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Optional(
          t.Object({
            id: t.String({ format: "uuid" }),
            created_at: t.String({ format: "date-time" }),
            updated_at: t.String({ format: "date-time" }),
          })
        ),
        error: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Posts"],
        summary: "Create new post",
        description: `
        Create a new blog post.

        **Request Body:**
        - \`title\`: Post title (required, 1-255 characters)
        - \`content\`: Post content (required, markdown supported)
        - \`game_id\`: Game category UUID (optional)
        - \`post_type\`: Type of post (optional)
        - \`tags\`: Array of tag strings (optional)
        - \`visibility\`: Visibility level (optional, default: public)
        - \`published\`: Publication status (optional, default: true)
        `,
      },
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      try {
        // Check if post exists
        const existingPost = await queryOne(
          "SELECT id, author_id FROM posts WHERE id = $1",
          [params.id]
        );

        if (!existingPost) {
          return {
            success: false,
            message: "Post not found",
            error: "The requested post does not exist",
          };
        }

        // TODO: Add authorization check (user can only edit their own posts or admin)

        // Build dynamic update query
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        if (body.title !== undefined) {
          updateFields.push(`title = $${paramIndex}`);
          updateValues.push(body.title);
          paramIndex++;
        }

        if (body.content !== undefined) {
          updateFields.push(`content = $${paramIndex}`);
          updateValues.push(body.content);
          paramIndex++;
        }

        if (body.game_id !== undefined) {
          updateFields.push(`game_id = $${paramIndex}`);
          updateValues.push(body.game_id);
          paramIndex++;
        }

        if (body.visibility !== undefined) {
          updateFields.push(`visibility = $${paramIndex}`);
          updateValues.push(body.visibility);
          paramIndex++;
        }

        if (body.published !== undefined) {
          updateFields.push(`published = $${paramIndex}`);
          updateValues.push(body.published);
          paramIndex++;
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        if (updateFields.length === 1) {
          // Only updated_at was added
          return {
            success: false,
            message: "No fields to update",
            error: "At least one field must be provided for update",
          };
        }

        updateValues.push(params.id); // Add ID for WHERE clause
        const updateQuery = `
          UPDATE posts
          SET ${updateFields.join(", ")}
          WHERE id = $${paramIndex}
          RETURNING updated_at
        `;

        const result = await queryOne(updateQuery, updateValues);

        return {
          success: true,
          message: "Post updated successfully",
          data: {
            id: params.id,
            updated_at: result.updated_at,
          },
        };
      } catch (error) {
        console.error("Error updating post:", error);
        return {
          success: false,
          message: "Failed to update post",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid", description: "Post unique identifier" }),
      }),
      body: UpdatePostSchema,
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Optional(
          t.Object({
            id: t.String({ format: "uuid" }),
            updated_at: t.String({ format: "date-time" }),
          })
        ),
        error: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Posts"],
        summary: "Update post",
        description: `
        Update an existing post. Only the author or admin can update a post.

        **Path Parameters:**
        - \`id\`: Post UUID

        **Request Body:** (all fields optional)
        - \`title\`: New post title
        - \`content\`: New post content
        - \`game_id\`: New game category UUID
        - \`post_type\`: New post type
        - \`tags\`: New tags array
        - \`visibility\`: New visibility level
        - \`published\`: New publication status
        `,
      },
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      try {
        // Check if post exists
        const existingPost = await queryOne(
          "SELECT id, author_id FROM posts WHERE id = $1",
          [params.id]
        );

        if (!existingPost) {
          return {
            success: false,
            message: "Post not found",
            error: "The requested post does not exist",
          };
        }

        // TODO: Add authorization check (user can only delete their own posts or admin)

        // Delete the post (cascade will handle related comments and likes)
        await query("DELETE FROM posts WHERE id = $1", [params.id]);

        return {
          success: true,
          message: "Post deleted successfully",
          data: {
            id: params.id,
            deleted_at: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error deleting post:", error);
        return {
          success: false,
          message: "Failed to delete post",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid", description: "Post unique identifier" }),
      }),
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Optional(
          t.Object({
            id: t.String({ format: "uuid" }),
            deleted_at: t.String({ format: "date-time" }),
          })
        ),
        error: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Posts"],
        summary: "Delete post",
        description: `
        Delete a post permanently. Only the author or admin can delete a post.

        **Path Parameters:**
        - \`id\`: Post UUID

        **Warning:** This action cannot be undone
        `,
      },
    }
  );
