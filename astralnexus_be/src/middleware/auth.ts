import { Elysia } from "elysia";

// In-memory session store (should match the one in auth.ts)
// In production, use a shared store like Redis
const sessions = new Map<string, { userId: string; user: any }>();

// Authentication middleware
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive(({ headers }) => {
    const sessionId = headers.cookie?.match(/session=([^;]+)/)?.[1];
    const session = sessionId ? sessions.get(sessionId) : null;

    return {
      user: session?.user || null,
      isAuthenticated: !!session,
      sessionId: sessionId || null,
    };
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

// Export sessions for sharing with auth routes
export { sessions };
