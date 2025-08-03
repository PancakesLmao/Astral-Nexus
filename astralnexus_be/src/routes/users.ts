import { Elysia, t } from "elysia";
import { appConfig } from "../config/app";
import { db } from "../config/database";

// User management routes
export const userRoutes = new Elysia({ prefix: "/users" })
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
      detail: {
        tags: ["Users"],
        summary: "Get user profile",
        description: "Get user profile by ID",
      },
    }
  )
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
      detail: {
        tags: ["Users"],
        summary: "Update user profile",
        description: "Update user profile information",
      },
    }
  )
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const { page = "1", limit = "10" } = query as {
          page?: string;
          limit?: string;
        };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users`;
        const countResult = await db.query(countQuery);
        const total = parseInt(countResult.rows[0]?.total || "0");

        // Get users with pagination
        const usersQuery = `
          SELECT 
            u.id,
            u.email,
            u.name,
            u.picture,
            u.created_at,
            p.provider_name
          FROM users u
          JOIN providers p ON u.provider_id = p.id
          ORDER BY u.created_at DESC
          LIMIT $1 OFFSET $2
        `;

        const result = await db.query(usersQuery, [limitNum, offset]);
        const totalPages = Math.ceil(total / limitNum);

        return {
          success: true,
          data: {
            users: result.rows.map((user) => ({
              id: user.id,
              email: user.email,
              name: user.name,
              picture: user.picture,
              provider: user.provider_name,
              createdAt: user.created_at,
            })),
            pagination: {
              page: pageNum,
              limit: limitNum,
              total,
              totalPages,
              hasNext: pageNum < totalPages,
              hasPrev: pageNum > 1,
            },
          },
        };
      } catch (error) {
        console.error("Error fetching users:", error);
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch users",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Users"],
        summary: "Get users list",
        description: "Get paginated list of users",
      },
    }
  );
