import { Elysia } from "elysia";
import { queryAll, queryOne, exists, count } from "../utils/database";

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
          count("providers"),
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
            providers: stats[5],
            game_categories: stats[6],
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
      detail: {
        tags: ["Database"],
        summary: "Get database statistics",
        description: "Get record counts from main database tables",
      },
    }
  );
