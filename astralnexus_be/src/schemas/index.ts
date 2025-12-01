import { t } from "elysia";

export const Schemas = {
  // ============ User Schemas ============
  User: t.Object(
    {
      id: t.String({
        description: "Unique user identifier",
        format: "uuid",
      }),
      email: t.String({
        description: "User email address",
        format: "email",
      }),
      name: t.String({
        description: "User full name",
        minLength: 1,
        maxLength: 255,
      }),
      picture: t.Optional(
        t.String({
          description: "User profile picture URL",
          format: "uri",
        })
      ),
      provider: t.String({
        description: "Authentication provider (discord, google, github, etc.)",
        minLength: 1,
        maxLength: 50,
      }),
      createdAt: t.String({
        description: "Account creation timestamp",
        format: "date-time",
      }),
      updatedAt: t.String({
        description: "Last account update timestamp",
        format: "date-time",
      }),
    },
    {
      description: "Complete user object with authentication details",
    }
  ),

  // ============ Post Author Schema ============
  PostAuthor: t.Object(
    {
      id: t.String({
        description: "Author user ID",
        format: "uuid",
      }),
      username: t.String({
        description: "Author username",
        minLength: 1,
        maxLength: 100,
      }),
      name: t.String({
        description: "Author full name",
        minLength: 1,
        maxLength: 255,
      }),
      email: t.String({
        description: "Author email address",
        format: "email",
      }),
      picture: t.Optional(
        t.String({
          description: "Author profile picture URL",
          format: "uri",
        })
      ),
      bio: t.Optional(
        t.String({
          description: "Author biography",
          maxLength: 500,
        })
      ),
      createdAt: t.String({
        description: "Author account creation timestamp",
        format: "date-time",
      }),
    },
    {
      description: "Simplified user object for post display",
    }
  ),

  // ============ Post Schema ============
  Post: t.Object(
    {
      id: t.String({
        description: "Unique post identifier",
        format: "uuid",
      }),
      title: t.String({
        description: "Post title",
        minLength: 1,
        maxLength: 500,
      }),
      content: t.String({
        description: "Post content/body",
        minLength: 1,
      }),
      author: t.Object({
        id: t.String({
          description: "Author user ID",
          format: "uuid",
        }),
        username: t.String({
          description: "Author username",
          minLength: 1,
          maxLength: 100,
        }),
        name: t.String({
          description: "Author full name",
          minLength: 1,
          maxLength: 255,
        }),
        email: t.String({
          description: "Author email address",
          format: "email",
        }),
        picture: t.Optional(
          t.String({
            description: "Author profile picture URL",
            format: "uri",
          })
        ),
        bio: t.Optional(
          t.String({
            description: "Author biography",
            maxLength: 500,
          })
        ),
        createdAt: t.String({
          description: "Author account creation timestamp",
          format: "date-time",
        }),
      }),
      author_id: t.String({
        description: "Author user ID",
        format: "uuid",
      }),
      game_id: t.Optional(
        t.String({
          description: "Associated game category ID",
          format: "uuid",
        })
      ),
      post_type: t.Optional(
        t.String({
          description: "Type of post",
          minLength: 1,
          maxLength: 50,
        })
      ),
      tags: t.Optional(
        t.Array(
          t.String({
            maxLength: 50,
          }),
          {
            description: "Post tags",
            maxItems: 10,
          }
        )
      ),
      visibility: t.String({
        description: "Post visibility level",
        minLength: 1,
        maxLength: 20,
      }),
      published: t.Boolean({
        description: "Whether the post is published",
        default: true,
      }),
      likes_count: t.Number({
        description: "Number of likes on the post",
        minimum: 0,
        default: 0,
      }),
      comments_count: t.Number({
        description: "Number of comments on the post",
        minimum: 0,
        default: 0,
      }),
      isLiked: t.Optional(
        t.Boolean({
          description: "Whether the current user has liked this post",
        })
      ),
      created_at: t.String({
        description: "Post creation timestamp",
        format: "date-time",
      }),
      createdAt: t.String({
        description: "Post creation timestamp",
        format: "date-time",
      }),
      updated_at: t.String({
        description: "Post last update timestamp",
        format: "date-time",
      }),
      updatedAt: t.String({
        description: "Post last update timestamp",
        format: "date-time",
      }),
    },
    {
      description: "Complete post object with author and engagement metrics",
    }
  ),

  // ============ Comment Author Schema ============
  CommentAuthor: t.Object(
    {
      id: t.String({
        description: "Comment author user ID",
        format: "uuid",
      }),
      name: t.String({
        description: "Comment author full name",
        minLength: 1,
        maxLength: 255,
      }),
      email: t.String({
        description: "Comment author email address",
        format: "email",
      }),
      picture: t.Optional(
        t.String({
          description: "Comment author profile picture URL",
          format: "uri",
        })
      ),
    },
    {
      description: "Simplified user object for comment display",
    }
  ),

  // ============ Comment Schema ============
  Comment: t.Object(
    {
      id: t.String({
        description: "Unique comment identifier",
        format: "uuid",
      }),
      content: t.String({
        description: "Comment content",
        minLength: 1,
        maxLength: 5000,
      }),
      author: t.Object({
        id: t.String({
          description: "Comment author user ID",
          format: "uuid",
        }),
        name: t.String({
          description: "Comment author full name",
          minLength: 1,
          maxLength: 255,
        }),
        email: t.String({
          description: "Comment author email address",
          format: "email",
        }),
        picture: t.Optional(
          t.String({
            description: "Comment author profile picture URL",
            format: "uri",
          })
        ),
      }),
      author_id: t.String({
        description: "Comment author user ID",
        format: "uuid",
      }),
      post_id: t.String({
        description: "Associated post ID",
        format: "uuid",
      }),
      likes_count: t.Number({
        description: "Number of likes on the comment",
        minimum: 0,
        default: 0,
      }),
      isLiked: t.Optional(
        t.Boolean({
          description: "Whether the current user has liked this comment",
        })
      ),
      created_at: t.String({
        description: "Comment creation timestamp",
        format: "date-time",
      }),
      createdAt: t.String({
        description: "Comment creation timestamp",
        format: "date-time",
      }),
      updated_at: t.String({
        description: "Comment last update timestamp",
        format: "date-time",
      }),
      updatedAt: t.String({
        description: "Comment last update timestamp",
        format: "date-time",
      }),
    },
    {
      description: "Complete comment object with author and engagement metrics",
    }
  ),

  // ============ Notification Schema ============
  Notification: t.Object(
    {
      id: t.String({
        description: "Unique notification identifier",
        format: "uuid",
      }),
      type: t.Enum(
        {
          like: "like",
          comment: "comment",
          follow: "follow",
          mention: "mention",
          system: "system",
        },
        {
          description: "Notification type",
        }
      ),
      title: t.String({
        description: "Notification title",
        minLength: 1,
        maxLength: 200,
      }),
      message: t.String({
        description: "Notification message content",
        minLength: 1,
        maxLength: 1000,
      }),
      read: t.Boolean({
        description: "Whether the notification has been read",
        default: false,
      }),
      createdAt: t.String({
        description: "Notification creation timestamp",
        format: "date-time",
      }),
    },
    {
      description: "User notification object",
    }
  ),

  // ============ Game Category Schema ============
  GameCategory: t.Object(
    {
      id: t.String({
        description: "Unique game category identifier",
        format: "uuid",
      }),
      game_name: t.String({
        description: "Game category name",
        minLength: 1,
        maxLength: 255,
      }),
      createdAt: t.String({
        description: "Category creation timestamp",
        format: "date-time",
      }),
    },
    {
      description: "Game category for organizing posts",
    }
  ),

  // ============ Create Post Request Schema ============
  CreatePost: t.Object(
    {
      title: t.String({
        description: "Post title",
        minLength: 1,
        maxLength: 500,
      }),
      content: t.String({
        description: "Post content/body",
        minLength: 1,
      }),
      game_id: t.Optional(
        t.String({
          description: "Associated game category ID",
          format: "uuid",
        })
      ),
      post_type: t.Optional(
        t.String({
          description: "Type of post (any string value)",
          minLength: 1,
          maxLength: 50,
        })
      ),
      tags: t.Optional(
        t.Array(
          t.String({
            maxLength: 50,
          }),
          {
            description: "Post tags",
            maxItems: 10,
          }
        )
      ),
      visibility: t.Optional(
        t.String({
          description: "Post visibility level",
          minLength: 1,
          maxLength: 20,
        })
      ),
      published: t.Optional(
        t.Boolean({
          description: "Whether to publish the post",
          default: true,
        })
      ),
    },
    {
      description: "Request body for creating a new post",
    }
  ),

  // ============ Update Post Request Schema ============
  UpdatePost: t.Object(
    {
      title: t.Optional(
        t.String({
          description: "Updated post title",
          minLength: 1,
          maxLength: 500,
        })
      ),
      content: t.Optional(
        t.String({
          description: "Updated post content/body",
          minLength: 1,
        })
      ),
      game_id: t.Optional(
        t.String({
          description: "Updated game category ID",
          format: "uuid",
        })
      ),
      post_type: t.Optional(
        t.String({
          description: "Updated post type (any string value)",
          minLength: 1,
          maxLength: 50,
        })
      ),
      tags: t.Optional(
        t.Array(
          t.String({
            maxLength: 50,
          }),
          {
            description: "Updated post tags",
            maxItems: 10,
          }
        )
      ),
      visibility: t.Optional(
        t.String({
          description: "Updated visibility level",
          minLength: 1,
          maxLength: 20,
        })
      ),
      published: t.Optional(
        t.Boolean({
          description: "Updated publication status",
        })
      ),
    },
    {
      description: "Request body for updating an existing post (all fields optional)",
    }
  ),

  // ============ Create Comment Request Schema ============
  CreateComment: t.Object(
    {
      content: t.String({
        description: "Comment content",
        minLength: 1,
        maxLength: 5000,
      }),
      postId: t.String({
        description: "ID of the post to comment on",
        format: "uuid",
      }),
    },
    {
      description: "Request body for creating a new comment",
    }
  ),

  // ============ Update Comment Request Schema ============
  UpdateComment: t.Object(
    {
      content: t.String({
        description: "Updated comment content",
        minLength: 1,
        maxLength: 5000,
      }),
    },
    {
      description: "Request body for updating a comment",
    }
  ),

  // ============ Comments List Response Schema ============
  CommentsListResponse: t.Object(
    {
      success: t.Literal(true, {
        description: "Response success flag",
      }),
      data: t.Array(t.Ref("Comment")),
      message: t.String({
        description: "Response message",
      }),
    },
    {
      description: "List of comments for a post with pagination support",
    }
  ),

  // ============ Comment Count Response Schema ============
  CommentCountResponse: t.Object(
    {
      success: t.Literal(true, {
        description: "Response success flag",
      }),
      data: t.Object(
        {
          count: t.Number({
            description: "Number of comments",
            minimum: 0,
            int: true,
          }),
        },
        {
          description: "Comment count data",
        }
      ),
      message: t.String({
        description: "Response message",
      }),
    },
    {
      description: "Comment count response",
    }
  ),

  // ============ Like/Unlike Response Schema ============
  LikeResponse: t.Object(
    {
      success: t.Literal(true, {
        description: "Response success flag",
      }),
      message: t.String({
        description: "Action message",
      }),
      data: t.Optional(
        t.Object(
          {
            action: t.Union([t.Literal("liked"), t.Literal("unliked")]),
          },
          {
            description: "Like/unlike action result",
          }
        )
      ),
    },
    {
      description: "Like/unlike response indicating success",
    }
  ),

  // ============ Comment Operation Response Schema ============
  CommentResponse: t.Object(
    {
      success: t.Literal(true, {
        description: "Response success flag",
      }),
      data: t.Ref("Comment"),
      message: t.String({
        description: "Operation message",
      }),
    },
    {
      description: "Comment operation response (create, update, etc.)",
    }
  ),

  // ============ Error Response Schema ============
  ErrorResponse: t.Object(
    {
      success: t.Literal(false, {
        description: "Response success flag",
      }),
      error: t.String({
        description: "Error message",
        minLength: 1,
      }),
    },
    {
      description: "Standard error response object",
    }
  ),

  // ============ Success Response Schema ============
  SuccessResponse: t.Object(
    {
      success: t.Literal(true, {
        description: "Response success flag",
      }),
      message: t.String({
        description: "Success message",
        minLength: 1,
      }),
    },
    {
      description: "Standard success response object",
    }
  ),

  // ============ Pagination Schema ============
  Pagination: t.Object(
    {
      page: t.Number({
        description: "Current page number",
        minimum: 1,
        int: true,
      }),
      limit: t.Number({
        description: "Items per page",
        minimum: 1,
        maximum: 100,
        int: true,
      }),
      total: t.Number({
        description: "Total number of items",
        minimum: 0,
        int: true,
      }),
      totalPages: t.Number({
        description: "Total number of pages",
        minimum: 0,
        int: true,
      }),
      hasNext: t.Boolean({
        description: "Whether there is a next page",
      }),
      hasPrev: t.Boolean({
        description: "Whether there is a previous page",
      }),
    },
    {
      description: "Pagination metadata for list responses",
    }
  ),

  // ============ Auth Response Schemas ============
  UserResponse: t.Object(
    {
      success: t.Literal(true, {
        description: "Response success flag",
      }),
      user: t.Ref("User"),
    },
    {
      description: "Successful user authentication response",
    }
  ),

  NotAuthenticatedError: t.Object(
    {
      success: t.Literal(false, {
        description: "Response success flag",
      }),
      error: t.Literal("Not authenticated", {
        description: "Error message",
      }),
    },
    {
      description: "Not authenticated error response",
    }
  ),

  InternalServerError: t.Object(
    {
      success: t.Literal(false, {
        description: "Response success flag",
      }),
      error: t.Literal("Internal server error", {
        description: "Error message",
      }),
    },
    {
      description: "Internal server error response",
    }
  ),

  LogoutResponse: t.Object(
    {
      success: t.Literal(true, {
        description: "Response success flag",
      }),
      message: t.Literal("Logged out successfully", {
        description: "Success message",
      }),
    },
    {
      description: "Successful logout response",
    }
  ),

  LogoutError: t.Object(
    {
      success: t.Literal(false, {
        description: "Response success flag",
      }),
      error: t.Literal("Logout failed", {
        description: "Error message",
      }),
    },
    {
      description: "Logout error response",
    }
  ),
};
