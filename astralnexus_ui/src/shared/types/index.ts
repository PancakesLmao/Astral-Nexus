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
