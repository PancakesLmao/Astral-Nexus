import { Elysia, t } from "elysia";
import { oauth2 } from "elysia-oauth2";
import {
  createSession,
  deleteSession,
  authMiddleware,
} from "../middleware/auth";
import { findOrCreateUser } from "../utils/user";
import { appConfig } from "../config/app";

// Authentication routes
export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    oauth2({
      Discord: [
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_CLIENT_SECRET!,
        process.env.DISCORD_REDIRECT_URI!,
      ],
    })
  )

  // Discord OAuth2.0 login (Manual implementation)
  .get(
    "/discord",
    async ({ query, set }: { query: any; set: any }) => {
      // Store language preference in state parameter for OAuth flow
      const language = query.lang || "en";
      console.log("Discord OAuth initiated with language:", language);

      // Generate state and PKCE parameters manually
      const state =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Generate a proper PKCE code verifier (43-128 characters, base64url)
      const codeVerifierArray = new Uint8Array(32);
      crypto.getRandomValues(codeVerifierArray);
      const codeVerifier = btoa(String.fromCharCode(...codeVerifierArray))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      // Create code challenge for PKCE using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = new Uint8Array(hashBuffer);
      const codeChallenge = btoa(String.fromCharCode(...hashArray))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      console.log("Generated OAuth state:", state);
      console.log("Generated code verifier:", codeVerifier);
      console.log("Generated code challenge:", codeChallenge);

      // Set cookies with our domain configuration
      set.cookie = {
        discord_state: {
          value: state,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as "lax",
          maxAge: 10 * 60 * 1000, // 10 minutes
          path: "/",
          domain: ".localtest.me", // Ensure same domain as other cookies
        },
        discord_code_verifier: {
          value: codeVerifier,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as "lax",
          maxAge: 10 * 60 * 1000, // 10 minutes
          path: "/",
          domain: ".localtest.me", // Ensure same domain as other cookies
        },
      };

      // Build Discord OAuth URL manually
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.DISCORD_CLIENT_ID!,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
        scope: "identify email",
        state: `${state}|lang=${language}`, // Include language in state
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
      });

      const discordAuthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
      console.log("Redirecting to Discord OAuth URL:", discordAuthUrl);

      // Redirect to Discord OAuth
      set.status = 302;
      set.headers = {
        Location: discordAuthUrl,
      };

      return;
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Discord OAuth login",
        description: "Initiate Discord OAuth2.0 authentication flow",
      },
    }
  )

  // Discord OAuth2.0 callback (Manual implementation)
  .get(
    "/discord/callback",
    async ({
      set,
      query,
      headers,
      cookie,
    }: {
      set: any;
      query: any;
      headers: any;
      cookie: any;
    }) => {
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

        const code = query.code;
        const receivedState = query.state;

        if (!code) {
          throw new Error("No authorization code received from Discord");
        }

        console.log(
          "Discord callback received - code:",
          !!code,
          "state:",
          receivedState
        );

        // Debug: Log all available cookies
        console.log("All cookies:", cookie);
        console.log("Cookie headers:", headers.cookie);

        // Get state and code verifier from our manual cookies
        const storedState = cookie.discord_state?.value;
        const codeVerifier = cookie.discord_code_verifier?.value;

        console.log("Stored state from cookie:", storedState);
        console.log("Code verifier from cookie:", !!codeVerifier);

        if (!storedState || !codeVerifier) {
          throw new Error("Missing OAuth state or code verifier cookies");
        }

        // Extract our state from the received state (format: "state|lang=en")
        const [actualState, langPart] = receivedState.split("|");

        // Validate state matches
        if (actualState !== storedState) {
          throw new Error(
            `State mismatch: expected ${storedState}, got ${actualState}`
          );
        }

        console.log("State validation passed");

        // Exchange code for tokens manually with PKCE
        const tokenResponse = await fetch(
          "https://discord.com/api/oauth2/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.DISCORD_CLIENT_ID!,
              client_secret: process.env.DISCORD_CLIENT_SECRET!,
              code: code,
              grant_type: "authorization_code",
              redirect_uri: process.env.DISCORD_REDIRECT_URI!,
              code_verifier: codeVerifier, // Include PKCE code verifier
            }),
          }
        );

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("Discord token exchange failed:", errorText);
          throw new Error(
            `Discord token exchange failed: ${tokenResponse.status}`
          );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresIn = tokenData.expires_in || 3600;

        console.log("Discord OAuth tokens received:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          expiresIn,
        });

        // Fetch user info from Discord
        const userResponse = await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user info from Discord");
        }

        const discordUser = await userResponse.json();
        console.log("Discord user info received:", {
          id: discordUser.id,
          email: discordUser.email,
          username: discordUser.username,
        });

        // Create avatar URL for Discord
        const avatarUrl = discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${
              discordUser.discriminator % 5
            }.png`;

        // Create or update user in database
        const user = await findOrCreateUser(
          discordUser.email,
          discordUser.global_name || discordUser.username,
          avatarUrl,
          "discord"
        );

        console.log("User created/updated in database:", user.id);

        // Create session with OAuth tokens
        const sessionId = await createSession(
          user.id,
          accessToken,
          refreshToken,
          expiresIn
        );

        console.log("Session created:", sessionId);

        // Set secure session cookie
        set.cookie = {
          [appConfig.cookies.session.name]: {
            value: sessionId,
            ...appConfig.cookies.session,
          },
          // Clear the temporary OAuth cookies
          discord_state: {
            value: "",
            maxAge: 0,
            path: "/",
            domain: ".localtest.me",
          },
          discord_code_verifier: {
            value: "",
            maxAge: 0,
            path: "/",
            domain: ".localtest.me",
          },
        };

        // Extract language preference from state parameter
        let language = langPart ? langPart.replace("lang=", "") : "en";

        // Check if user has a current language preference in cookie (override state)
        const cookieName = appConfig.cookies.preferences.name;
        if (headers.cookie) {
          const match = headers.cookie.match(
            new RegExp(`${cookieName}=([^;]+)`)
          );
          if (match) {
            language = match[1];
            console.log(
              "Using current language preference from cookie:",
              language
            );
          }
        }

        console.log("Final language for redirect:", language);

        // Redirect to frontend without session in URL - use cookie only
        const redirectUrl =
          process.env.FRONTEND_SUCCESS_REDIRECT ||
          `http://blog.localtest.me:3000?lang=${language}`;

        console.log("Discord OAuth success - redirecting to:", redirectUrl);

        set.status = 302;
        set.headers["Location"] = redirectUrl;
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

  // Logout endpoint
  .delete(
    "/logout",
    async ({ cookie, set }: { cookie: any; set: any }) => {
      const sessionCookie = cookie[appConfig.cookies.session.name];

      if (sessionCookie && sessionCookie.value) {
        try {
          await deleteSession(sessionCookie.value);
          console.log("Session deleted:", sessionCookie.value);
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }

      // Clear session cookie
      set.cookie = {
        [appConfig.cookies.session.name]: {
          value: "",
          ...appConfig.cookies.session,
          maxAge: 0,
        },
      };

      return { success: true, message: "Logged out successfully" };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Logout user",
        description: "Clear user session and logout",
      },
    }
  )

  // Get current user info (protected)
  .get(
    "/me",
    async ({ cookie, headers }: { cookie: any; headers: any }) => {
      // Manual session extraction for debugging
      let sessionId: string | null = null;

      // Check cookie FIRST (prioritize cookie-based sessions)
      const cookieName = "astral_session";
      if (cookie && cookie[cookieName]?.value) {
        sessionId = cookie[cookieName].value;
      }

      // Check Authorization header as fallback
      const authHeader = headers.authorization;
      if (!sessionId && authHeader && authHeader.startsWith("Bearer ")) {
        sessionId = authHeader.substring(7);
      }

      // Check X-Session-ID header as final fallback
      const sessionHeader = headers["x-session-id"];
      if (!sessionId && sessionHeader) {
        sessionId = sessionHeader;
      }

      console.log("=== /auth/me Manual Debug ===");
      console.log("Cookie name:", cookieName);
      console.log("Raw cookies:", headers.cookie);
      console.log("Authorization header:", authHeader);
      console.log("X-Session-ID header:", sessionHeader);
      console.log("Final extracted sessionId:", sessionId);
      console.log("Cookie object:", cookie);

      if (!sessionId) {
        return {
          error: "No session found",
          debug: {
            cookieReceived: !!headers.cookie,
            authHeaderReceived: !!authHeader,
            sessionHeaderReceived: !!sessionHeader,
          },
        };
      }

      // Get session from database manually
      const sessionQuery = `
        SELECT s.*, u.id as user_id, u.email, u.name, u.picture, p.provider_name
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        JOIN providers p ON u.provider_id = p.id
        WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP
      `;

      try {
        const { queryOne } = await import("../utils/database");
        const session = await queryOne(sessionQuery, [sessionId]);
        console.log(
          "Session from database:",
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

        if (!session) {
          return {
            error: "Session not found in database",
            sessionId,
          };
        }

        const user = {
          id: session.user_id,
          email: session.email,
          name: session.name,
          picture: session.picture,
          provider: session.provider_name,
        };

        console.log("Session found, returning user:", user);

        return { user };
      } catch (error) {
        console.error("Database error in /auth/me:", error);
        return {
          error: "Database error",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Get current authenticated user information",
      },
    }
  )

  // Refresh session endpoint
  .post(
    "/refresh",
    async ({ cookie, set }: { cookie: any; set: any }) => {
      const sessionCookie = cookie[appConfig.cookies.session.name];

      if (!sessionCookie || !sessionCookie.value) {
        set.status = 401;
        return { error: "No session found" };
      }

      try {
        // The refresh logic is handled in the auth middleware
        // For now, just verify the session exists
        set.status = 200;
        return { success: true, message: "Session is valid" };
      } catch (error) {
        console.error("Session refresh error:", error);
        set.status = 401;
        return { error: "Invalid session" };
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Refresh session",
        description: "Refresh user session",
      },
    }
  )

  // Debug endpoint to clear session cookie
  .post(
    "/clear-session",
    async ({ set }: { set: any }) => {
      // Clear session cookie
      set.cookie = {
        [appConfig.cookies.session.name]: {
          value: "",
          ...appConfig.cookies.session,
          maxAge: 0,
        },
      };

      console.log("Session cookie cleared via /auth/clear-session");
      return { success: true, message: "Session cookie cleared" };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Clear session cookie",
        description: "Clear invalid session cookie (debug endpoint)",
      },
    }
  );
