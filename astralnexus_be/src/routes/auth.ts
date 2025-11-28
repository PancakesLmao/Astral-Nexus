import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { Schemas } from "../schemas";

// Simplified authentication routes for Supabase
export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authMiddleware)
  
  // Get current authenticated user - Supabase JWT only
  .get(
    "/me",
    async (context) => {
      try {
        const { user, isAuthenticated, set } = context as any;
        
        if (isAuthenticated && user) {
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
        context.set.status = 500;
        return {
          success: false,
          error: "Internal server error",
        };
      }
    },
    {
      response: {
        200: Schemas.UserResponse,
        401: Schemas.NotAuthenticatedError,
        500: Schemas.InternalServerError,
      },
      detail: {
        tags: ["Authentication"],
        summary: "Get current user",
        description: "Get the currently authenticated user information",
        responses: {
          200: { description: "User retrieved successfully" },
          401: { description: "Not authenticated" },
          500: { description: "Server error" },
        },
      },
    }
  )

  // Logout endpoint - Supabase handles session management
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
      response: {
        200: Schemas.LogoutResponse,
        500: Schemas.LogoutError,
      },
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
  );