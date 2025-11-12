import { authRoutes } from "./auth";
import {
  supabaseAuthRoutes,
  supabaseAuthMiddleware,
  requireAuth,
} from "./supabaseAuth";
import { userRoutes } from "./users";
import { appRoutes } from "./app";
import { commentRoutes } from "./comments";
import { dbRoutes } from "./database";
import { postsRoutes } from "./posts";
import { gameCategoriesRoutes } from "./gameCategories";
import { notificationsRoutes } from "./notifications";
import { adminRoutes } from "./admin";

// Export all routes
export {
  authRoutes,
  supabaseAuthRoutes,
  supabaseAuthMiddleware,
  requireAuth,
  userRoutes,
  appRoutes,
  commentRoutes,
  dbRoutes,
  postsRoutes,
  gameCategoriesRoutes,
  notificationsRoutes,
  adminRoutes,
};
