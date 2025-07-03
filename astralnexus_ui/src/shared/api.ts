// Eden API client configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// API client setup will go here
export class ApiClient {
  constructor(private baseUrl: string = API_BASE_URL) {}

  // API methods will be implemented here
}
