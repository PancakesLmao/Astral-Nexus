import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { appConfig } from "../config/app";

// Simplified authentication routes for Supabase
export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authMiddleware)
  
  // Get current authenticated user - works with both Supabase JWT and legacy sessions
  .get(
    "/me",
    async (context) => {
      try {
        // The authMiddleware provides these properties
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
      detail: {
        summary: "Get current user",
        description: "Get the currently authenticated user information",
        tags: ["Authentication"],
      },
    }
  )

  // Logout endpoint - clears legacy sessions if they exist
  .post(
    "/logout",
    async ({ cookie, set }) => {
      try {
        // If there's a legacy session, clear it
        const sessionCookie = cookie['astral_session'];
        if (sessionCookie?.value) {
          // Import deleteSession only if we have a legacy session
          const { deleteSession } = await import("../middleware/auth");
          await deleteSession(sessionCookie.value);
          
          // Clear the cookie
          sessionCookie.set({
            value: '',
            expires: new Date(0),
            domain: appConfig.cookies.session.domain,
            path: '/',
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax'
          });
        }

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
        summary: "Logout",
        description: "Logout and clear session",
        tags: ["Authentication"],
      },
    }
  );