import { Elysia, t } from "elysia";
import { db } from "../config/database";
import { stringUtils } from "../utils/helpers";

export const adminRoutes = new Elysia({ prefix: "/admin" })
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
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
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
        id: t.String(),
      }),
    }
  );
