import { Elysia, t } from "elysia";
import { queryAll, queryOne, exists, count } from "../utils/database";

// Response schemas
const DatabaseTestResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
  data: t.Optional(
    t.Object({
      current_time: t.String(),
      db_version: t.String(),
    })
  ),
});

const ErrorResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
  error: t.String(),
});

// Database test routes for development
export const dbRoutes = new Elysia({ prefix: "/api/db" })
  .get(
    "/test",
    async () => {
      try {
        // Test basic query
        const result = await queryOne(
          "SELECT NOW() as current_time, version() as db_version"
        );
        return {
          success: true,
          message: "Database connection successful",
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          message: "Database connection failed",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      response: {
        200: DatabaseTestResponse,
        500: ErrorResponse,
      },
      detail: {
        tags: ["Database"],
        summary: "Test database connection",
        description: "Test database connectivity and get basic info",
      },
    }
  )
  .get(
    "/schema",
    async () => {
      try {
        // Get all tables
        const tables = await queryAll(`
          SELECT table_name, table_type 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);

        return {
          success: true,
          message: "Schema information retrieved",
          tables: tables,
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to retrieve schema information",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          message: t.String(),
          tables: t.Array(
            t.Object({
              table_name: t.String(),
              table_type: t.String(),
            })
          ),
        }),
        500: ErrorResponse,
      },
      detail: {
        tags: ["Database"],
        summary: "Get database schema",
        description: "Get information about database tables and structure",
      },
    }
  )
  .get(
    "/stats",
    async () => {
      try {
        // Get statistics from main tables
        const stats = await Promise.all([
          count("users"),
          count("posts"),
          count("comments"),
          count("post_likes"),
          count("comment_likes"),
          count("game_categories"),
        ]);

        return {
          success: true,
          message: "Database statistics retrieved",
          stats: {
            users: stats[0],
            posts: stats[1],
            comments: stats[2],
            post_likes: stats[3],
            comment_likes: stats[4],
            game_categories: stats[5],
          },
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed to retrieve database statistics",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          message: t.String(),
          stats: t.Object({
            users: t.Number(),
            posts: t.Number(),
            comments: t.Number(),
            post_likes: t.Number(),
            comment_likes: t.Number(),
            game_categories: t.Number(),
          }),
        }),
        500: ErrorResponse,
      },
      detail: {
        tags: ["Database"],
        summary: "Get database statistics",
        description: "Get record counts from main database tables",
      },
    }
  );
