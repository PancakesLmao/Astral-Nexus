import { Elysia, t } from "elysia";
import { db } from "../config/database";

// Utility function to create welcome notification for new users
export async function createWelcomeNotification(userId: string) {
  try {
    // Get admin user ID
    const adminQuery = `
      SELECT u.id FROM users u
      JOIN providers p ON u.provider_id = p.id
      WHERE u.email = 'admin@astralnexus.com' AND p.provider_name = 'admin'
    `;
    const adminResult = await db.query(adminQuery);

    if (adminResult.rows.length === 0) {
      console.error("Admin user not found for welcome notification");
      return null;
    }

    const adminId = adminResult.rows[0].id;

    const welcomeMessage = `Welcome to AstralNexus - your premier destination for gaming content and community discussions!
Take your time to discover the platform. When you're ready, start your journey to support the community
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

export const notificationsRoutes = new Elysia({ prefix: "/api/notifications" })
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const { user_id, page = "1", limit = "10" } = query;

        if (!user_id) {
          set.status = 400;
          return {
            success: false,
            message: "User ID is required",
            error: "Missing user_id parameter",
          };
        }

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
        tags: ["Notifications"],
        summary: "Get user notifications",
        description:
          "Retrieve notifications for a specific user with pagination and filtering options",
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
        tags: ["Notifications"],
        summary: "Create a new notification",
        description: "Create a new notification for a user",
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
  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        const { id } = params;

        const query = `
          DELETE FROM notifications 
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

        return {
          success: true,
          message: "Notification deleted successfully",
          data: {
            deleted_id: result.rows[0].id,
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
        tags: ["Notifications"],
        summary: "Delete a notification",
        description: "Delete a specific notification",
      },
      params: t.Object({
        id: t.String({ description: "Notification ID to delete" }),
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
        tags: ["Notifications"],
        summary: "Create welcome notification",
        description: "Manually create a welcome notification for a user",
      },
      body: t.Object({
        user_id: t.String({
          description: "User ID to create welcome notification for",
        }),
      }),
    }
  );
