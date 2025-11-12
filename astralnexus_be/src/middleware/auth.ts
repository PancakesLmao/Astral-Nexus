import { Elysia } from "elysia";
import { queryOne, query } from "../utils/database";
import { verifySupabaseToken, extractBearerToken, type SupabaseUser } from "../config/supabase";

// Hybrid authentication middleware - supports both legacy sessions and Supabase JWT
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive(async ({ headers, cookie }) => {
    try {
      // Extract session ID from Authorization header or cookie
      let sessionId: string | null = null;
      let supabaseToken: string | null = null;

      // Check Authorization header (Bearer token) - could be legacy session or Supabase JWT
      const authHeader = headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        
        // Try to determine if it's a Supabase JWT (starts with 'ey' and has 3 parts)
        if (token.startsWith('ey') && token.split('.').length === 3) {
          supabaseToken = token;
        } else {
          sessionId = token;
        }
      }

      // Check X-Session-ID header for legacy sessions
      const sessionHeader = headers["x-session-id"];
      if (sessionHeader && !sessionId && !supabaseToken) {
        sessionId = sessionHeader;
      }

      // Check cookie as fallback for legacy sessions
      const cookieName = "astral_session";
      if (!sessionId && !supabaseToken && cookie && cookie[cookieName]?.value) {
        sessionId = cookie[cookieName].value;
      }

      // Only log debug info for auth endpoints, not all requests
      if (headers["x-debug-auth"]) {
        console.log("=== Auth Debug Info ===");
        console.log("Cookie name:", cookieName);
        console.log("Raw cookies:", headers.cookie);
        console.log("Authorization header:", authHeader);
        console.log("X-Session-ID header:", sessionHeader);
        console.log("Final extracted sessionId:", sessionId);
        console.log("Supabase token detected:", !!supabaseToken);
      }

      // Try Supabase authentication first
      if (supabaseToken) {
        const supabaseUser = await verifySupabaseToken(supabaseToken);
        
        if (supabaseUser) {
          const user = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
            picture: supabaseUser.user_metadata?.avatar_url || '',
            provider: 'discord'
          };

          if (headers["x-debug-auth"]) {
            console.log("Supabase user authenticated:", user);
          }

          return {
            user,
            isAuthenticated: true,
            sessionId: null,
            supabaseUser,
            authType: 'supabase'
          };
        }
      }

      // Fall back to legacy session authentication
      if (!sessionId) {
        return {
          user: null,
          isAuthenticated: false,
          sessionId: null,
          authType: 'none'
        };
      }

      // Get session from database (legacy)
      const sessionQuery = `
        SELECT s.*, u.id as user_id, u.email, u.name, u.picture, p.provider_name
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        JOIN providers p ON u.provider_id = p.id
        WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP
      `;

      const session = await queryOne(sessionQuery, [sessionId]);

      // Only log session info when debug header is present
      if (headers["x-debug-auth"]) {
        console.log(
          "Legacy session from store:",
          session
            ? {
                userId: session.user_id,
                user: {
                  id: session.user_id,
                  email: session.email,
                  name: session.name,
                  picture: session.picture,
                  provider: session.provider_name,
                },
              }
            : null
        );
      }

      if (!session) {
        return {
          user: null,
          isAuthenticated: false,
          sessionId: null,
          authType: 'none'
        };
      }

      const user = {
        id: session.user_id,
        email: session.email,
        name: session.name,
        picture: session.picture,
        provider: session.provider_name,
      };

      if (headers["x-debug-auth"]) {
        console.log("Legacy session found, returning user:", user);
      }

      return {
        user,
        isAuthenticated: true,
        sessionId,
        authType: 'legacy',
        session: {
          id: session.id,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at,
        },
      };
    } catch (error) {
      console.error("Auth middleware error:", error);
      return {
        user: null,
        isAuthenticated: false,
        sessionId: null,
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

// Utility functions for session management
export const createSession = async (
  userId: string,
  accessToken: string,
  refreshToken?: string,
  expiresIn = 24 * 60 * 60
) => {
  const sessionId =
    Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  await query(
    `INSERT INTO sessions (id, user_id, access_token, refresh_token, expires_at) 
     VALUES ($1, $2, $3, $4, $5)`,
    [sessionId, userId, accessToken, refreshToken || null, expiresAt]
  );

  return sessionId;
};

export const deleteSession = async (sessionId: string) => {
  await query("DELETE FROM sessions WHERE id = $1", [sessionId]);
};

export const refreshSession = async (
  sessionId: string,
  newAccessToken: string,
  expiresIn = 24 * 60 * 60
) => {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  await query(
    "UPDATE sessions SET access_token = $1, expires_at = $2 WHERE id = $3",
    [newAccessToken, expiresAt, sessionId]
  );
};

// Clean up expired sessions (call this periodically)
export const cleanupExpiredSessions = async () => {
  await query("DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP");
};
