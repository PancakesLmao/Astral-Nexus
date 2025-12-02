import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { appConfig } from "../config/app";

// Middleware for CORS using Elysia CORS plugin
export const corsMiddleware = new Elysia({ name: "cors" }).use(
  cors({
    origin: appConfig.cors.origin
      ? appConfig.cors.origin.split(",").map((origin) => origin.trim())
      : [],
    credentials: appConfig.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Session-ID"],
  })
);

// Export auth middleware
export { authGuard } from "./auth";

// Middleware for error handling
export const errorMiddleware = new Elysia({ name: "error" }).onError(
  ({ error, set }) => {
    console.error("Error:", error);

    set.status = 500;
    return {
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
);

// Empty logger middleware - logging is now in src/index.ts
export const loggerMiddleware = new Elysia({ name: "logger" });
