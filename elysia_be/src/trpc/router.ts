import { initTRPC } from "@trpc/server";
import { z } from "zod";

// Initialize tRPC
const t = initTRPC.create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Input validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Define your tRPC router
export const appRouter = router({
  // Simple hello procedure
  hello: publicProcedure.input(z.string()).query(({ input }) => {
    return { greeting: `Hello ${input}!` };
  }),

  // Authentication procedures
  auth: router({
    login: publicProcedure.input(loginSchema).mutation(({ input }) => {
      // Your login logic here
      console.log("Login attempt:", input.username);
      return {
        success: true,
        user: {
          id: "1",
          username: input.username,
          token: "mock-jwt-token",
        },
      };
    }),

    register: publicProcedure.input(registerSchema).mutation(({ input }) => {
      // Your registration logic here
      console.log("Registration attempt:", input.username);
      return {
        success: true,
        user: {
          id: "2",
          username: input.username,
          email: input.email,
          token: "mock-jwt-token",
        },
      };
    }),

    logout: publicProcedure.mutation(() => {
      // Your logout logic here
      return { success: true, message: "Logged out successfully" };
    }),
  }),

  // User management procedures
  users: router({
    getProfile: publicProcedure.input(z.string()).query(({ input: userId }) => {
      return {
        id: userId,
        username: "testuser",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      };
    }),

    updateProfile: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          username: z.string().optional(),
          email: z.string().email().optional(),
        })
      )
      .mutation(({ input }) => {
        return {
          success: true,
          user: {
            id: input.userId,
            username: input.username || "testuser",
            email: input.email || "test@example.com",
          },
        };
      }),
  }),
});

// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
