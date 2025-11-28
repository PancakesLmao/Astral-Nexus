import { Elysia, t } from "elysia";
import { queryAll } from "../utils/database";
import { Schemas } from "../schemas";

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
        createdAt: new Date(category.created_at).toISOString(),
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
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  {
    response: t.Object({
      success: t.Boolean(),
      message: t.String(),
      data: t.Object({
        categories: t.Array(Schemas.GameCategory),
      }),
      error: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Game Categories"],
      summary: "Get all game categories",
      description:
        "Retrieve a list of all available game categories sorted alphabetically. Includes UUID for API calls and human-readable names for display.",
      responses: {
        200: {
          description: "Successfully retrieved all game categories",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      categories: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/GameCategory",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error while fetching game categories",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InternalServerError",
              },
            },
          },
        },
      },
    },
  }
);
