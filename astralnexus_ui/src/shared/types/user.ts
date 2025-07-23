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
