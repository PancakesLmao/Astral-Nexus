import "dotenv/config"; // Load environment variables from .env file
import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { swagger } from "@elysiajs/swagger";
import { cookie } from "@elysiajs/cookie";

// Validate required environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "SESSION_DOMAIN",
  "CORS_ORIGIN",
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error("❌ ERROR: Missing required environment variables:");
  missingVars.forEach((key) => console.error(`  - ${key}`));
  console.error(
    "\nPlease ensure all required environment variables are set in .env file"
  );
  process.exit(1);
}

console.log("✅ All required environment variables are set!");

// Import configuration
import { appConfig } from "./config/app";
import { testConnection } from "./config/database";

// Import routes
import {
  authRoutes,
  userRoutes,
  appRoutes,
  commentRoutes,
  postsRoutes,
  gameCategoriesRoutes,
  notificationsRoutes,
  adminRoutes,
} from "./routes";

// Import middleware
import {
  loggerMiddleware,
  corsMiddleware,
  errorMiddleware,
} from "./middleware";

const isDevelopment = process.env.NODE_ENV === "development";
const displayHostname = isDevelopment ? "api.localtest.me" : process.env.HOST || "localhost";

// ANSI color codes for logging
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  success: "\x1b[32m", // Green (2xx)
  info: "\x1b[34m", // Blue (1xx)
  redirect: "\x1b[36m", // Cyan (3xx)
  clientError: "\x1b[33m", // Yellow (4xx)
  serverError: "\x1b[31m", // Red (5xx)
};

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return colors.success;
  if (status >= 100 && status < 200) return colors.info;
  if (status >= 300 && status < 400) return colors.redirect;
  if (status >= 400 && status < 500) return colors.clientError;
  if (status >= 500 && status < 600) return colors.serverError;
  return colors.reset;
};

const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case "GET":
      return "\x1b[36m"; // Cyan
    case "POST":
      return "\x1b[33m"; // Yellow
    case "PUT":
      return "\x1b[35m"; // Magenta
    case "DELETE":
      return "\x1b[31m"; // Red
    case "PATCH":
      return "\x1b[34m"; // Blue
    case "OPTIONS":
      return "\x1b[37m"; // White
    default:
      return colors.reset;
  }
};

let app: any = new Elysia()
  .onBeforeHandle(({ request, store }: any) => {
    // Store request info for logging
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    const method = request.method;
    
    store.__requestInfo = {
      method,
      path,
      start: Date.now(),
    };
  })
  .onAfterHandle(({ set, store }: any) => {
    // Log response after handler executes
    const requestInfo = store.__requestInfo;
    
    if (!requestInfo) return;
    
    const duration = Date.now() - requestInfo.start;
    const status = set.status || 200;
    
    const timestamp = new Date().toISOString();
    const methodColor = getMethodColor(requestInfo.method);
    const statusColor = getStatusColor(status);
    const method = requestInfo.method.padEnd(6);
    
    console.log(
      `${timestamp} ${statusColor}${colors.bright}${status}${colors.reset} ${duration}ms ${methodColor}${colors.bright}${method}${colors.reset} ${requestInfo.path}`
    );
  })
  // Apply middleware
  .use(loggerMiddleware)
  .use(corsMiddleware)
  .use(errorMiddleware)
  .use(cookie());

// OpenAPI and Swagger documentation (development only)
if (isDevelopment) {
  app = app.use(openapi());
  app = app.use(
    swagger({
      path: appConfig.api.swagger.path,
      documentation: {
        info: {
          title: "Astral Nexus API Documentation",
          version: appConfig.api.version,
          description: "API documentation for the Astral Nexus backend",
        },
        tags: [
          {
            name: "App",
            description: "Application endpoints (health, status, version)",
          },
          {
            name: "Authentication",
            description: "Authentication endpoints (verify token, logout, get current user)",
          },
          {
            name: "Users",
            description: "User profile endpoints (requires authentication)",
          },
          {
            name: "Blog",
            description: "Blog management (posts, comments, notifications, game categories) - requires authentication",
          },
          {
            name: "Admin",
            description: "Admin endpoints for user/content management and analytics - requires admin role",
          },
        ],
        servers: [
          {
            url: `http://${displayHostname}:${appConfig.port}`,
            description: "Development server",
          },
        ],
      },
    })
  );
}

// Register routes
app = app
  .use(appRoutes)
  .use(authRoutes)
  .use(userRoutes)
  .use(commentRoutes)
  .use(postsRoutes)
  .use(gameCategoriesRoutes)
  .use(notificationsRoutes)
  // .use(adminRoutes)

  .listen(
    {
      port: appConfig.port || 3001,
      hostname: "0.0.0.0", // Listen on all interfaces
    },
    async ({ hostname, port }: any) => {
      const displayUrl = `http://${displayHostname}:${port}`

      console.log(`🦊 Elysia server is running at ${displayUrl}`)
      if (isDevelopment) {
        console.log(
          `📚 API Documentation: ${displayUrl}${appConfig.api.swagger.path}`
        )
      }
      console.log(`Server listening on: ${hostname}:${port} (all interfaces)`)
      console.log(`Environment: ${appConfig.environment}`)

      // Test database connection
      console.log("Testing database connection...");
      await testConnection();
    }
  );
