import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth";
import { Schemas } from "../schemas";

// Authentication routes for Supabase
export const authRoutes = new Elysia({ prefix: "/api/auth" })
  
  // Public endpoints (no auth required)
  .get(
    "/verify",
    async ({ headers, set }: any) => {
      try {
        // Manual token verification for public endpoint
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          set.status = 401;
          return { 
            success: false,
            error: "Invalid or no token provided" 
          };
        }

        const token = authHeader.substring(7);
        // Import and use verifySupabaseToken directly
        const { verifySupabaseToken } = await import("../config/supabase");
        const supabaseUser = await verifySupabaseToken(token);
        
        if (supabaseUser) {
          // Use Supabase UUID directly as the user ID (no database lookup needed)
          const user = {
            id: supabaseUser.id, // Supabase UUID is now the primary ID
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
            picture: supabaseUser.user_metadata?.avatar_url || '',
            provider: supabaseUser.app_metadata?.provider || 'discord'
          };
          
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
  
  // Protected endpoints (require auth)
  .use(authGuard)
  
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