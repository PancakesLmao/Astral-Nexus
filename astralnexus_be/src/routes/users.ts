import { Elysia, t } from "elysia";
import { appConfig } from "../config/app";
import { db } from "../config/database";
import { Schemas } from "../schemas";
import { authGuard } from "../middleware/auth";

// User management routes
export const userRoutes = new Elysia({ prefix: "/api/users" })
  .get(
    "/profile/:id",
    async ({ params: { id }, set }) => {
      try {
        const query = `
          SELECT 
            u.id,
            u.email,
            u.name,
            u.picture,
            u.created_at,
            u.updated_at
          FROM users u
          WHERE u.id = $1
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "User not found",
            error: "No user found with the provided ID",
          };
        }

        const user = result.rows[0];
        return {
          success: true,
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch user profile",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          data: Schemas.User,
        }),
        404: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
        500: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Get user profile",
        description: "Get user profile by ID",
      },
    }
  )
  .use(authGuard)
  .put(
    "/profile/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const { name, email } = body as { name?: string; email?: string };

        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (name !== undefined) {
          updates.push(`name = $${paramIndex}`);
          values.push(name);
          paramIndex++;
        }

        if (email !== undefined) {
          updates.push(`email = $${paramIndex}`);
          values.push(email);
          paramIndex++;
        }

        if (updates.length === 0) {
          set.status = 400;
          return {
            success: false,
            message: "No fields to update",
            error: "At least one field must be provided",
          };
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
          UPDATE users 
          SET ${updates.join(", ")}
          WHERE id = $${paramIndex}
          RETURNING id, email, name, picture, created_at, updated_at
        `;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "User not found",
            error: "No user found with the provided ID",
          };
        }

        const user = result.rows[0];
        return {
          success: true,
          message: "User profile updated successfully",
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              picture: user.picture,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
          },
        };
      } catch (error) {
        console.error("Error updating user profile:", error);

        // Handle unique constraint violations
        if (error instanceof Error && error.message.includes("duplicate key")) {
          set.status = 409;
          return {
            success: false,
            message: "Email already exists",
            error: "A user with this email already exists",
          };
        }

        set.status = 500;
        return {
          success: false,
          message: "Failed to update user profile",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: "email" })),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          message: t.String(),
          data: t.Object({
            user: Schemas.User,
          }),
        }),
        400: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
        404: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
        409: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
        500: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Update user profile",
        description: "Update user profile information",
      },
    }
  )

  // Get user statistics (posts count, followers, following, etc.)
  // Uses authenticated user's Supabase UUID directly
  .use(authGuard)
  .get(
    "/stats/:id",
    async ({ params: { id }, user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return {
            success: false,
            message: "Authentication required",
            error: "No valid authentication token",
          };
        }

        console.log('[Stats] Getting stats for user ID:', user.id);
        
        // Use the Supabase UUID directly as the user ID (no email lookup needed)
        // The user.id from authGuard is already the Supabase UUID which matches users.id in database
        const dbUserId = user.id;

        // Get user posts count
        const postsCountQuery = `
          SELECT COUNT(*) as posts_count
          FROM posts
          WHERE author_id = $1
        `;

        const postsResult = await db.query(postsCountQuery, [dbUserId]);
        const postsCount = parseInt(postsResult.rows[0].posts_count) || 0;
        console.log('[Stats] Posts count:', postsCount);

        // Get user comments count
        const commentsCountQuery = `
          SELECT COUNT(*) as comments_count
          FROM comments
          WHERE author_id = $1
        `;

        const commentsResult = await db.query(commentsCountQuery, [dbUserId]);
        const commentsCount =
          parseInt(commentsResult.rows[0].comments_count) || 0;

        // Get user notifications count
        const notificationsCountQuery = `
          SELECT COUNT(*) as notifications_count
          FROM notifications
          WHERE user_id = $1
        `;

        const notificationsResult = await db.query(notificationsCountQuery, [
          dbUserId,
        ]);
        const notificationsCount =
          parseInt(notificationsResult.rows[0].notifications_count) || 0;

        // For now, following and followers will be mock data since we don't have those tables
        // In a real app, you would have a follows/friendships table
        const mockFollowingCount = Math.floor(Math.random() * 200) + 50;
        const mockFollowersCount = Math.floor(Math.random() * 300) + 100;

        return {
          success: true,
          data: {
            posts: postsCount,
            comments: commentsCount,
            notifications: notificationsCount,
            following: mockFollowingCount,
            followers: mockFollowersCount,
          },
        };
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch user statistics",
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({
          description: "User ID (UUID)",
          minLength: 1,
        }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          data: t.Object({
            posts: t.Number(),
            comments: t.Number(),
            notifications: t.Number(),
            following: t.Number(),
            followers: t.Number(),
          }),
        }),
        404: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
        500: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Get user statistics",
        description:
          "Get user statistics including posts count, comments count, followers and following",
      },
    }
  )

  // Get user's posts
  // Uses authenticated user from JWT token to look up database user by email
  .use(authGuard)
  .get(
    "/profile/:id/posts",
    async ({ params: { id }, query, user, set }) => {
      try {
        const page = Math.max(1, parseInt(query.page as string) || 1);
        const limit = Math.min(
          50,
          Math.max(1, parseInt(query.limit as string) || 10)
        );
        const offset = (page - 1) * limit;
        const sortBy = (query.sort_by as string) || "created_at";
        const sortOrder = (query.sort_order as string) || "DESC";

        // console.log('[GetUserPosts] Getting posts for user email:', user!.email);

        // Look up database user by email from the authenticated Supabase user
        const userLookup = await db.query("SELECT id FROM users WHERE email = $1", [user!.email]);

        if (userLookup.rows.length === 0) {
          // console.warn(`[GetUserPosts] No database user found for email: ${user!.email}`);
          set.status = 404;
          return {
            success: false,
            message: "User not found",
            error: "No user found in database for authenticated email",
          };
        }

        const dbUserId = userLookup.rows[0].id;
        // console.log('[GetUserPosts] Found database user ID:', dbUserId);

        // Build WHERE conditions - only get posts for this user
        const whereConditions = ["p.author_id = $1", "p.published = TRUE"];
        const queryParams: any[] = [dbUserId];
        let paramIndex = 2;

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

        const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

        // Get total count
        const totalQuery = `
          SELECT COUNT(*) as total
          FROM posts p
          WHERE p.author_id = $1 AND p.published = TRUE
        `;
        const totalResult = await db.query(totalQuery, [dbUserId]);
        const total = parseInt(totalResult.rows[0]?.total || "0");

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
        queryParams.push(dbUserId, limit, offset);
        const posts = await db.query(postsQuery, queryParams);

        // Transform posts to match frontend format
        const transformedPosts = posts.rows.map((post: any) => {
          // Convert timestamps to ISO string format
          let createdAtISO = post.created_at;
          let updatedAtISO = post.updated_at;

          if (post.created_at instanceof Date) {
            createdAtISO = post.created_at.toISOString();
          } else if (typeof post.created_at === 'string') {
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
          message: "User posts retrieved successfully",
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
        console.error("Error fetching user posts:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch user posts",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({
          description: "User ID",
          minLength: 1,
        }),
      }),
      query: t.Object({
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({ description: "Posts per page (default: 10, max: 50)" })
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
        data: t.Optional(t.Object({
          posts: t.Array(Schemas.Post),
          pagination: Schemas.Pagination,
        })),
        error: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Users"],
        summary: "Get user's posts",
        description:
          "Get all posts created by a specific user with pagination and sorting",
      },
    }
  )

  // Delete user's post
  // Users can only delete their own posts
  .use(authGuard)
  .delete(
    "/profile/:userId/posts/:postId",
    async ({ params: { userId, postId }, user, set }) => {
      try {
        console.log('[DeleteUserPost] User:', user!.email, 'attempting to delete post:', postId);

        // Look up database user by email from the authenticated Supabase user
        const userLookup = await db.query("SELECT id FROM users WHERE email = $1", [user!.email]);

        if (userLookup.rows.length === 0) {
          console.warn(`[DeleteUserPost] No database user found for email: ${user!.email}`);
          set.status = 404;
          return {
            success: false,
            message: "User not found",
            error: "No user found in database for authenticated email",
          };
        }

        const dbUserId = userLookup.rows[0].id;

        // Check if post exists and belongs to this user
        const postLookup = await db.query(
          "SELECT id, author_id FROM posts WHERE id = $1",
          [postId]
        );

        if (postLookup.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "Post not found",
            error: "The requested post does not exist",
          };
        }

        const post = postLookup.rows[0];

        // Check if user owns this post
        if (post.author_id !== dbUserId) {
          console.warn(`[DeleteUserPost] User ${dbUserId} tried to delete post owned by ${post.author_id}`);
          set.status = 403;
          return {
            success: false,
            message: "Permission denied",
            error: "You can only delete your own posts",
          };
        }

        // Delete the post (cascade will handle related comments and likes)
        await db.query("DELETE FROM posts WHERE id = $1", [postId]);

        console.log('[DeleteUserPost] Post deleted successfully:', postId);

        return {
          success: true,
          message: "Post deleted successfully",
          data: {
            id: postId,
            deleted_at: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error deleting user post:", error);
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
        userId: t.String({
          description: "User ID",
          minLength: 1,
        }),
        postId: t.String({
          format: "uuid",
          description: "Post ID to delete",
        }),
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
        tags: ["Users"],
        summary: "Delete user's own post",
        description:
          "Delete a post created by the authenticated user. Users can only delete their own posts.",
      },
    }
  )
  .use(authGuard)
  .get(
    "/:userId/activities",
    async ({ params: { userId }, query: { limit = "4" }, set }) => {
      try {
        const limitNum = Math.min(parseInt(limit as string) || 4, 20); // Max 20 items

        // Fetch recent user activities from notifications table
        // This gives us a comprehensive activity log
        const query = `
          SELECT 
            id,
            type,
            title,
            message,
            created_at
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT $2
        `;

        const result = await db.query(query, [userId, limitNum]);

        const activities = result.rows.map((row: any) => ({
          id: row.id,
          type: row.type,
          text: row.message,
          timestamp: row.created_at,
        }));

        return {
          success: true,
          data: {
            activities,
          },
        };
      } catch (error) {
        console.error("Error fetching user activities:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch activities",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      query: t.Object({
        limit: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          data: t.Object({
            activities: t.Array(
              t.Object({
                id: t.String({ format: "uuid" }),
                type: t.Union([
                  t.Literal("like"),
                  t.Literal("comment"),
                  t.Literal("follow"),
                  t.Literal("mention"),
                  t.Literal("system"),
                ]),
                text: t.String(),
                timestamp: t.String({ format: "date-time" }),
              })
            ),
          }),
        }),
        500: t.Object({
          success: t.Literal(false),
          message: t.String(),
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Get user recent activities",
        description:
          "Retrieve recent activities (notifications) for a user. Activities include likes, comments, follows, and system events.",
      },
    }
  );

