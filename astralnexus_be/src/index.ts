import "dotenv/config"; // Load environment variables from .env file
import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
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
} from "./routes";

// Import middleware
import {
  loggerMiddleware,
  corsMiddleware,
  errorMiddleware,
  authMiddleware,
} from "./middleware";

const app = new Elysia({ adapter: node() })
  // Apply middleware
  .use(loggerMiddleware)
  .use(corsMiddleware)
  .use(errorMiddleware)
  .use(authMiddleware)
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

  // Apply route groups
  .use(appRoutes)
  .use(authRoutes)
  .use(userRoutes)
  .use(commentRoutes)
  .use(dbRoutes)
  .use(postsRoutes)
  .use(gameCategoriesRoutes)

  .listen(appConfig.port || 3001, async ({ hostname, port }) => {
    console.log(`🦊 Elysia server is running at http://${hostname}:${port}`);
    console.log(
      `📚 API Documentation: http://${hostname}:${port}${appConfig.api.swagger.path}`
    );
    console.log(`Environment: ${appConfig.environment}`);

    // Test database connection
    console.log("Testing database connection...");
    await testConnection();
  });
