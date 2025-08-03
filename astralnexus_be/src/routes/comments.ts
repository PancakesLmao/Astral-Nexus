import { Elysia, t } from "elysia";
import { queryAll, queryOne, query } from "../utils/database";

// Comment handler for Honkai Blog
export const commentRoutes = new Elysia({ prefix: "/api/comments" })
  // Get all comments for a specific post
  .get(
    "/:postId",
    async ({ params: { postId }, set }) => {
      try {
        // Query real comments from database
        const commentsQuery = `
          SELECT 
            c.id,
            c.content,
            c.created_at,
            c.updated_at,
            c.post_id,
            u.id as author_id,
            u.name as author_name,
            u.email as author_email,
            u.picture as author_picture
          FROM comments c
          JOIN users u ON c.author_id = u.id
          WHERE c.post_id = $1
          ORDER BY c.created_at DESC
        `;

        const comments = await queryAll(commentsQuery, [postId]);

        // Transform comments to match expected format
        const transformedComments = comments.map((comment: any) => ({
          id: parseInt(comment.id),
          postId: parseInt(comment.post_id),
          author: comment.author_name,
          content: comment.content,
          createdAt: new Date(comment.created_at).toISOString(),
        }));

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
          description: "ID of the blog post",
          pattern: "^[0-9]+$",
        }),
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Optional(
          t.Array(
            t.Object({
              id: t.Number(),
              postId: t.Number(),
              author: t.String(),
              content: t.String(),
              createdAt: t.String(),
            })
          )
        ),
        message: t.String(),
        error: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Comments"],
        summary: "Get comments for a post",
        description: "Retrieves all comments for a specific blog post",
      },
    }
  )

  // Create a new comment
  .post(
    "/",
    async ({ body, set, cookie, headers }) => {
      try {
        // Manual authentication check (same as posts)
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No session found",
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "Invalid or expired session",
          };
        }

        // Validate required fields
        if (!body.postId || !body.content) {
          set.status = 400;
          return {
            success: false,
            error: "Missing required fields",
            message: "postId and content are required",
          };
        }

        // Insert comment into database
        const insertQuery = `
          INSERT INTO comments (post_id, author_id, content)
          VALUES ($1, $2, $3)
          RETURNING id, created_at
        `;

        const result = await queryOne(insertQuery, [
          body.postId,
          session.user_id,
          body.content,
        ]);

        const newComment = {
          id: parseInt(result.id),
          postId: body.postId,
          author: session.name,
          content: body.content,
          createdAt: new Date(result.created_at).toISOString(),
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
      body: t.Object({
        postId: t.Number({
          minimum: 1,
          description: "ID of the blog post",
        }),
        content: t.String({
          minLength: 1,
          maxLength: 1000,
          description: "Comment content",
        }),
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Optional(
          t.Object({
            id: t.Number(),
            postId: t.Number(),
            author: t.String(),
            content: t.String(),
            createdAt: t.String(),
          })
        ),
        message: t.String(),
        error: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Comments"],
        summary: "Create a new comment",
        description:
          "Adds a new comment to a blog post about Honkai Impact 3rd",
      },
    }
  )

  // Update a comment (only by author)
  .put(
    "/:id",
    async ({ params: { id }, body, set, cookie, headers }) => {
      try {
        // Manual authentication check (same as posts)
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No session found",
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "Invalid or expired session",
          };
        }

        const commentId = parseInt(id);

        // Check if comment exists and user owns it
        const existingComment = await queryOne(
          "SELECT * FROM comments WHERE id = $1 AND author_id = $2",
          [commentId, session.user_id]
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
          session.user_id,
        ]);

        const updatedComment = {
          id: parseInt(result.id),
          postId: result.post_id,
          author: session.name,
          content: result.content,
          createdAt: new Date(result.created_at).toISOString(),
          updatedAt: new Date(result.updated_at).toISOString(),
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
          description: "Comment ID",
          pattern: "^[0-9]+$",
        }),
      }),
      body: t.Object({
        content: t.String({
          minLength: 1,
          maxLength: 1000,
          description: "Updated comment content",
        }),
      }),
      detail: {
        tags: ["Comments"],
        summary: "Update a comment",
        description: "Updates an existing comment (author only)",
      },
    }
  )

  // Delete a comment
  .delete(
    "/:id",
    async ({ params: { id }, set, cookie, headers }) => {
      try {
        // Manual authentication check (same as posts)
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No session found",
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "Invalid or expired session",
          };
        }

        const commentId = parseInt(id);

        // Check if comment exists and user owns it
        const existingComment = await queryOne(
          "SELECT * FROM comments WHERE id = $1 AND author_id = $2",
          [commentId, session.user_id]
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
          [commentId, session.user_id]
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
          description: "Comment ID",
          pattern: "^[0-9]+$",
        }),
      }),
      detail: {
        tags: ["Comments"],
        summary: "Delete a comment",
        description: "Deletes a comment (author only)",
      },
    }
  )

  // Like/Unlike a comment
  .post(
    "/:id/like",
    async ({ params: { id }, set, cookie, headers }) => {
      try {
        // Manual authentication check (same as create comment)
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "No session found",
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
          set.status = 401;
          return {
            success: false,
            error: "Authentication required",
            message: "Invalid or expired session",
          };
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
          [id, session.user_id]
        );

        if (existingLike) {
          // Unlike the comment
          await queryOne(
            "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
            [id, session.user_id]
          );

          // Update likes count
          await queryOne(
            "UPDATE comments SET likes_count = likes_count - 1 WHERE id = $1",
            [id]
          );

          return {
            success: true,
            message: "Comment unliked successfully",
            data: { action: "unliked" },
          };
        } else {
          // Like the comment
          await queryOne(
            "INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)",
            [id, session.user_id]
          );

          // Update likes count
          await queryOne(
            "UPDATE comments SET likes_count = likes_count + 1 WHERE id = $1",
            [id]
          );

          return {
            success: true,
            message: "Comment liked successfully",
            data: { action: "liked" },
          };
        }
      } catch (error) {
        console.error("Error liking/unliking comment:", error);
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
        tags: ["Comments"],
        summary: "Like/Unlike comment",
        description: `
        Toggle like status for a comment. If user already liked the comment, it will be unliked.
        If user hasn't liked the comment, it will be liked.

        **Path Parameters:**
        - \`id\`: Comment UUID

        **Authentication:** Required
        `,
      },
    }
  );
