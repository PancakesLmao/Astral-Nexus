export interface LegacyPost {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
}

export interface LegacyComment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
}

export interface LegacyUser {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
  createdAt: Date
}

export interface CookieOptions {
  domain?: string
  path?: string
  maxAge?: number
  expires?: Date
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
  httpOnly?: boolean
}

export interface User {
  id: string // UUID in database
  username: string // Generated from email in backend
  name?: string
  email?: string
  picture?: string // Discord profile picture
  bio?: string
  created_at?: string
  updated_at?: string
}

export interface Post {
  id: string // UUID in database
  title: string
  content: string
  author: User
  created_at: string
  updated_at?: string
  published?: boolean
  comments_count?: number
  likes_count?: number
  shares_count?: number
  game_category?: string
  post_type?: string
  tags?: string[]
  is_liked?: boolean
  is_bookmarked?: boolean
  visibility?: 'public' | 'private' | 'followers'
}

export interface Comment {
  id: string // UUID 
  content: string
  author: User
  post_id: string // UUID
  parent_comment_id?: string // UUID
  created_at: string
  updated_at?: string
  likes_count?: number
  is_liked?: boolean
  replies?: Comment[]
}

export interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PostsApiResponse {
  success: boolean
  message: string
  data: {
    posts: Post[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  error?: string
}

export interface CommentListResponse {
  comments: Comment[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CreatePostRequest {
  title: string
  content: string
  game_id?: string
  post_type?: string
  tags?: string[]
  visibility?: 'public' | 'private' | 'followers'
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string // UUID
}

export interface CreateCommentRequest {
  content: string
  post_id: string // UUID
  parent_comment_id?: string // UUID
}

export interface PostFilters {
  game_category?: string
  post_type?: string
  author_id?: string // UUID
  tags?: string[]
  search?: string
  sort_by?: 'created_at' | 'likes_count' | 'comments_count'
  sort_order?: 'asc' | 'desc'
}

export interface UserStats {
  posts: number
  following: number
  followers: number
}

export interface Activity {
  id: string
  type: 'like' | 'comment' | 'post' | 'follow'
  text: string
  timestamp: string
}

export interface TrendingHashtag {
  id: number | string
  name: string
  posts_count: number
  trend_score: number
}

export interface SuggestedUser {
  id: string // UUID
  username: string
  name: string
  picture?: string
  followers_count: number
  is_following: boolean
  bio?: string
}

export interface GameCategory {
  id: string
  game_name: string
  created_at: string
}

export interface PopularGame {
  id: string // UUID
  name: string
  icon?: string
  posts_count: number
  category: string
}

export interface GameCategoriesResponse {
  success: boolean
  message: string
  data: {
    categories: GameCategory[]
  }
  error?: string
}
