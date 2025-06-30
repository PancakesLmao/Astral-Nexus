// Application configuration
export const appConfig = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || "localhost",
  environment: process.env.NODE_ENV || "development",

  // API Configuration
  api: {
    version: "1.0.0",
    prefix: "/api",
    swagger: {
      path: "/swagger",
      enabled: process.env.NODE_ENV !== "production",
    },
    trpc: {
      path: "/trpc",
      enabled: true,
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  // JWT Configuration (for authentication)
  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
};
