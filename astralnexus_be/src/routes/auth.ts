import { Elysia, t } from "elysia";
import { oauth2 } from "elysia-oauth2";
import { sessions } from "../middleware/auth";
import { appConfig } from "../config/app";

// Authentication routes
export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    oauth2({
      Google: [
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        process.env.GOOGLE_REDIRECT_URI!,
      ],
      Discord: [
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_CLIENT_SECRET!,
        process.env.DISCORD_REDIRECT_URI!,
      ],
    })
  )
  // Google OAuth2.0 login
  .get(
    "/google",
    ({ oauth2 }: { oauth2: any }) => {
      return oauth2.redirect("Google", ["openid", "profile", "email"]);
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Google OAuth login",
        description: "Initiate Google OAuth2.0 authentication flow",
      },
    }
  )

  // Google OAuth2.0 callback
  .get(
    "/google/callback",
    async ({ oauth2, set, query }: { oauth2: any; set: any; query: any }) => {
      try {
        // Check if user denied authorization
        if (query.error === "access_denied") {
          console.log("User denied Google OAuth authorization");
          const errorUrl =
            process.env.FRONTEND_ERROR_REDIRECT ||
            "http://localtest.me:3000/login?error=access_denied";
          return new Response(null, {
            status: 302,
            headers: {
              Location: errorUrl,
            },
          });
        }

        const tokens = await oauth2.authorize("Google");
        const accessToken = tokens.accessToken();

        // Fetch user info from Google
        const userResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user info");
        }

        const googleUser = await userResponse.json();

        // Create user session
        const sessionId =
          Math.random().toString(36).substring(2) + Date.now().toString(36);
        const user = {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          provider: "google",
        };

        sessions.set(sessionId, { userId: googleUser.id, user });

        // Set session cookie using centralized config
        set.cookie = {
          [appConfig.cookies.session.name]: {
            value: sessionId,
            ...appConfig.cookies.session,
          },
        };

        // Redirect to frontend success page with session ID
        const redirectUrl =
          process.env.FRONTEND_SUCCESS_REDIRECT ||
          "http://localtest.me:3000/dashboard";
        const redirectWithSession = `${redirectUrl}?session=${sessionId}`;
        console.log("Redirecting to:", redirectWithSession);
        console.log("Session cookie set:", sessionId);

        // Use Elysia's redirect
        set.status = 302;
        set.headers["Location"] = redirectWithSession;
        return;
      } catch (error) {
        console.error("OAuth callback error:", error);
        const errorUrl =
          process.env.FRONTEND_ERROR_REDIRECT ||
          "http://localtest.me:3000/login?error=oauth_failed";
        return new Response(null, {
          status: 302,
          headers: {
            Location: errorUrl,
          },
        });
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Google OAuth callback",
        description:
          "Handle Google OAuth2.0 callback and complete authentication",
      },
    }
  )

  // Discord OAuth2.0 login
  .get(
    "/discord",
    ({ oauth2 }: { oauth2: any }) => {
      return oauth2.redirect("Discord", ["identify", "email"]);
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Discord OAuth login",
        description: "Initiate Discord OAuth2.0 authentication flow",
      },
    }
  )

  // Discord OAuth2.0 callback
  .get(
    "/discord/callback",
    async ({ oauth2, set, query }: { oauth2: any; set: any; query: any }) => {
      try {
        // Check if user denied authorization
        if (query.error === "access_denied") {
          console.log("User denied Discord OAuth authorization");
          const errorUrl =
            process.env.FRONTEND_ERROR_REDIRECT ||
            "http://localtest.me:3000/login?error=access_denied";
          return new Response(null, {
            status: 302,
            headers: {
              Location: errorUrl,
            },
          });
        }

        const tokens = await oauth2.authorize("Discord");
        const accessToken = tokens.accessToken();

        // Fetch user info from Discord
        const userResponse = await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch Discord user info");
        }

        const discordUser = await userResponse.json();

        // Create user session
        const sessionId =
          Math.random().toString(36).substring(2) + Date.now().toString(36);
        const user = {
          id: discordUser.id,
          email: discordUser.email,
          name: discordUser.global_name || discordUser.username,
          username: discordUser.username,
          picture: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${
                discordUser.discriminator % 5
              }.png`,
          provider: "discord",
        };

        sessions.set(sessionId, { userId: discordUser.id, user });

        // Set session cookie using centralized config
        set.cookie = {
          [appConfig.cookies.session.name]: {
            value: sessionId,
            ...appConfig.cookies.session,
          },
        };

        // Redirect to frontend success page with session ID
        const redirectUrl =
          process.env.FRONTEND_SUCCESS_REDIRECT ||
          "http://localtest.me:3000/dashboard";
        const redirectWithSession = `${redirectUrl}?session=${sessionId}`;
        console.log("Redirecting to:", redirectWithSession);
        console.log("Session cookie set:", sessionId);

        // Use Elysia's redirect
        set.status = 302;
        set.headers["Location"] = redirectWithSession;
        return;
      } catch (error) {
        console.error("Discord OAuth callback error:", error);
        const errorUrl =
          process.env.FRONTEND_ERROR_REDIRECT ||
          "http://localtest.me:3000/login?error=oauth_failed";
        return new Response(null, {
          status: 302,
          headers: {
            Location: errorUrl,
          },
        });
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Discord OAuth callback",
        description:
          "Handle Discord OAuth2.0 callback and complete authentication",
      },
    }
  )

  // Get current user
  .get(
    "/me",
    ({ headers, set }: { headers: any; set: any }) => {
      const cookieName = appConfig.cookies.session.name;
      console.log("=== /auth/me Debug Info ===");
      console.log("Cookie name:", cookieName);
      console.log("Raw cookies:", headers.cookie);
      console.log("Authorization header:", headers.authorization);
      console.log("X-Session-ID header:", headers["x-session-id"]);

      // Try to get session ID from multiple sources
      let sessionId = null;

      // 1. Try from cookies first
      if (headers.cookie) {
        sessionId = headers.cookie.match(
          new RegExp(`${cookieName}=([^;]+)`)
        )?.[1];
      }

      // 2. Try from Authorization header (Bearer token)
      if (!sessionId && headers.authorization) {
        const authMatch = headers.authorization.match(/^Bearer (.+)$/);
        if (authMatch) {
          sessionId = authMatch[1];
        }
      }

      // 3. Try from X-Session-ID header
      if (!sessionId && headers["x-session-id"]) {
        sessionId = headers["x-session-id"];
      }

      console.log("Final extracted sessionId:", sessionId);

      if (!sessionId) {
        set.status = 401;
        console.log("No session ID found in any location");
        return { error: "No session found" };
      }

      const session = sessions.get(sessionId);
      console.log("Session from store:", session);

      if (!session) {
        set.status = 401;
        console.log("Session not found in store for ID:", sessionId);
        return { error: "Invalid session" };
      }

      console.log("Session found, returning user:", session.user);
      return { user: session.user };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Get currently authenticated user information",
      },
    }
  )
  .post(
    "/logout",
    ({ headers, set }: { headers: any; set: any }) => {
      const cookieName = appConfig.cookies.session.name;

      // Try to get session ID from multiple sources (same logic as /me)
      let sessionId = null;

      if (headers.cookie) {
        sessionId = headers.cookie.match(
          new RegExp(`${cookieName}=([^;]+)`)
        )?.[1];
      }

      if (!sessionId && headers.authorization) {
        const authMatch = headers.authorization.match(/^Bearer (.+)$/);
        if (authMatch) {
          sessionId = authMatch[1];
        }
      }

      if (!sessionId && headers["x-session-id"]) {
        sessionId = headers["x-session-id"];
      }

      if (sessionId) {
        sessions.delete(sessionId);
      }

      // Clear session cookie using centralized config
      set.cookie = {
        [cookieName]: {
          value: "",
          ...appConfig.cookies.session,
          maxAge: 0, // Expire immediately
        },
      };

      return { success: true, message: "Logged out successfully" };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "User logout",
        description: "Logout current user session and clear cookies",
      },
    }
  )

  // Set user language preference
  .post(
    "/language",
    ({ body, set }: { body: any; set: any }) => {
      const { language } = body;

      if (!language || !["en", "es", "fr", "de", "zh"].includes(language)) {
        set.status = 400;
        return { error: "Invalid language. Supported: en, es, fr, de, zh" };
      }

      // Set language preference cookie using centralized config
      set.cookie = {
        [appConfig.cookies.preferences.name]: {
          value: language,
          ...appConfig.cookies.preferences,
        },
      };

      return { success: true, language, message: "Language preference saved" };
    },
    {
      body: t.Object({
        language: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Set user language preference",
        description: "Set user language preference via cookie",
      },
    }
  )

  // Test endpoint for development - simulates successful OAuth login
  .get(
    "/test-login",
    ({ set }: { set: any }) => {
      // Create test user session
      const sessionId =
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      const user = {
        id: "test-user-123",
        email: "test@example.com",
        name: "Test User",
        picture: "https://via.placeholder.com/150",
        provider: "test",
      };

      sessions.set(sessionId, { userId: "test-user-123", user });

      // Set session cookie using centralized config
      set.cookie = {
        [appConfig.cookies.session.name]: {
          value: sessionId,
          ...appConfig.cookies.session,
        },
      };

      // Redirect to frontend dashboard with session ID
      const redirectUrl = "http://localtest.me:3000/dashboard";
      const redirectWithSession = `${redirectUrl}?session=${sessionId}`;
      console.log("Test login - redirecting to:", redirectWithSession);
      console.log("Test login - session cookie set:", sessionId);

      // Use Elysia's redirect
      set.status = 302;
      set.headers["Location"] = redirectWithSession;
      return;
    },
    {
      detail: {
        tags: ["Auth", "Development"],
        summary: "Test login endpoint (development only)",
        description: "Simulates a successful OAuth login for testing purposes",
      },
    }
  );
// DELETE WHEN COMPLETE SIGN-IN
