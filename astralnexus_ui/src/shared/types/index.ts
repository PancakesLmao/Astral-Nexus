export interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
}

export interface User {
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
