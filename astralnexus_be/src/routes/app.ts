import { Elysia } from "elysia";
import { testConnection } from "../config/database";

// Application routes (health check, status, etc.)
export const appRoutes = new Elysia()
  .get(
    "/",
    () => {
      return {
        message: "Hello from Astral Nexus",
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
    async () => {
      const dbStatus = await testConnection();
      return {
        status: dbStatus ? "healthy" : "unhealthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: dbStatus ? "connected" : "disconnected",
      };
    },
    {
      detail: {
        tags: ["App"],
        summary: "Health check",
        description: "Check API health status including database connectivity",
      },
    }
  )
  .get(
    "/version",
    () => {
      return {
        version: "1.0.0",
        name: "Astral Nexus API",
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
