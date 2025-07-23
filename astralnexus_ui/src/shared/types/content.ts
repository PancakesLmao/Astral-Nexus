export interface TrendingHashtag {
  id: number | string
  name: string
  posts_count: number
  trend_score: number
}

export interface SuggestedUser {
  id: number | string
  username: string
  name: string
  avatar?: string
  followers_count: number
  is_following: boolean
  bio?: string
}

export interface GameCategory {
  id: string
  name: string
  icon: string
}

export interface PopularGame {
  id: number | string
  name: string
  icon?: string
  posts_count: number
  category: string
}
