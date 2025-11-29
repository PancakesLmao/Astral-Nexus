import "dotenv/config"; // Load environment variables from .env file
import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { swagger } from "@elysiajs/swagger";
import { cookie } from "@elysiajs/cookie";

// Import configuration
import { appConfig } from "./config/app";
import { testConnection } from "./config/database";

// Import routes
import {
  authRoutes,
  userRoutes,
  appRoutes,
  commentRoutes,
  dbRoutes,
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
  authMiddleware,
} from "./middleware";

const isDevelopment = process.env.NODE_ENV === "development";
const displayHostname = isDevelopment ? "api.localtest.me" : process.env.HOST || "localhost";

// Simple response logging helper
const createResponseLogger = () => {
  return new Elysia({ name: "response-logger" })
    .onRequest(({ request }) => {
      (request as any).__startTime = Date.now();
      
      const url = new URL(request.url);
      const path = url.pathname + url.search;
      const method = request.method.padEnd(6);
      
      // Method color
      const methodColors: any = {
        GET: "\x1b[36m",
        POST: "\x1b[33m",
        PUT: "\x1b[35m",
        DELETE: "\x1b[31m",
        PATCH: "\x1b[34m",
        OPTIONS: "\x1b[37m",
      };
      const methodColor = methodColors[request.method.toUpperCase()] || "\x1b[0m";
      
      console.log(
        `${new Date().toISOString()} ${methodColor}\x1b[1m→ ${method}\x1b[0m ${path}`
      );
    })
    .onAfterHandle(({ request, set }: any) => {
      // Log response after handler executes
      const startTime = (request as any).__startTime || Date.now();
      const duration = Date.now() - startTime;
      const status = set.status || 200;
      
      const url = new URL(request.url);
      const path = url.pathname + url.search;
      const method = request.method.padEnd(6);
      
      // Status color
      let statusColor = "\x1b[0m";
      if (status >= 200 && status < 300) statusColor = "\x1b[32m";
      else if (status >= 300 && status < 400) statusColor = "\x1b[36m";
      else if (status >= 400 && status < 500) statusColor = "\x1b[33m";
      else if (status >= 500) statusColor = "\x1b[31m";
      
      // Method color
      const methodColors: any = {
        GET: "\x1b[36m",
        POST: "\x1b[33m",
        PUT: "\x1b[35m",
        DELETE: "\x1b[31m",
        PATCH: "\x1b[34m",
        OPTIONS: "\x1b[37m",
      };
      const methodColor = methodColors[request.method.toUpperCase()] || "\x1b[0m";
      
      console.log(
        `${new Date().toISOString()} ${statusColor}\x1b[1m${status}\x1b[0m ${methodColor}\x1b[1m${method}\x1b[0m ${path} ${duration}ms`
      );
    });
};

const app = new Elysia()
  .use(createResponseLogger())
  // Apply middleware
  .use(loggerMiddleware)
  .use(corsMiddleware)
  .use(errorMiddleware)
  .use(cookie())
  .use(openapi())

  // Swagger documentation
  .use(
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
          {
            name: "Database",
            description: "Database testing and utility endpoints (development only)",
          },
        ],
        servers: [
          {
            url: `http://${displayHostname}:${appConfig.port}`,
            description: isDevelopment ? "Development server" : "Production server",
          },
        ],
      },
    })
  )

  .use(appRoutes)
  .use(authRoutes)
  // Apply global authentication middleware to protected routes
  .use(authMiddleware)
  .use(userRoutes)
  .use(commentRoutes)
  .use(postsRoutes)
  .use(gameCategoriesRoutes)
  .use(notificationsRoutes)
  .use(adminRoutes)
  // Unprotected database routes
  .use(dbRoutes)

  .listen(
    {
      port: appConfig.port || 3001,
      hostname: "0.0.0.0", // Listen on all interfaces
    },
    async ({ hostname, port }) => {
      const displayUrl = `http://${displayHostname}:${port}`

      console.log(`🦊 Elysia server is running at ${displayUrl}`)
      console.log(
        `📚 API Documentation: ${displayUrl}${appConfig.api.swagger.path}`
      )
      console.log(`Server listening on: ${hostname}:${port} (all interfaces)`)
      console.log(`Environment: ${appConfig.environment}`)

      // Test database connection
      console.log("Testing database connection...");
      await testConnection();
    }
  );
