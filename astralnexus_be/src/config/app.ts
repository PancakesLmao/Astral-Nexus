// Application configuration
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

// Default values based on environment
const defaultPort = isDevelopment ? "3001" : "3001";
const defaultHost = isDevelopment ? "api.localtest.me" : "0.0.0.0"; // 0.0.0.0 for production containers
const defaultSessionDomain = isDevelopment
  ? ".localtest.me"
  : process.env.SESSION_DOMAIN || ".domain.com";

export const appConfig = {
  port: process.env.PORT || defaultPort,
  host: process.env.HOST || defaultHost,
  environment: process.env.NODE_ENV || "development",

  // API Configuration
  api: {
    version: "1.0.0",
    prefix: "/api",
    swagger: {
      path: "/swagger",
      enabled: !isProduction,
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
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
      domain: defaultSessionDomain,
    },
    // User preferences cookie settings
    preferences: {
      name: "preferred-language",
      httpOnly: false, // Frontend needs to read this
      secure: isProduction,
      sameSite: "lax" as "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      path: "/",
      domain: defaultSessionDomain,
    },
    // OAuth state cookie settings
    oauthState: {
      name: "oauth_state",
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as "strict",
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: "/auth",
    },
  },
};
