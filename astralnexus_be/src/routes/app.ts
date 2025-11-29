import { Elysia, t } from "elysia";
import { testConnection } from "../config/database";

// Response schemas
const RootResponseSchema = t.Object({
  message: t.String(),
  version: t.String(),
  timestamp: t.String({ format: "date-time" }),
});

const HealthResponseSchema = t.Object({
  status: t.Union([t.Literal("healthy"), t.Literal("unhealthy")]),
  uptime: t.Number(),
  timestamp: t.String({ format: "date-time" }),
  environment: t.String(),
  database: t.Union([t.Literal("connected"), t.Literal("disconnected")]),
});

const VersionResponseSchema = t.Object({
  version: t.String(),
  name: t.String(),
  build: t.String(),
});

const ErrorSchema = t.Object({
  error: t.String(),
  message: t.String(),
  timestamp: t.String({ format: "date-time" }),
});

// Application routes (health check, status, etc.)
export const appRoutes = new Elysia()
  .get(
    "/",
    () => {
      return {
        message: "Hello from Astral Nexus",
        version: "1.0.1",
        timestamp: new Date().toISOString(),
      };
    },
    {
      tags: ["App"],
      summary: "Root endpoint",
      description: "Welcome message and API information",
      response: RootResponseSchema,
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
      tags: ["App"],
      summary: "Health check",
      description: "Check API health status including database connectivity",
      response: HealthResponseSchema,
      responses: {
        200: {
          description: "API is healthy",
          content: {
            "application/json": {
              schema: HealthResponseSchema,
            },
          },
        },
        503: {
          description: "Service unavailable",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
      },
    }
  )
  .get(
    "/version",
    () => {
      return {
        version: "1.0.1",
        name: "Astral Nexus API",
        build: Date.now().toString(),
      };
    },
    {
      tags: ["App"],
      summary: "API Version",
      description: "Get API version information",
      response: VersionResponseSchema,
      responses: {
        200: {
          description: "Version information retrieved successfully",
          content: {
            "application/json": {
              schema: VersionResponseSchema,
            },
          },
        },
      },
    }
  );
