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

// Guard that checks if user is authenticated - use this for protecting routes
export const authGuard = (app: Elysia) =>
  app
  .derive(async ({ headers, request }) => {
    // Derive user from token for this route
    const path = new URL(request.url).pathname;
    const authHeader = headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      console.log(`[AuthGuard] ${path}: No token found in Authorization header`);
      return { user: undefined };
    }

    console.log(`[AuthGuard] ${path}: Token found (${token.length} chars), verifying...`);
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      const user = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
        picture: supabaseUser.user_metadata?.avatar_url || '',
        provider: supabaseUser.app_metadata?.provider || 'discord'
      };
      console.log(`[AuthGuard] ${path}: Token verified successfully for user:`, user.id);
      return { user };
    }

    console.log(`[AuthGuard] ${path}: Token verification failed`);
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
