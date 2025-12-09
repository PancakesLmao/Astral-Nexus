import { Elysia, t } from "elysia";
import { queryAll, queryOne, query, exists, count } from "../utils/database";
import { Schemas } from "../schemas";
import { authGuard } from "../middleware/auth";
import { createPostLikeNotification } from "./notifications";

// Posts API routes
export const postsRoutes = new Elysia({ prefix: "/api/blog/posts" })
  .get(
    "/",
    async ({ query, user, set }) => {
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
        let postsQuery: string;
        if (user) {
          postsQuery = `
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
              gc.game_name as game_category,
              CASE
                WHEN pl.post_id IS NOT NULL THEN true
                ELSE false
              END as is_liked
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN game_categories gc ON p.game_id = gc.id
            LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = $${paramIndex}
            ${whereClause}
            ORDER BY p.${orderField} ${orderDirection}
            LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
          `;
          queryParams.push(user.id, limit, offset);
        } else {
          postsQuery = `
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
              gc.game_name as game_category,
              false as is_liked
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN game_categories gc ON p.game_id = gc.id
            ${whereClause}
            ORDER BY p.${orderField} ${orderDirection}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
          `;
          queryParams.push(limit, offset);
        }
        const posts = await queryAll(postsQuery, queryParams);

        // Transform posts to match frontend format
        const transformedPosts = posts.map((post: any) => {
          // Convert timestamps to ISO string format
          let createdAtISO = post.created_at;
          let updatedAtISO = post.updated_at;
          
          // Handle Date objects from pg driver
          if (post.created_at instanceof Date) {
            createdAtISO = post.created_at.toISOString();
          } else if (typeof post.created_at === 'string') {
            // Already a string, ensure it's ISO format
            createdAtISO = new Date(post.created_at).toISOString();
          }
          
          if (post.updated_at instanceof Date) {
            updatedAtISO = post.updated_at.toISOString();
          } else if (typeof post.updated_at === 'string') {
            updatedAtISO = new Date(post.updated_at).toISOString();
          }
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            author: {
              id: post.author_id,
              username: post.author_name || "",
              name: post.author_name || "",
              email: post.author_email || "",
              picture: post.author_picture || undefined,
              bio: "",
              created_at: createdAtISO,
            },
            author_id: post.author_id,
            game_id: post.game_id || undefined,
            game_category: post.game_category || undefined,
            post_type: "Discussion",
            tags: [],
            visibility: post.visibility,
            published: post.published,
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            shares_count: post.shares_count || 0,
            is_liked: post.is_liked || false,
            created_at: createdAtISO,
            updated_at: updatedAtISO,
          };
        });

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
        set.status = 500;
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
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          posts: t.Array(Schemas.Post),
          pagination: Schemas.Pagination,
        }),
      }),
      detail: {
        tags: ["Admin"],
        summary: "Get all posts",
        description: `Retrieve a paginated list of posts with optional filtering and sorting.`,
        responses: {
          "200": {
            description: "List of posts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        posts: { type: "array" },
                        pagination: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  .get(
    "/:id",
    async ({ params, user, set }) => {
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
            gc.game_name as game_category,
            ${
              user
                ? `CASE WHEN pl.user_id IS NOT NULL THEN true ELSE false END as is_liked`
                : "false as is_liked"
            }
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN game_categories gc ON p.game_id = gc.id
          ${
            user
              ? `LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = $2`
              : ""
          }
          WHERE p.id = $1 AND p.published = TRUE
        `;

        const queryParams = user
          ? [params.id, user.id]
          : [params.id];
        const post = await queryOne(postQuery, queryParams);

        if (!post) {
          set.status = 404;
          return {
            success: false,
            message: "Post not found",
            error: "The requested post does not exist",
          };
        }

        const transformedPost = {
          id: post.id,
          title: post.title,
          content: post.content,
          author: {
            id: post.author_id,
            username: post.author_email?.split("@")[0] || "user",
            name: post.author_name || "",
            email: post.author_email || "",
            picture: post.author_picture || undefined,
            bio: "",
            created_at: new Date(post.created_at).toISOString(),
          },
          author_id: post.author_id,
          game_id: post.game_id || undefined,
          game_category: post.game_category || undefined,
          post_type: "Discussion",
          tags: [],
          visibility: post.visibility,
          published: post.published,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          is_liked: post.is_liked || false,
          created_at: new Date(post.created_at).toISOString(),
          updated_at: new Date(post.updated_at).toISOString(),
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
        set.status = 500;
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
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
        data: t.Object({
          post: Schemas.Post,
        }),
      }),
      detail: {
        tags: ["Blog"],
        summary: "Get post by ID",
        description: `Retrieve a specific post by its unique identifier.`,
        responses: {
          "200": {
            description: "Post retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    }
  )

  // Create post endpoint - requires Supabase authentication via JWT token
  .use(authGuard)
  .post(
    "/",
    async ({ body, user, set, headers }) => {
      try {
        console.log('[Create Post] User:', user ? `present (${user.id})` : 'missing');
        
        // Use Supabase UUID directly as author_id (no database lookup needed)
        const authorId = user.id;
        
        // Check if user exists in database, create if not
        let dbUser = await queryOne("SELECT id FROM users WHERE id = $1", [authorId]);

        if (!dbUser) {
          // Create user in database with Supabase UUID
          dbUser = await queryOne(
            "INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING id, email, name",
            [authorId, user.email, user.name || user.email, user.picture || null]
          );
          console.log('[Create Post] Created new user:', authorId);
        }

        const insertQuery = `
          INSERT INTO posts (title, content, author_id, game_id, published, visibility)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, created_at, updated_at
        `;

        const result = await queryOne(insertQuery, [
          body.title,
          body.content,
          authorId,
          body.game_id || null,
          body.published ?? true,
          body.visibility || "public",
        ]);

        console.log('[Create Post] Post created:', result.id, 'by', authorId);
        
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
        set.status = 500;
        return {
          success: false,
          message: "Failed to create post",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: Schemas.CreatePost,
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
        tags: ["Blog"],
        summary: "Create new post",
        description: `Create a new blog post. Authentication via Supabase JWT token is required.`,
        responses: {
          "200": {
            description: "Post created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Authentication required or invalid token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  .use(authGuard)
  .put(
    "/:id",
    async ({ params, body, set }) => {
      try {
        // Check if post exists
        const existingPost = await queryOne(
          "SELECT id, author_id FROM posts WHERE id = $1",
          [params.id]
        );

        if (!existingPost) {
          set.status = 404;
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
          set.status = 400;
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
        set.status = 500;
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
      body: Schemas.UpdatePost,
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
        tags: ["Blog"],
        summary: "Update post",
        description: `Update an existing post. Only the author or admin can update a post.`,
        responses: {
          "200": {
            description: "Post updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "400": {
            description: "No fields to update",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  .use(authGuard)
  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        // Check if post exists
        const existingPost = await queryOne(
          "SELECT id, author_id FROM posts WHERE id = $1",
          [params.id]
        );

        if (!existingPost) {
          set.status = 404;
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
        set.status = 500;
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
        tags: ["Blog"],
        summary: "Delete post",
        description: `Delete a post permanently. Only the author or admin can delete a post.`,
        responses: {
          "200": {
            description: "Post deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  .use(authGuard)
  // Like/Unlike a post
  .post(
    "/:id/like",
    async ({ params: { id }, set, user, headers }) => {
      try {
        if (!user) {
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No valid authentication token",
          };
        }
        
        console.log('[Like Endpoint] User:', `present (${user.id})`);
        
        // Use Supabase UUID directly as user_id (no database lookup needed)
        const userId = user.id;
        
        // Check if user exists in database, create if not
        let dbUser = await queryOne("SELECT id FROM users WHERE id = $1", [userId]);

        if (!dbUser) {
          // Create user in database with Supabase UUID
          dbUser = await queryOne(
            "INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING id",
            [userId, user.email, user.name || user.email, user.picture || null]
          );
        }

        // Check if post exists
        const postExists = await queryOne(
          "SELECT id FROM posts WHERE id = $1",
          [id]
        );

        if (!postExists) {
          set.status = 404;
          return {
            success: false,
            error: "Post not found",
            message: "Post does not exist",
          };
        }

        // Check if user already liked this post
        const existingLike = await queryOne(
          "SELECT post_id FROM post_likes WHERE post_id = $1 AND user_id = $2",
          [id, userId]
        );

        if (existingLike) {
          // Unlike the post
          await queryOne(
            "DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2",
            [id, userId]
          );

          return {
            success: true,
            message: "Post unliked successfully",
            data: { action: "unliked" },
          };
        } else {
          // Like the post
          await queryOne(
            "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)",
            [id, userId]
          );

          // Create notification for post author (async, don't wait)
          createPostLikeNotification(userId, id).catch((error) => {
            console.error("Failed to create like notification:", error);
          });

          return {
            success: true,
            message: "Post liked successfully",
            data: { action: "liked" },
          };
        }
      } catch (error) {
        console.error("Error liking/unliking post:", error);
        set.status = 500;
        return {
          success: false,
          error: "Failed to like/unlike post",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
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
            action: t.Union([t.Literal("liked"), t.Literal("unliked")]),
          })
        ),
        error: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Blog"],
        summary: "Like/Unlike post",
        description: `Toggle like status for a post. If user already liked the post, it will be unliked. Authentication via Supabase JWT token is required.`,
        responses: {
          "200": {
            description: "Post like status toggled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Authentication required or invalid token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    error: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    error: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [false] },
                    error: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    }
  );
