import { Elysia } from "elysia";

// Application routes (health check, status, etc.)
export const appRoutes = new Elysia()
  .get(
    "/",
    () => {
      return {
        message: "Hello from Elysian Realm",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      };
    },
    {
      detail: {
        tags: ["App"],
        summary: "Root endpoint",
        description: "Welcome message and API information",
      },
    }
  )
  .get(
    "/health",
    () => {
      return {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      };
    },
    {
      detail: {
        tags: ["App"],
        summary: "Health check",
        description: "Check API health status",
      },
    }
  )
  .get(
    "/version",
    () => {
      return {
        version: "1.0.0",
        name: "Honkai Blog API",
        build: Date.now().toString(),
      };
    },
    {
      detail: {
        tags: ["App"],
        summary: "API Version",
        description: "Get API version information",
      },
    }
  );
