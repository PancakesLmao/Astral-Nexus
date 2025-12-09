import { Elysia, t } from "elysia";
import { db } from "../config/database";
import { Schemas } from "../schemas";
import { authGuard } from "../middleware/auth";

// Utility function to create welcome notification for new users
export async function createWelcomeNotification(userId: string) {
  try {
    // Get admin user ID (fixed admin UUID used in init.sql)
    const adminQuery = `
      SELECT id FROM users
      WHERE email = 'admin@astralnexus.com'
    `;
    const adminResult = await db.query(adminQuery);

    if (adminResult.rows.length === 0) {
      console.error("Admin user not found for welcome notification");
      return null;
    }

    const adminId = adminResult.rows[0].id;

    const welcomeMessage = `Take your time to discover the platform. When you're ready, start your journey to support the community
`;

    const insertQuery = `
      INSERT INTO notifications (user_id, type, title, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      userId,
      "system",
      "Welcome to AstralNexus!",
      welcomeMessage,
    ]);

    console.log(`Welcome notification created for user ${userId}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating welcome notification:", error);
    return null;
  }
}

// Utility function to create notification when a post is liked
export async function createPostLikeNotification(likerId: string, postId: string) {
  try {
    // Get post author and liker info
    const postQuery = `
      SELECT p.author_id, p.title, u.name as liker_name
      FROM posts p
      JOIN users u ON u.id = $1
      WHERE p.id = $2
    `;
    const postResult = await db.query(postQuery, [likerId, postId]);

    if (postResult.rows.length === 0) {
      console.error("Post or liker not found");
      return null;
    }

    const { author_id, title, liker_name } = postResult.rows[0];

    // Don't create notification if user likes their own post
    if (author_id === likerId) {
      return null;
    }

    const insertQuery = `
      INSERT INTO notifications (user_id, type, title, message, post_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      author_id,
      "like",
      "Someone liked your post!",
      `${liker_name} liked your post "${title}"`,
      postId,
    ]);

    console.log(`Like notification created for post ${postId}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating post like notification:", error);
    return null;
  }
}

// Utility function to create notification when a comment is added
export async function createCommentNotification(commenterId: string, postId: string, commentId: string, commentContent: string) {
  try {
    // Get post author and commenter info
    const postQuery = `
      SELECT p.author_id, p.title, u.name as commenter_name
      FROM posts p
      JOIN users u ON u.id = $1
      WHERE p.id = $2
    `;
    const postResult = await db.query(postQuery, [commenterId, postId]);

    if (postResult.rows.length === 0) {
      console.error("Post or commenter not found");
      return null;
    }

    const { author_id, title, commenter_name } = postResult.rows[0];

    // Don't create notification if user comments on their own post
    if (author_id === commenterId) {
      return null;
    }

    // Truncate comment content for notification
    const truncatedComment = commentContent.length > 100
      ? commentContent.substring(0, 100) + "..."
      : commentContent;

    const insertQuery = `
      INSERT INTO notifications (user_id, type, title, message, post_id, comment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      author_id,
      "comment",
      "New comment on your post!",
      `${commenter_name} commented: "${truncatedComment}"`,
      postId,
      commentId,
    ]);

    console.log(`Comment notification created for post ${postId}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating comment notification:", error);
    return null;
  }
}

export const notificationsRoutes = new Elysia({ prefix: "/api/blog/notifications" })
  .use(authGuard)
  .get(
    "/",
    async ({ user, query, set }: any) => {
      try {
        // Use authenticated user from context, fallback to query param if provided
        const user_id = user?.id || query?.user_id;

        if (!user_id) {
          set.status = 400;
          return {
            success: false,
            message: "User ID is required",
            error: "Missing user_id parameter or not authenticated",
          };
        }

        const { page = "1", limit = "10" } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // Build WHERE clause for filtering
        let whereClause = "WHERE user_id = $1";
        const params: any[] = [user_id];

        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total 
          FROM notifications 
          ${whereClause}
        `;
        const countResult = await db.query(countQuery, [user_id]);
        const total = parseInt(countResult.rows[0]?.total || "0");

        // Get notifications with pagination
        const notificationsQuery = `
          SELECT 
            n.*,
            p.title as post_title,
            c.content as comment_content
          FROM notifications n
          LEFT JOIN posts p ON n.post_id = p.id
          LEFT JOIN comments c ON n.comment_id = c.id
          ${whereClause}
          ORDER BY n.created_at DESC
          LIMIT $2 OFFSET $3
        `;

        const result = await db.query(notificationsQuery, [
          user_id,
          limitNum,
          offset,
        ]);

        const totalPages = Math.ceil(total / limitNum);
        const hasNext = pageNum < totalPages;
        const hasPrev = pageNum > 1;

        set.status = 200;
        return {
          success: true,
          message: "Notifications retrieved successfully",
          data: {
            notifications: result.rows,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total,
              totalPages,
              hasNext,
              hasPrev,
            },
          },
        };
      } catch (error) {
        console.error("Error fetching notifications:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch notifications",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        tags: ["Blog"],
        summary: "Get user notifications",
        description:
          "Retrieve notifications for a specific user with pagination and filtering options. Returns an array of notifications paginated according to the limit parameter.",
        responses: {
          "200": {
            description: "Notifications retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        notifications: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Notification" },
                          description: "Array of notification objects",
                        },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - Missing or invalid user_id parameter. The user_id query parameter is required and must be a valid UUID.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "User ID is required" },
                    error: { type: "string", example: "Missing user_id parameter" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error - Failed to fetch notifications from database. Check server logs for details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Failed to fetch notifications" },
                    error: { type: "string", description: "Detailed error message" },
                  },
                },
              },
            },
          },
        },
      },
      query: t.Object({
        user_id: t.String({ description: "User ID to get notifications for" }),
        page: t.Optional(t.String({ description: "Page number (default: 1)" })),
        limit: t.Optional(
          t.String({
            description: "Number of notifications per page (default: 10)",
          })
        ),
      }),
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { user_id, type, title, message, post_id, comment_id } = body;

        const query = `
          INSERT INTO notifications (user_id, type, title, message, post_id, comment_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;

        const result = await db.query(query, [
          user_id,
          type,
          title,
          message,
          post_id || null,
          comment_id || null,
        ]);

        set.status = 201;
        return {
          success: true,
          message: "Notification created successfully",
          data: {
            notification: result.rows[0],
          },
        };
      } catch (error) {
        console.error("Error creating notification:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to create notification",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        tags: ["Blog"],
        summary: "Create a new notification",
        description: "Create a new notification for a user. The notification will include the provided type, title, and message. Optional post_id and comment_id can link the notification to specific entities.",
        responses: {
          "201": {
            description: "Notification created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        notification: { $ref: "#/components/schemas/Notification" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request body - Missing or invalid required fields. Ensure user_id is provided and type is one of: like, comment, follow, mention, system.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Invalid request body" },
                    error: { type: "string", description: "Details about validation error" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error - Failed to create notification in database. Check server logs for details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Failed to create notification" },
                    error: { type: "string", description: "Detailed error message" },
                  },
                },
              },
            },
          },
        },
      },
      body: t.Object({
        user_id: t.String({ description: "User ID to send notification to" }),
        type: t.String({
          description: "Notification type",
          enum: ["like", "comment", "follow", "mention", "system"],
        }),
        title: t.String({ description: "Notification title" }),
        message: t.String({ description: "Notification message content" }),
        post_id: t.Optional(
          t.String({ description: "Related post ID (optional)" })
        ),
        comment_id: t.Optional(
          t.String({ description: "Related comment ID (optional)" })
        ),
      }),
    }
  )
  .use(authGuard)
  .delete(
    "/:id",
    async ({ params, set, user }) => {
      try {
        const { id } = params;

        // Get authenticated user from database
        const userLookup = await db.query("SELECT id FROM users WHERE email = $1", [user!.email]);

        if (userLookup.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "User not found",
            error: "No user found in database for authenticated email",
          };
        }

        const dbUserId = userLookup.rows[0].id;

        // Check if notification belongs to this user
        const notificationLookup = await db.query(
          "SELECT id, user_id FROM notifications WHERE id = $1",
          [id]
        );

        if (notificationLookup.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "Notification not found",
            error: "No notification found with the provided ID",
          };
        }

        const notification = notificationLookup.rows[0];

        // Check if user owns this notification
        if (notification.user_id !== dbUserId) {
          set.status = 403;
          return {
            success: false,
            message: "Permission denied",
            error: "You can only delete your own notifications",
          };
        }

        // Delete the notification
        await db.query("DELETE FROM notifications WHERE id = $1", [id]);

        set.status = 200;
        return {
          success: true,
          message: "Notification deleted successfully",
          data: {
            deleted_id: id,
          },
        };
      } catch (error) {
        console.error("Error deleting notification:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to delete notification",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        tags: ["Blog"],
        summary: "Delete user's notification",
        description: "Delete a specific notification. Users can only delete their own notifications.",
        responses: {
          "200": {
            description: "Notification deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        deleted_id: { type: "string", format: "uuid", description: "ID of the deleted notification" },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "Permission denied - Cannot delete other users' notifications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Notification not found - The notification with the provided ID does not exist.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Notification not found" },
                    error: { type: "string", example: "No notification found with the provided ID" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error - Failed to delete notification from database. Check server logs for details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Failed to delete notification" },
                    error: { type: "string", description: "Detailed error message" },
                  },
                },
              },
            },
          },
        },
      },
      params: t.Object({
        id: t.String({ description: "Notification ID to delete" }),
      }),
    }
  )
  .get(
    "/count",
    async ({ query, set }) => {
      try {
        const { user_id } = query;

        if (!user_id) {
          set.status = 400;
          return {
            success: false,
            message: "User ID is required",
            error: "Missing user_id parameter",
          };
        }

        const countQuery = `
          SELECT COUNT(*) as count
          FROM notifications
          WHERE user_id = $1 AND read = false
        `;

        const result = await db.query(countQuery, [user_id]);
        const count = parseInt(result.rows[0]?.count || "0");

        set.status = 200;
        return {
          success: true,
          message: "Notification count retrieved successfully",
          data: {
            count,
          },
        };
      } catch (error) {
        console.error("Error fetching notification count:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch notification count",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        tags: ["Blog"],
        summary: "Get unread notification count",
        description: "Get the count of unread notifications for a specific user. Useful for displaying notification badges in the UI.",
        responses: {
          "200": {
            description: "Notification count retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        count: { type: "number", minimum: 0, description: "Number of unread notifications" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - Missing or invalid user_id parameter. The user_id query parameter is required and must be a valid UUID.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "User ID is required" },
                    error: { type: "string", example: "Missing user_id parameter" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error - Failed to fetch notification count from database. Check server logs for details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Failed to fetch notification count" },
                    error: { type: "string", description: "Detailed error message" },
                  },
                },
              },
            },
          },
        },
      },
      query: t.Object({
        user_id: t.String({ description: "User ID to get notification count for" }),
      }),
    }
  )
  .post(
    "/:id/read",
    async ({ params, set }) => {
      try {
        const { id } = params;

        const query = `
          UPDATE notifications
          SET read = true
          WHERE id = $1
          RETURNING id
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "Notification not found",
            error: "No notification found with the provided ID",
          };
        }

        set.status = 200;
        return {
          success: true,
          message: "Notification marked as read successfully",
          data: {
            notification_id: result.rows[0].id,
          },
        };
      } catch (error) {
        console.error("Error marking notification as read:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to mark notification as read",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        tags: ["Blog"],
        summary: "Mark notification as read",
        description: "Mark a specific notification as read. This updates the read flag to true and returns the notification ID. If the notification does not exist, returns a 404 error.",
        responses: {
          "200": {
            description: "Notification marked as read successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        notification_id: { type: "string", format: "uuid", description: "ID of the marked notification" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Notification not found - The notification with the provided ID does not exist.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Notification not found" },
                    error: { type: "string", example: "No notification found with the provided ID" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error - Failed to update notification in database. Check server logs for details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Failed to mark notification as read" },
                    error: { type: "string", description: "Detailed error message" },
                  },
                },
              },
            },
          },
        },
      },
      params: t.Object({
        id: t.String({ description: "Notification ID to mark as read" }),
      }),
    }
  )
  .post(
    "/welcome",
    async ({ body, set }) => {
      try {
        const { user_id } = body;

        // Check if user exists
        const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
          user_id,
        ]);

        if (userCheck.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "User not found",
            error: "No user found with the provided ID",
          };
        }

        // Create welcome notification
        const notification = await createWelcomeNotification(user_id);

        if (!notification) {
          set.status = 500;
          return {
            success: false,
            message: "Failed to create welcome notification",
            error: "Could not create welcome notification",
          };
        }

        set.status = 201;
        return {
          success: true,
          message: "Welcome notification created successfully",
          data: {
            notification,
          },
        };
      } catch (error) {
        console.error("Error creating welcome notification:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to create welcome notification",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        tags: ["Blog - Notifications"],
        summary: "Create welcome notification",
        description: "Manually create a welcome notification for a user. This endpoint sends a system notification to welcome new users to the platform. It retrieves the admin user and generates a personalized welcome message.",
        responses: {
          "201": {
            description: "Welcome notification created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        notification: { $ref: "#/components/schemas/Notification" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "User not found - The user with the provided ID does not exist, or the admin user could not be found.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "User not found" },
                    error: { type: "string", example: "No user found with the provided ID" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error - Failed to create welcome notification. This may occur if the admin user is not found or database operations fail. Check server logs for details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "Failed to create welcome notification" },
                    error: { type: "string", description: "Detailed error message" },
                  },
                },
              },
            },
          },
        },
      },
      body: t.Object({
        user_id: t.String({
          description: "User ID to create welcome notification for",
        }),
      }),
    }
  );
