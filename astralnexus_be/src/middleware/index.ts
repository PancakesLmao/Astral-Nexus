import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { appConfig } from "../config/app";
import { authMiddleware } from "./auth";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  
  // Status code colors
  success: "\x1b[32m", // Green (2xx)
  info: "\x1b[34m", // Blue (1xx)
  redirect: "\x1b[36m", // Cyan (3xx)
  clientError: "\x1b[33m", // Yellow (4xx)
  serverError: "\x1b[31m", // Red (5xx)
  
  // Method colors
  get: "\x1b[36m", // Cyan
  post: "\x1b[33m", // Yellow
  put: "\x1b[35m", // Magenta
  delete: "\x1b[31m", // Red
  patch: "\x1b[34m", // Blue
  options: "\x1b[37m", // White
};

// Get color based on HTTP status code
const getStatusColor = (status: number | string): string => {
  const statusCode = typeof status === "string" ? parseInt(status, 10) : status;
  if (statusCode >= 200 && statusCode < 300) return colors.success;
  if (statusCode >= 100 && statusCode < 200) return colors.info;
  if (statusCode >= 300 && statusCode < 400) return colors.redirect;
  if (statusCode >= 400 && statusCode < 500) return colors.clientError;
  if (statusCode >= 500 && statusCode < 600) return colors.serverError;
  return colors.reset;
};

// Get color based on HTTP method
const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case "GET":
      return colors.get;
    case "POST":
      return colors.post;
    case "PUT":
      return colors.put;
    case "DELETE":
      return colors.delete;
    case "PATCH":
      return colors.patch;
    case "OPTIONS":
      return colors.options;
    default:
      return colors.reset;
  }
};

// Middleware for logging requests with response status
export const loggerMiddleware = new Elysia({ name: "logger" })
  .onRequest(({ request }) => {
    // Store request start time
    (request as any).__startTime = Date.now();
    
    // Log incoming request with path and method
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    const method = request.method.padEnd(6);
    const methodColor = getMethodColor(request.method);
    
    console.log(
      `${new Date().toISOString()} ${methodColor}${colors.bright}→ ${method}${colors.reset} ${path}`
    );
  })
  .onAfterHandle(({ request, set }) => {
    // Log response after handler executes
    const startTime = (request as any).__startTime || Date.now();
    const duration = Date.now() - startTime;
    const status = set.status || 200;
    
    const timestamp = new Date().toISOString();
    const methodColor = getMethodColor(request.method);
    const statusColor = getStatusColor(status);
    const method = request.method.padEnd(6);
    
    // Parse URL to get path and query string
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    
    console.log(
      `${timestamp} ${statusColor}${colors.bright}${status}${colors.reset} ${methodColor}${colors.bright}${method}${colors.reset} ${path} ${duration}ms`
    );
  });

// Middleware for CORS using Elysia CORS plugin
export const corsMiddleware = new Elysia({ name: "cors" }).use(
  cors({
    origin: appConfig.cors.origin
      ? appConfig.cors.origin.split(",").map((origin) => origin.trim())
      : ["http://localtest.me:3000", "http://blog.localtest.me:3000", "http://admin.localtest.me:3000", "http://api.localtest.me:3001"],
    credentials: appConfig.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Session-ID"],
  })
);

// Export auth middleware
export { authMiddleware, authGuard, requireAuthMiddleware } from "./auth";

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
