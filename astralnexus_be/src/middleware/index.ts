import { Elysia } from "elysia";
import { authMiddleware } from "./auth";

// Middleware for logging requests
export const loggerMiddleware = new Elysia({ name: "logger" }).onRequest(
  ({ request }) => {
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`
    );
  }
);

// Middleware for CORS
export const corsMiddleware = new Elysia({ name: "cors" }).onRequest(
  ({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }
);

// Export auth middleware
export { authMiddleware };

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
