import { Elysia, t } from "elysia";
import {
  verifySupabaseToken,
  extractBearerToken,
  type SupabaseUser,
} from "../config/supabase";

// Response schemas
const UserResponseSchema = t.Object({
  id: t.String(),
  email: t.Optional(t.String()),
  name: t.String(),
  picture: t.String(),
  provider: t.String(),
});

const VerifyTokenResponseSchema = t.Object({
  success: t.Boolean(),
  user: UserResponseSchema,
});

const GetMeResponseSchema = t.Object({
  user: UserResponseSchema,
});

const ErrorResponseSchema = t.Object({
  error: t.String(),
});

// Supabase Authentication routes
export const supabaseAuthRoutes = new Elysia({ prefix: "/auth/supabase" })
  // Verify token endpoint
  .get(
    "/verify",
    async ({ headers, set }) => {
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
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "Verify Supabase Token",
        description: "Verifies the provided Supabase authentication token and returns user information if valid",
        responses: {
          200: {
            description: "Token verified successfully",
            content: {
              "application/json": {
                schema: VerifyTokenResponseSchema,
              },
            },
          },
          401: {
            description: "Unauthorized - No token provided or token is invalid",
            content: {
              "application/json": {
                schema: ErrorResponseSchema,
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: ErrorResponseSchema,
              },
            },
          },
        },
      },
      response: {
        200: VerifyTokenResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    }
  )

  // Get current user info
  .get(
    "/me",
    async ({ headers, set }) => {
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
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "Get Current User Information",
        description: "Retrieves the current authenticated user's information from the token in the Authorization header",
        responses: {
          200: {
            description: "Successfully retrieved current user information",
            content: {
              "application/json": {
                schema: GetMeResponseSchema,
              },
            },
          },
          401: {
            description: "Unauthorized - Authentication required or token is invalid/expired",
            content: {
              "application/json": {
                schema: ErrorResponseSchema,
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: ErrorResponseSchema,
              },
            },
          },
        },
      },
      response: {
        200: GetMeResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    }
  );

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
