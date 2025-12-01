import { Elysia, t } from "elysia";
import { db } from "../config/database";
import { stringUtils } from "../utils/helpers";
import { Schemas } from "../schemas";

// Admin-specific response schemas
const AdminInfo = t.Object(
  {
    id: t.String({ description: "Administrator ID", format: "uuid" }),
    email: t.String({ description: "Administrator email", format: "email" }),
    name: t.String({ description: "Administrator name" }),
    role: t.String({ description: "Administrator role" }),
  },
  { description: "Administrator information" }
);

const AdminLoginResponse = t.Object(
  {
    success: t.Literal(true),
    message: t.String(),
    admin: AdminInfo,
  },
  { description: "Successful admin login response" }
);

const AdminMeResponse = t.Object(
  {
    success: t.Literal(true),
    admin: t.Object(
      {
        id: t.String({ format: "uuid" }),
        email: t.String({ format: "email" }),
        name: t.String(),
        role: t.String(),
        expiresAt: t.String({ format: "date-time" }),
      },
      { description: "Current admin session info" }
    ),
  },
  { description: "Current admin session information" }
);

const DashboardStats = t.Object(
  {
    success: t.Literal(true),
    stats: t.Object(
      {
        totalUsers: t.Number({ minimum: 0, int: true }),
        totalPosts: t.Number({ minimum: 0, int: true }),
        totalComments: t.Number({ minimum: 0, int: true }),
      },
      { description: "Dashboard statistics" }
    ),
  },
  { description: "Admin dashboard statistics response" }
);

const AdminUserItem = t.Object(
  {
    id: t.String({ format: "uuid" }),
    email: t.String({ format: "email" }),
    name: t.String(),
    picture: t.Optional(t.String()),
    provider: t.String(),
    createdAt: t.String({ format: "date-time" }),
  },
  { description: "User item for admin listing" }
);

const AdminUsersResponse = t.Object(
  {
    success: t.Literal(true),
    data: t.Object(
      {
        users: t.Array(AdminUserItem),
        pagination: Schemas.Pagination,
      },
      { description: "Users list with pagination" }
    ),
  },
  { description: "Admin users list response" }
);

const UnauthorizedError = t.Object(
  {
    success: t.Literal(false),
    message: t.String(),
  },
  { description: "Unauthorized error (401)" }
);

const InternalServerError = t.Object(
  {
    success: t.Literal(false),
    message: t.String(),
  },
  { description: "Internal server error (500)" }
);

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  // Admin login endpoint
  .post(
    "/login",
    async ({ body, set, cookie: { adminSession } }) => {
      try {
        const { email, password } = body;

        // Find administrator by email
        const adminQuery = `
        SELECT id, email, name, password_hash, role, is_active
        FROM administrators
        WHERE email = $1 AND is_active = true
      `;
        const adminResult = await db.query(adminQuery, [email]);

        if (adminResult.rows.length === 0) {
          set.status = 401;
          return {
            success: false,
            message: "Invalid email or password",
          };
        }

        const admin = adminResult.rows[0];

        // Simple password verification (since its not using hashing)
        if (password !== admin.password_hash) {
          set.status = 401;
          return {
            success: false,
            message: "Invalid email or password",
          };
        }

        // Create admin session
        const sessionId = stringUtils.generateId(32);
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

        const sessionQuery = `
        INSERT INTO admin_sessions (id, admin_id, expires_at, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `;
        await db.query(sessionQuery, [sessionId, admin.id, expiresAt]);

        // Set session cookie
        adminSession.set({
          value: sessionId,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 8 * 60 * 60, // 8 hours
        });

        return {
          success: true,
          message: "Login successful",
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
        };
      } catch (error) {
        console.error("Admin login error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email", description: "Administrator email address" }),
        password: t.String({ minLength: 1, description: "Administrator password" }),
      }),
      response: {
        200: AdminLoginResponse,
        401: UnauthorizedError,
        500: InternalServerError,
      },
      detail: {
        tags: ["Admin"],
        summary: "Admin login",
        description: "Authenticate an administrator with email and password. Returns session cookie.",
      },
    }
  )

  // Admin logout endpoint
  .post("/logout", async ({ cookie: { adminSession }, set }) => {
    try {
      const sessionId = adminSession.value;

      if (sessionId) {
        // Delete session from database
        await db.query("DELETE FROM admin_sessions WHERE id = $1", [sessionId]);

        // Clear session cookie
        adminSession.remove();
      }

      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      console.error("Admin logout error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }, {
    response: {
      200: t.Object({
        success: t.Literal(true),
        message: t.String(),
      }),
      500: InternalServerError,
    },
    detail: {
      tags: ["Admin"],
      summary: "Admin logout",
      description: "Logout the current administrator by clearing the session cookie and removing the session from database.",
    },
  })

  // Get current admin session info
  .get("/me", async ({ cookie: { adminSession }, set }) => {
    try {
      const sessionId = adminSession.value;

      if (!sessionId) {
        set.status = 401;
        return {
          success: false,
          message: "Not authenticated",
        };
      }

      // Validate session and get admin info
      const sessionQuery = `
        SELECT a.id, a.email, a.name, a.role, s.expires_at
        FROM administrators a
        INNER JOIN admin_sessions s ON a.id = s.admin_id
        WHERE s.id = $1 AND s.expires_at > NOW() AND a.is_active = true
      `;
      const sessionResult = await db.query(sessionQuery, [sessionId]);

      if (sessionResult.rows.length === 0) {
        // Invalid or expired session
        adminSession.remove();
        set.status = 401;
        return {
          success: false,
          message: "Session expired",
        };
      }

      const admin = sessionResult.rows[0];

      return {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          expiresAt: admin.expires_at,
        },
      };
    } catch (error) {
      console.error("Admin session check error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }, {
    response: {
      200: AdminMeResponse,
      401: UnauthorizedError,
      500: InternalServerError,
    },
    detail: {
      tags: ["Admin"],
      summary: "Get current admin session",
      description: "Retrieve current authenticated administrator information and session details. Requires valid admin session cookie.",
    },
  })

  // Admin dashboard stats (requires authentication)
  .get("/dashboard/stats", async ({ cookie: { adminSession }, set }) => {
    try {
      const sessionId = adminSession.value;

      if (!sessionId) {
        set.status = 401;
        return {
          success: false,
          message: "Not authenticated",
        };
      }

      // Validate admin session
      const adminCheck = await db.query(
        `
        SELECT a.id FROM administrators a
        INNER JOIN admin_sessions s ON a.id = s.admin_id
        WHERE s.id = $1 AND s.expires_at > NOW() AND a.is_active = true
      `,
        [sessionId]
      );

      if (adminCheck.rows.length === 0) {
        adminSession.remove();
        set.status = 401;
        return {
          success: false,
          message: "Session expired",
        };
      }

      const [usersCount, postsCount, commentsCount] = await Promise.all([
        db.query("SELECT COUNT(*) as count FROM users"),
        db.query("SELECT COUNT(*) as count FROM posts"),
        db.query("SELECT COUNT(*) as count FROM comments"),
      ]);

      return {
        success: true,
        stats: {
          totalUsers: parseInt(usersCount.rows[0].count),
          totalPosts: parseInt(postsCount.rows[0].count),
          totalComments: parseInt(commentsCount.rows[0].count),
        },
      };
    } catch (error) {
      console.error("Admin dashboard stats error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }, {
    response: {
      200: DashboardStats,
      401: UnauthorizedError,
      500: InternalServerError,
    },
    detail: {
      tags: ["Admin"],
      summary: "Get dashboard statistics",
      description: "Retrieve overall dashboard statistics including total users, posts, and comments. Requires admin authentication.",
    },
  })

  // Get all users (admin only)
  .get("/users", async ({ cookie: { adminSession }, set, query }) => {
    try {
      const sessionId = adminSession.value;

      if (!sessionId) {
        set.status = 401;
        return {
          success: false,
          message: "Not authenticated",
        };
      }

      // Validate admin session
      const adminCheck = await db.query(
        `
        SELECT a.id FROM administrators a
        INNER JOIN admin_sessions s ON a.id = s.admin_id
        WHERE s.id = $1 AND s.expires_at > NOW() AND a.is_active = true
      `,
        [sessionId]
      );

      if (adminCheck.rows.length === 0) {
        adminSession.remove();
        set.status = 401;
        return {
          success: false,
          message: "Session expired",
        };
      }

      const { page = "1", limit = "100" } = query as {
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
          u.created_at
        FROM users u
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
      console.error("Admin get users error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String({ description: "Page number (default: 1)" })),
      limit: t.Optional(t.String({ description: "Items per page (default: 100)" })),
    }),
    response: {
      200: AdminUsersResponse,
      401: UnauthorizedError,
      500: InternalServerError,
    },
    detail: {
      tags: ["Admin"],
      summary: "List all users",
      description: "Retrieve a paginated list of all users in the system. Requires admin authentication.",
    },
  })

  // Delete post endpoint (admin only)
  .delete(
    "/posts/:id",
    async ({ params, cookie: { adminSession }, set }) => {
      try {
        const sessionId = adminSession.value;
        const { id: postId } = params;

        if (!sessionId) {
          set.status = 401;
          return {
            success: false,
            message: "Not authenticated",
          };
        }

        // Validate admin session
        const adminCheck = await db.query(
          `
        SELECT a.id FROM administrators a
        INNER JOIN admin_sessions s ON a.id = s.admin_id
        WHERE s.id = $1 AND s.expires_at > NOW() AND a.is_active = true
      `,
          [sessionId]
        );

        if (adminCheck.rows.length === 0) {
          adminSession.remove();
          set.status = 401;
          return {
            success: false,
            message: "Session expired",
          };
        }

        // Check if post exists
        const postCheck = await db.query("SELECT id FROM posts WHERE id = $1", [
          postId,
        ]);
        if (postCheck.rows.length === 0) {
          set.status = 404;
          return {
            success: false,
            message: "Post not found",
          };
        }

        // Delete post (cascading deletes will handle related records)
        await db.query("DELETE FROM posts WHERE id = $1", [postId]);

        return {
          success: true,
          message: "Post deleted successfully",
        };
      } catch (error) {
        console.error("Admin delete post error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Internal server error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid", description: "Post ID to delete" }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
          message: t.String(),
        }),
        401: UnauthorizedError,
        404: t.Object({
          success: t.Literal(false),
          message: t.String(),
        }),
        500: InternalServerError,
      },
      detail: {
        tags: ["Admin"],
        summary: "Delete a post",
        description: "Delete a post by ID. Cascading deletes will remove related comments and likes. Requires admin authentication.",
      },
    }
  );
