// Application configuration
export const appConfig = {
  port: process.env.PORT,
  host: process.env.HOST,
  environment: process.env.NODE_ENV,

  // API Configuration
  api: {
    version: "1.0.0",
    prefix: "/api",
    swagger: {
      path: "/swagger",
      enabled: process.env.NODE_ENV !== "production",
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },

  // Cookie Configuration
  cookies: {
    // Session cookie settings
    session: {
      name: "astral_session",
      domain: ".localtest.me",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    },
    // User preferences cookie settings
    preferences: {
      name: "user_lang",
      domain: ".localtest.me",
      httpOnly: false, // Frontend needs to read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    },
    // OAuth state cookie settings
    oauthState: {
      name: "oauth_state",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as "strict",
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: "/auth",
    },
  },
};
