import { Elysia } from "elysia";
import { verifySupabaseToken, extractBearerToken, type SupabaseUser } from "../config/supabase";

declare global {
  namespace Elysia {
    interface Context {
      user?: any;
      isAuthenticated?: boolean;
      authType?: string;
    }
  }
}

// Supabase authentication middleware using Elysia's derive hook
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive(async ({ headers, request }) => {
    try {
      const path = new URL(request.url).pathname;
      // Extract Supabase JWT from Authorization header
      const authHeader = headers.authorization;
      console.log(`[Auth] Route: ${path}, Authorization header present:`, !!authHeader);
      
      const token = extractBearerToken(authHeader);

      // Verify Supabase token
      if (!token) {
        console.log(`[Auth] ${path}: No token found in Authorization header`);
        return {
          user: undefined,
          isAuthenticated: false,
          authType: 'none'
        };
      }

      console.log(`[Auth] ${path}: Token found (${token.length} chars), verifying...`);
      const supabaseUser = await verifySupabaseToken(token);
      
      if (supabaseUser) {
        const user = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
          picture: supabaseUser.user_metadata?.avatar_url || '',
          provider: supabaseUser.app_metadata?.provider || 'discord'
        };

        console.log(`[Auth] ${path}: Token verified successfully for user:`, user.id);
        return {
          user,
          isAuthenticated: true,
          authType: 'supabase'
        };
      }

      console.log(`[Auth] ${path}: Token verification failed`);
      return {
        user: undefined,
        isAuthenticated: false,
        authType: 'none'
      };
    } catch (error) {
      console.log('[Auth] Error during auth:', error);
      return {
        user: undefined,
        isAuthenticated: false,
        authType: 'none'
      };
    }
  });

// Guard that checks if user is authenticated - use this for protecting routes
export const authGuard = (app: Elysia) => 
  app
  .derive(async ({ headers, request }) => {
    // If user hasn't been derived yet (shouldn't happen, but just in case)
    const path = new URL(request.url).pathname;
    const authHeader = headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      return { user: undefined };
    }

    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      const user = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
        picture: supabaseUser.user_metadata?.avatar_url || '',
        provider: supabaseUser.app_metadata?.provider || 'discord'
      };
      return { user };
    }

    return { user: undefined };
  })
  .onBeforeHandle(({ user, set, request }: any) => {
    const path = new URL(request.url).pathname;
    console.log(`[AuthGuard] ${path}: Checking user:`, user ? `authenticated (${user.id})` : 'not authenticated');
    if (!user) {
      console.log(`[AuthGuard] ${path}: Blocking unauthenticated request with 401`);
      set.status = 401;
      return {
        success: false,
        error: "Authentication required",
        message: "You must be signed in to access this resource"
      };
    }
  });

// Middleware that enforces authentication (blocks unauthenticated requests)
export const requireAuthMiddleware = new Elysia({ name: "require-auth" })
  .use(authMiddleware)
  .use(authGuard);
