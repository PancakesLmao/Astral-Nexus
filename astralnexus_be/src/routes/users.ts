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
            u.updated_at,
            p.provider_name
          FROM users u
          JOIN providers p ON u.provider_id = p.id
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
            provider: user.provider_name,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
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
              createdAt: user.created_at,
              updatedAt: user.updated_at,
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
  .get(
    "/stats/:id",
    async ({ params: { id }, set }) => {
      try {
        // Get user posts count
        const postsCountQuery = `
          SELECT COUNT(*) as posts_count
          FROM posts
          WHERE author_id = $1
        `;

        const postsResult = await db.query(postsCountQuery, [id]);
        const postsCount = parseInt(postsResult.rows[0].posts_count) || 0;

        // Get user comments count
        const commentsCountQuery = `
          SELECT COUNT(*) as comments_count
          FROM comments
          WHERE author_id = $1
        `;

        const commentsResult = await db.query(commentsCountQuery, [id]);
        const commentsCount =
          parseInt(commentsResult.rows[0].comments_count) || 0;

        // Get user notifications count
        const notificationsCountQuery = `
          SELECT COUNT(*) as notifications_count
          FROM notifications
          WHERE user_id = $1
        `;

        const notificationsResult = await db.query(notificationsCountQuery, [
          id,
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
  );
