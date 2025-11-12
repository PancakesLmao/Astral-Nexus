import { Elysia, t } from "elysia";
import {
  verifySupabaseToken,
  extractBearerToken,
  type SupabaseUser,
} from "../config/supabase";

// Supabase Authentication routes
export const supabaseAuthRoutes = new Elysia({ prefix: "/auth/supabase" })
  // Verify token endpoint
  .get("/verify", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      const token = extractBearerToken(authHeader);

      if (!token) {
        set.status = 401;
        return { error: "No token provided" };
      }

      const user = await verifySupabaseToken(token);

      if (!user) {
        set.status = 401;
        return { error: "Invalid token" };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          picture: user.user_metadata?.avatar_url || "",
          provider: user.app_metadata?.provider || "discord",
        },
      };
    } catch (error) {
      console.error("Token verification error:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  })

  // Get current user info
  .get("/me", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      const token = extractBearerToken(authHeader);

      if (!token) {
        set.status = 401;
        return { error: "Authentication required" };
      }

      const user = await verifySupabaseToken(token);

      if (!user) {
        set.status = 401;
        return { error: "Invalid or expired token" };
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          picture: user.user_metadata?.avatar_url || "",
          provider: user.app_metadata?.provider || "discord",
        },
      };
    } catch (error) {
      console.error("Get user error:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  });

// Supabase Auth Middleware
export const supabaseAuthMiddleware = () => {
  return new Elysia().derive(async ({ headers }) => {
    const authHeader = headers.authorization;
    const token = extractBearerToken(authHeader);

    let user: SupabaseUser | null = null;

    if (token) {
      try {
        user = await verifySupabaseToken(token);
      } catch (error) {
        console.error("Auth middleware error:", error);
      }
    }

    return {
      user,
      isAuthenticated: !!user,
      token,
    };
  });
};

// Protected route middleware - requires authentication
export const requireAuth = () => {
  return new Elysia()
    .use(supabaseAuthMiddleware())
    .onBeforeHandle((context: any) => {
      if (!context.user) {
        context.set.status = 401;
        return { error: "Authentication required" };
      }
    });
};
