import { Elysia, t } from "elysia";
import { queryAll } from "../utils/database";

// Game Category response schemas for Swagger documentation
const GameCategorySchema = t.Object({
  id: t.String({
    format: "uuid",
    description: "Game category unique identifier",
  }),
  game_name: t.String({ description: "Game category display name" }),
  created_at: t.String({
    format: "date-time",
    description: "Category creation timestamp",
  }),
});

const GameCategoriesListResponse = t.Object({
  success: t.Boolean({ description: "Request success status" }),
  message: t.String({ description: "Response message" }),
  data: t.Object({
    categories: t.Array(GameCategorySchema),
  }),
});

// Game Categories API routes
export const gameCategoriesRoutes = new Elysia({
  prefix: "/api/game-categories",
}).get(
  "/",
  async () => {
    try {
      const categoriesQuery = `
          SELECT 
            id,
            game_name,
            created_at
          FROM game_categories
          ORDER BY game_name ASC
        `;

      const categories = await queryAll(categoriesQuery, []);

      // Transform categories to match frontend format
      const transformedCategories = categories.map((category: any) => ({
        id: category.id,
        game_name: category.game_name,
        created_at: new Date(category.created_at).toISOString(),
      }));

      return {
        success: true,
        message: "Game categories retrieved successfully",
        data: {
          categories: transformedCategories,
        },
      };
    } catch (error) {
      console.error("Error fetching game categories:", error);
      return {
        success: false,
        message: "Failed to fetch game categories",
        data: {
          categories: [],
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  {
    response: GameCategoriesListResponse,
    detail: {
      tags: ["Game Categories"],
      summary: "Get all game categories",
      description: `
        Retrieve a list of all available game categories (a-z).
        Includes UUID for API calls and human-readable names for display
        `,
    },
  }
);
