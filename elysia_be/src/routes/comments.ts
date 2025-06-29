import { Elysia, t } from "elysia";

// Comment handler for Honkai Blog
export const commentRoutes = new Elysia({ prefix: "/api/comments" })
  // Get all comments for a specific post
  .get(
    "/:postId",
    ({ params: { postId }, set }) => {
      try {
        // In a real app, you'd query your database
        const comments = [
          {
            id: 1,
            postId: parseInt(postId),
            author: "Kiana Tuna",
            content: "Great post about Honkai Impact 3rd!",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            postId: parseInt(postId),
            author: "Terisa Apocalypse",
            content: "Thanks for sharing this strategy guide, captain",
            createdAt: new Date().toISOString(),
          },
        ];

        set.status = 200;
        return {
          success: true,
          data: comments,
          message: `Retrieved ${comments.length} comments for post ${postId}`,
        };
      } catch (error) {
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
    ({ body, set }) => {
      try {
        // Validate required fields
        if (!body.postId || !body.author || !body.content) {
          set.status = 400;
          return {
            success: false,
            error: "Missing required fields",
            message: "postId, author, and content are required",
          };
        }

        // In a real app, you'd insert into your database
        const newComment = {
          id: Math.floor(Math.random() * 1000) + 1, // Mock ID generation
          postId: body.postId,
          author: body.author,
          content: body.content,
          createdAt: new Date().toISOString(),
        };

        set.status = 201;
        return {
          success: true,
          data: newComment,
          message: "Comment created successfully",
        };
      } catch (error) {
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
        author: t.String({
          minLength: 1,
          maxLength: 100,
          description: "Author name (e.g., Captain username)",
        }),
        content: t.String({
          minLength: 1,
          maxLength: 1000,
          description: "Comment content",
        }),
        email: t.Optional(
          t.String({
            format: "email",
            description: "Optional email for notifications",
          })
        ),
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
    ({ params: { id }, body, set }) => {
      try {
        const commentId = parseInt(id);

        // In a real app, you'd check if comment exists and if user owns it
        if (!body.content) {
          set.status = 400;
          return {
            success: false,
            error: "Content is required",
            message: "Comment content cannot be empty",
          };
        }

        // Mock update
        const updatedComment = {
          id: commentId,
          postId: body.postId || 1,
          author: body.author || "Unknown Captain",
          content: body.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
        author: t.Optional(t.String()),
        postId: t.Optional(t.Number()),
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
    ({ params: { id }, set }) => {
      try {
        const commentId = parseInt(id);

        // In a real app, you'd check if comment exists and if user owns it
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
  );
