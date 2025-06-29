import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { swagger } from "@elysiajs/swagger";
import { trpc } from "@elysiajs/trpc";

// Import configuration
import { appConfig } from "./config/app";

// Import tRPC router
import { appRouter } from "./trpc/router";

// Import routes
import { authRoutes, userRoutes, appRoutes } from "./routes";

// Import middleware
import {
  loggerMiddleware,
  corsMiddleware,
  errorMiddleware,
} from "./middleware";

const app = new Elysia({ adapter: node() })
  // Apply middleware
  .use(loggerMiddleware)
  .use(corsMiddleware)
  .use(errorMiddleware)

  // Swagger documentation
  .use(
    swagger({
      path: appConfig.api.swagger.path,
      documentation: {
        info: {
          title: "Elysian Realm API Documentation",
          version: appConfig.api.version,
          description: "A well-organized Elysia.js API with tRPC integration",
        },
        tags: [
          {
            name: "App",
            description: "Application endpoints (health, status, etc.)",
          },
          {
            name: "Auth",
            description: "Authentication endpoints (login, register, logout)",
          },
          {
            name: "Users",
            description: "User management endpoints",
          },
          {
            name: "tRPC",
            description: "tRPC endpoints with type safety",
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

  // tRPC integration
  .use(
    trpc(appRouter, {
      endpoint: appConfig.api.trpc.path,
    })
  )

  // Apply route groups
  .use(appRoutes)
  .use(authRoutes)
  .use(userRoutes)

  .listen(appConfig.port, ({ hostname, port }) => {
    console.log(`🦊 Elysia server is running at http://${hostname}:${port}`);
    console.log(
      `📚 API Documentation: http://${hostname}:${port}${appConfig.api.swagger.path}`
    );
    console.log(
      `📡 tRPC endpoint: http://${hostname}:${port}${appConfig.api.trpc.path}`
    );
    console.log(`🌟 Environment: ${appConfig.environment}`);
  });
