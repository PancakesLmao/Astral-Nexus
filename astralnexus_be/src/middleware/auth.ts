import { Elysia } from "elysia";
import { verifySupabaseToken, extractBearerToken, type SupabaseUser } from "../config/supabase";

// Supabase authentication middleware using Elysia's derive hook
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive(async ({ headers }) => {
    try {
      // Extract Supabase JWT from Authorization header
      const authHeader = headers.authorization;
      const token = extractBearerToken(authHeader);

      // Verify Supabase token
      if (!token) {
        return {
          user: null,
          isAuthenticated: false,
          authType: 'none'
        };
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

        return {
          user,
          isAuthenticated: true,
          authType: 'supabase'
        };
      }

      return {
        user: null,
        isAuthenticated: false,
        authType: 'none'
      };
    } catch (error) {
      return {
        user: null,
        isAuthenticated: false,
        authType: 'none'
      };
    }
  })
  .macro(({ onBeforeHandle }) => ({
    requireAuth(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Authentication required" };
        }
      });
    },
  }));
