import { Elysia, t } from "elysia";
import { requireAuthMiddleware } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth";
import { Schemas } from "../schemas";

// Authentication routes for Supabase
export const authRoutes = new Elysia({ prefix: "/api/auth" })
  // Apply optional auth middleware first
  .use(authMiddleware)
  
  // Public endpoints (no auth required)
  .get(
    "/verify",
    async ({ user, set }: any) => {
      try {
        if (user) {
          return {
            success: true,
            user: user,
          };
        } else {
          set.status = 401;
          return { 
            success: false,
            error: "Invalid or no token provided" 
          };
        }
      } catch (error) {
        console.error("Token verification error:", error);
        set.status = 500;
        return { error: "Internal server error" };
      }
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "Verify Token",
        description: "Verifies the provided authentication token and returns user information if valid",
        responses: {
          200: { description: "Token verified successfully" },
          401: { description: "Invalid or no token provided" },
          500: { description: "Server error" },
        },
      },
    }
  )
  
  .post(
    "/logout",
    async ({ set }) => {
      try {
        // Supabase handles logout client-side via supabase.auth.signOut()
        // This endpoint exists for API consistency
        return {
          success: true,
          message: "Logged out successfully",
        };
      } catch (error) {
        console.error("Logout error:", error);
        set.status = 500;
        return {
          success: false,
          error: "Logout failed",
        };
      }
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "Logout",
        description: "Logout endpoint (Supabase handles session client-side)",
        responses: {
          200: { description: "Logged out successfully" },
          500: { description: "Server error" },
        },
      },
    }
  )
  
  // Apply strict auth middleware for protected endpoints
  .use(requireAuthMiddleware)
  
  .get(
    "/me",
    async ({ user, set }: any) => {
      try {
        if (user) {
          return {
            success: true,
            user: user,
          };
        } else {
          set.status = 401;
          return {
            success: false,
            error: "Not authenticated",
          };
        }
      } catch (error) {
        console.error("Auth check error:", error);
        set.status = 500;
        return {
          success: false,
          error: "Internal server error",
        };
      }
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "Get current user",
        description: "Get the currently authenticated user information (requires valid token)",
        responses: {
          200: { description: "User retrieved successfully" },
          401: { description: "Not authenticated" },
          500: { description: "Server error" },
        },
      },
    }
  );