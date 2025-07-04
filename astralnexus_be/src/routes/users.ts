import { Elysia, t } from "elysia";
import { appConfig } from "../config/app";

// User management routes
export const userRoutes = new Elysia({ prefix: "/users" })
  .get(
    "/profile/:id",
    ({ params: { id } }) => {
      return {
        id,
        username: "testuser",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Users"],
        summary: "Get user profile",
        description: "Get user profile by ID",
      },
    }
  )
  .put(
    "/profile/:id",
    ({ params: { id }, body }) => {
      const { username, email } = body as { username?: string; email?: string };

      return {
        success: true,
        user: {
          id,
          username: username || "testuser",
          email: email || "test@example.com",
          updatedAt: new Date().toISOString(),
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        username: t.Optional(t.String({ minLength: 3 })),
        email: t.Optional(t.String({ format: "email" })),
      }),
      detail: {
        tags: ["Users"],
        summary: "Update user profile",
        description: "Update user profile information",
      },
    }
  )
  .get(
    "/",
    ({ query }) => {
      const { page = "1", limit = "10" } = query as {
        page?: string;
        limit?: string;
      };

      // Mock users data
      const users = Array.from({ length: parseInt(limit) }, (_, i) => ({
        id: `${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        createdAt: new Date().toISOString(),
      }));

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100,
          totalPages: Math.ceil(100 / parseInt(limit)),
        },
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Users"],
        summary: "Get users list",
        description: "Get paginated list of users",
      },
    }
  )
  .get(
    "/list",
    ({ query }) => {
      const { page = "1", limit = "10" } = query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      return {
        users: [
          {
            id: "1",
            username: "testuser1",
            email: "test1@example.com",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            username: "testuser2",
            email: "test2@example.com",
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 2,
          pages: 1,
        },
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Users"],
        summary: "Get users list",
        description: "Get paginated list of users",
      },
    }
  );
