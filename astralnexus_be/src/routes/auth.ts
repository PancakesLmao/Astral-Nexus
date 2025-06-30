import { Elysia, t } from "elysia";

// Authentication routes
export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/login",
    ({ body, set }) => {
      // Mock login logic
      const { username, password } = body as {
        username: string;
        password: string;
      };

      if (!username || !password) {
        set.status = 400;
        return { error: "Username and password are required" };
      }

      // Mock authentication
      if (username === "admin" && password === "password") {
        return {
          success: true,
          user: {
            id: "1",
            username,
            token: "mock-jwt-token",
          },
        };
      }

      set.status = 401;
      return { error: "Invalid credentials" };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "User login",
        description: "Authenticate user with credentials",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", minLength: 3 },
                  password: { type: "string", minLength: 6 },
                },
                required: ["username", "password"],
              },
            },
          },
        },
      },
    }
  )
  .post(
    "/register",
    ({ body, set }) => {
      const { username, email, password } = body as {
        username: string;
        email: string;
        password: string;
      };

      if (!username || !email || !password) {
        set.status = 400;
        return { error: "Username, email, and password are required" };
      }

      // Mock registration logic
      return {
        success: true,
        user: {
          id: "2",
          username,
          email,
          token: "mock-jwt-token",
        },
      };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "User registration",
        description: "Register a new user account",
      },
    }
  )
  .post(
    "/logout",
    () => {
      return { success: true, message: "Logged out successfully" };
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "User logout",
        description: "Logout current user session",
      },
    }
  );
