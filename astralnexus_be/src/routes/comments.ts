import { Elysia, t } from "elysia";
import { queryAll, queryOne, query } from "../utils/database";
import { Schemas } from "../schemas";
import { authGuard } from "../middleware/auth";
import { verifySupabaseToken, extractBearerToken } from "../config/supabase";
import { createCommentNotification } from "./notifications";

// Comment handler for Honkai Blog
export const commentRoutes = new Elysia({ prefix: "/api/blog/comments" })
  // Middleware to optionally extract user from token for GET route
  .derive(async ({ headers, request }) => {
    const path = new URL(request.url).pathname;
    const authHeader = headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      return { user: undefined };
    }

    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      const user = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
        picture: supabaseUser.user_metadata?.avatar_url || '',
        provider: supabaseUser.app_metadata?.provider || 'discord'
      };
      return { user };
    }

    return { user: undefined };
  })
  // Get all comments for a specific post
  .get(
    "/:postId",
    async ({ params: { postId }, set, user }) => {
      try {
        // Query real comments from database with like information
        const commentsQuery = `
          SELECT 
            c.id,
            c.content,
            c.created_at,
            c.updated_at,
            c.post_id,
            c.likes_count,
            u.id as author_id,
            u.name as author_name,
            u.email as author_email,
            u.picture as author_picture,
            CASE 
              WHEN $2::text IS NOT NULL AND cl.user_id IS NOT NULL THEN true 
              ELSE false 
            END as is_liked
          FROM comments c
          JOIN users u ON c.author_id = u.id
          LEFT JOIN comment_likes cl ON c.id = cl.comment_id AND cl.user_id = $2::text
          WHERE c.post_id = $1
          ORDER BY c.created_at DESC
        `;

        const comments = await queryAll(commentsQuery, [postId, user?.id || null]);

        // Transform comments to match expected format
        const transformedComments = comments.map((comment: any) => {
          const createdAtIso = new Date(comment.created_at).toISOString();
          const updatedAtIso = new Date(comment.updated_at).toISOString();
          return {
            id: comment.id.toString(),
            post_id: comment.post_id.toString(),
            author_id: comment.author_id.toString(),
            author: {
              id: comment.author_id.toString(),
              name: comment.author_name,
              email: comment.author_email,
              picture: comment.author_picture,
            },
            content: comment.content,
            likes_count: parseInt(comment.likes_count) || 0,
            is_liked: comment.is_liked,
            created_at: createdAtIso,
            updated_at: updatedAtIso,
          };
        });

        set.status = 200;
        return {
          success: true,
          data: transformedComments,
          message: `Retrieved ${transformedComments.length} comments for post ${postId}`,
        };
      } catch (error) {
        console.error("Error fetching comments:", error);
        set.status = 500;
        return {
          success: false,
          error: "Failed to retrieve comments",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    {
      params: t.Object({
        postId: t.String({
          format: "uuid",
          description: "UUID of the blog post",
        }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          data: t.Array(Schemas.Comment),
          message: t.String(),
        }),
        401: Schemas.ErrorResponse,
        500: Schemas.ErrorResponse,
      },
      detail: {
        tags: ["Blog"],
        summary: "Get comments for a post",
        description: "Retrieves all comments for a specific blog post with pagination support",
        responses: {
          200: {
            description: "Successfully retrieved comments",
            content: {
              "application/json": {
                schema: Schemas.CommentsListResponse,
              },
            },
          },
          401: {
            description: "Unauthorized - invalid or missing session",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
        },
      },
    }
  )

  // Create a new comment
  .use(authGuard)
  .post(
    "/",
    async ({ body, set, user, headers }) => {
      try {
        // User is already authenticated by requireAuthMiddleware
        const currentUser = user;
        
        if (!currentUser) {
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No valid authentication token",
          };
        }

        // Use Supabase UUID directly as author_id (no database lookup needed)
        const authorId = currentUser.id;
        
        // Check if user exists in database, create if not
        let dbUser = await queryOne("SELECT id, email, name, picture FROM users WHERE id = $1", [authorId]);

        if (!dbUser) {
          // Create user in database with Supabase UUID
          dbUser = await queryOne(
            "INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING id, email, name, picture",
            [authorId, currentUser.email, currentUser.name || currentUser.email, currentUser.picture || null]
          );
        }

        // Validate required fields
        if (!body.post_id || !body.content) {
          set.status = 400;
          return {
            success: false,
            error: "Missing required fields",
            message: "post_id and content are required",
          };
        }

        // Insert comment into database
        const insertQuery = `
          INSERT INTO comments (post_id, author_id, content)
          VALUES ($1, $2, $3)
          RETURNING id, created_at
        `;

        const result = await queryOne(insertQuery, [
          body.post_id,
          authorId,
          body.content,
        ]);

        // Create notification for post author (async, don't wait)
        createCommentNotification(authorId, body.post_id, result.id.toString(), body.content).catch((error) => {
          console.error("Failed to create comment notification:", error);
        });

        const createdAtIso = new Date(result.created_at).toISOString();
        const newComment = {
          id: result.id.toString(),
          post_id: body.post_id,
          author_id: authorId,
          author: {
            id: authorId,
            name: dbUser.name,
            email: dbUser.email,
            picture: dbUser.picture,
          },
          content: body.content,
          likes_count: 0,
          is_liked: false,
          created_at: createdAtIso,
          updated_at: createdAtIso,
        };

        set.status = 201;
        return {
          success: true,
          data: newComment,
          message: "Comment created successfully",
        };
      } catch (error) {
        console.error("Error creating comment:", error);
        set.status = 500;
        return {
          success: false,
          error: "Failed to create comment",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    {
      body: Schemas.CreateComment,
      response: {
        201: t.Object({
          success: t.Literal(true),
          data: Schemas.Comment,
          message: t.String(),
        }),
        400: Schemas.ErrorResponse,
        401: Schemas.ErrorResponse,
        500: Schemas.ErrorResponse,
      },
      detail: {
        tags: ["Blog"],
        summary: "Create a new comment",
        description: "Adds a new comment to a blog post (authentication required)",
        responses: {
          201: {
            description: "Comment created successfully",
            content: {
              "application/json": {
                schema: Schemas.CommentResponse,
              },
            },
          },
          400: {
            description: "Bad request - missing required fields",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
        },
      },
    }
  )

  // Update a comment (only by author)
  .use(authGuard)
  .put(
    "/:id",
    async ({ params: { id }, body, set, user, headers }) => {
      try {
        // User is already authenticated by requireAuthMiddleware
        const currentUser = user;
        if (!currentUser) {
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No valid authentication token",
          };
        }

        // Get user from database
        const dbUser = await queryOne("SELECT id FROM users WHERE email = $1", [currentUser.email]);
        if (!dbUser) {
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "User not found",
          };
        }

        const commentId = id; // UUID as string

        // Check if comment exists and user owns it
        const existingComment = await queryOne(
          "SELECT * FROM comments WHERE id = $1 AND author_id = $2",
          [commentId, dbUser.id]
        );

        if (!existingComment) {
          set.status = 404;
          return {
            success: false,
            error: "Comment not found",
            message:
              "Comment not found or you don't have permission to edit it",
          };
        }

        if (!body.content) {
          set.status = 400;
          return {
            success: false,
            error: "Content is required",
            message: "Comment content cannot be empty",
          };
        }

        // Update comment in database
        const updateQuery = `
          UPDATE comments 
          SET content = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND author_id = $3
          RETURNING id, post_id, content, created_at, updated_at
        `;

        const result = await queryOne(updateQuery, [
          body.content,
          commentId,
          dbUser.id,
        ]);

        const updatedComment = {
          id: result.id.toString(),
          post_id: result.post_id.toString(),
          author_id: dbUser.id.toString(),
          author: {
            id: dbUser.id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            picture: dbUser.picture,
          },
          content: result.content,
          likes_count: 0,
          is_liked: false,
          created_at: new Date(result.created_at).toISOString(),
          updated_at: new Date(result.updated_at).toISOString(),
        };

        set.status = 200;
        return {
          success: true,
          data: updatedComment,
          message: "Comment updated successfully",
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          error: "Failed to update comment",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({
          format: "uuid",
          description: "Comment UUID",
        }),
      }),
      body: Schemas.UpdateComment,
      response: {
        200: t.Object({
          success: t.Literal(true),
          data: Schemas.Comment,
          message: t.String(),
        }),
        400: Schemas.ErrorResponse,
        401: Schemas.ErrorResponse,
        404: Schemas.ErrorResponse,
        500: Schemas.ErrorResponse,
      },
      detail: {
        tags: ["Blog"],
        summary: "Update a comment",
        description: "Updates an existing comment (author only, authentication required)",
        responses: {
          200: {
            description: "Comment updated successfully",
            content: {
              "application/json": {
                schema: Schemas.CommentResponse,
              },
            },
          },
          400: {
            description: "Bad request - content is required",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          404: {
            description: "Not found - comment does not exist or user is not the author",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
        },
      },
    }
  )

  // Delete a comment
  .use(authGuard)
  .delete(
    "/:id",
    async ({ params: { id }, set, user, headers }) => {
      try {
        // User is already authenticated by requireAuthMiddleware
        const currentUser = user;
        
        if (!currentUser) {
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No valid authentication token",
          };
        }

        // Get user from database
        const dbUser = await queryOne("SELECT id FROM users WHERE email = $1", [currentUser.email]);
        if (!dbUser) {
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "User not found",
          };
        }

        const commentId = id; // UUID as string

        // Check if comment exists and user owns it
        const existingComment = await queryOne(
          "SELECT * FROM comments WHERE id = $1 AND author_id = $2",
          [commentId, dbUser.id]
        );

        if (!existingComment) {
          set.status = 404;
          return {
            success: false,
            error: "Comment not found",
            message:
              "Comment not found or you don't have permission to delete it",
          };
        }

        // Delete comment from database
        await queryOne(
          "DELETE FROM comments WHERE id = $1 AND author_id = $2",
          [commentId, dbUser.id]
        );

        set.status = 200;
        return {
          success: true,
          message: `Comment ${commentId} deleted successfully`,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          error: "Failed to delete comment",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({
          format: "uuid",
          description: "Comment UUID",
        }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          message: t.String(),
        }),
        401: Schemas.ErrorResponse,
        404: Schemas.ErrorResponse,
        500: Schemas.ErrorResponse,
      },
      detail: {
        tags: ["Blog"],
        summary: "Delete a comment",
        description: "Deletes a comment (author only, authentication required)",
        responses: {
          200: {
            description: "Comment deleted successfully",
            content: {
              "application/json": {
                schema: Schemas.SuccessResponse,
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          404: {
            description: "Not found - comment does not exist or user is not the author",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
        },
      },
    }
  )

  // Like/Unlike a comment
  .use(authGuard)
  .post(
    "/:id/like",
    async ({ params: { id }, set, user, headers }) => {
      const requestId = Math.random().toString(36).slice(2, 9);
      console.log(`[LIKE-${requestId}] POST /api/blog/comments/${id}/like START`);
      
      try {
        // User is already authenticated by requireAuthMiddleware
        const currentUser = user;
        
        if (!currentUser) {
          set.status = 401;
          console.log(`[LIKE-${requestId}] No user authenticated`);
          return {
            success: false,
            error: "Authentication required",
            message: "No valid authentication token",
          };
        }

        console.log(`[LIKE-${requestId}] User: ${(currentUser as any).id}`);

        // Use Supabase UUID directly as user_id (no database lookup needed)
        const userId = currentUser.id;
        
        // Check if user exists in database, create if not
        let dbUser = await queryOne("SELECT id FROM users WHERE id = $1", [userId]);

        if (!dbUser) {
          // Create user in database with Supabase UUID
          dbUser = await queryOne(
            "INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING id",
            [userId, currentUser.email, currentUser.name || currentUser.email, currentUser.picture || null]
          );
        }

        // Check if comment exists
        const commentExists = await queryOne(
          "SELECT id FROM comments WHERE id = $1",
          [id]
        );

        if (!commentExists) {
          set.status = 404;
          return {
            success: false,
            error: "Comment not found",
            message: "Comment does not exist",
          };
        }

        // Check if user already liked this comment
        const existingLike = await queryOne(
          "SELECT comment_id FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
          [id, userId]
        );

        if (existingLike) {
          // Unlike the comment
          console.log(`[LIKE-${requestId}] Unliking comment`);

          await queryOne(
            "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
            [id, userId]
          );

          // Get actual count from database
          const actualCount = await queryOne(
            "SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1",
            [id]
          );

          // Update likes count to match actual count
          const result = await queryOne(
            "UPDATE comments SET likes_count = $2 WHERE id = $1 RETURNING likes_count",
            [id, parseInt(actualCount.count)]
          );

          console.log(`[LIKE-${requestId}] After unlike: likes_count=${result.likes_count}, actual_likes=${actualCount.count}`);

          return {
            success: true,
            message: "Comment unliked successfully",
            data: { action: "unliked" },
          };
        } else {
          // Like the comment
          console.log(`[LIKE-${requestId}] Liking comment`);
          const existingLikeCheck = await queryOne(
            "SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
            [id, userId]
          );
          console.log(`[LIKE-${requestId}] Before INSERT: count=${existingLikeCheck.count}`);

          await queryOne(
            "INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)",
            [id, userId]
          );

          // Get actual count from database
          const actualCount = await queryOne(
            "SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1",
            [id]
          );

          // Update likes count to match actual count
          const result = await queryOne(
            "UPDATE comments SET likes_count = $2 WHERE id = $1 RETURNING likes_count",
            [id, parseInt(actualCount.count)]
          );

          console.log(`[LIKE-${requestId}] After like: likes_count=${result.likes_count}, actual_likes=${actualCount.count}`);

          return {
            success: true,
            message: "Comment liked successfully",
            data: { action: "liked" },
          };
        }
      } catch (error) {
        console.error(`[LIKE-${requestId}] Error liking/unliking comment:`, error);
        set.status = 500;
        return {
          success: false,
          error: "Failed to like/unlike comment",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({
          format: "uuid",
          description: "Comment unique identifier",
        }),
      }),
      response: {
        200: Schemas.LikeResponse,
        401: Schemas.ErrorResponse,
        404: Schemas.ErrorResponse,
        500: Schemas.ErrorResponse,
      },
      detail: {
        tags: ["Blog"],
        summary: "Like/Unlike a comment",
        description: "Toggle like status for a comment (authentication required). If user already liked the comment, it will be unliked. If not, it will be liked.",
        responses: {
          200: {
            description: "Comment like status toggled successfully",
            content: {
              "application/json": {
                schema: Schemas.LikeResponse,
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          404: {
            description: "Not found - comment does not exist",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: Schemas.ErrorResponse,
              },
            },
          },
        },
      },
    }
  );
