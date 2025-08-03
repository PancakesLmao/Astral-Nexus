import "dotenv/config"; // Load environment variables from .env file
import { Elysia } from "elysia";
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
} from "./routes";

// Import middleware
import {
  loggerMiddleware,
  corsMiddleware,
  errorMiddleware,
} from "./middleware";

const app = new Elysia()
  // Apply middleware
  .use(loggerMiddleware)
  .use(corsMiddleware)
  .use(errorMiddleware)
  .use(cookie())

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
            description: "Application endpoints (health, status, etc.)",
          },
          {
            name: "Auth",
            description: "Authentication endpoints (sign-in, logout)",
          },
          {
            name: "Users",
            description: "User management endpoints",
          },
          {
            name: "Posts",
            description: "Blog post management endpoints",
          },
          {
            name: "Comments",
            description: "Blog comment management endpoints",
          },
          {
            name: "Notifications",
            description: "User notification management endpoints",
          },
          {
            name: "Game Categories",
            description: "Game category management endpoints",
          },
          {
            name: "Database",
            description: "Database testing and utility endpoints",
          },
        ],
        servers: [
          {
            url: `http://${appConfig.host}:${appConfig.port}`,
            description: "Development server",
          },
        ],
      },
    })
  )

  .use(appRoutes)
  .use(authRoutes)
  .use(userRoutes)
  .use(commentRoutes)
  .use(dbRoutes)
  .use(postsRoutes)
  .use(gameCategoriesRoutes)
  .use(notificationsRoutes)

  .listen(
    {
      port: appConfig.port || 3001,
      hostname: "0.0.0.0", // Listen on all interfaces
    },
    async ({ hostname, port }) => {
      const displayHostname = process.env.HOST || "api.localtest.me";
      const displayUrl = `http://${displayHostname}:${port}`;

      console.log(`🦊 Elysia server is running at ${displayUrl}`);
      console.log(
        `📚 API Documentation: ${displayUrl}${appConfig.api.swagger.path}`
      );
      console.log(`Server listening on: ${hostname}:${port} (all interfaces)`);
      console.log(`Environment: ${appConfig.environment}`);

      // Test database connection
      console.log("Testing database connection...");
      await testConnection();
    }
  );
