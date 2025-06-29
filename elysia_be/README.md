# Elysian Realm API

A well-organized Elysia.js API with tRPC integration, featuring modular architecture, comprehensive documentation, and type safety.

## 📁 Project Structure

```
elysia_be/
├── src/
│   ├── config/          # Configuration files
│   │   ├── app.ts       # Application configuration
│   │   └── database.ts  # Database configuration
│   ├── middleware/      # Custom middleware
│   │   └── index.ts     # Logger, CORS, Error handling
│   ├── routes/          # API route handlers
│   │   ├── index.ts     # Route exports
│   │   ├── app.ts       # Application routes
│   │   ├── auth.ts      # Authentication routes
│   │   └── users.ts     # User management routes
│   ├── trpc/           # tRPC configuration
│   │   └── router.ts    # tRPC router and procedures
│   ├── utils/          # Utility functions
│   │   ├── auth.ts      # Authentication utilities
│   │   └── helpers.ts   # General helper functions
│   └── index.ts        # Main application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Navigate to the backend directory:

   ```bash
   cd elysia_be
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables (optional):

   ```bash
   cp .env.example .env
   ```

   Configure the following variables:

   ```env
   PORT=3000
   HOST=localhost
   NODE_ENV=development
   JWT_SECRET=your-super-secret-key
   CORS_ORIGIN=*
   ```

### Running the Application

#### Development Mode

```bash
pnpm dev
```

#### Production Build

```bash
pnpm build
pnpm start
```

## 📡 API Endpoints

### Base URL: `http://localhost:3000`

### Application Endpoints (`/`)

- **GET** `/` - Welcome message and API info
- **GET** `/health` - Health check endpoint
- **GET** `/version` - API version information

### Authentication Endpoints (`/auth`)

- **POST** `/auth/login` - User login

  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```

- **POST** `/auth/register` - User registration

  ```json
  {
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

- **POST** `/auth/logout` - User logout

### User Management Endpoints (`/users`)

- **GET** `/users/profile/:id` - Get user profile by ID
- **PUT** `/users/profile/:id` - Update user profile
- **GET** `/users?page=1&limit=10` - Get paginated users list

## 🔗 tRPC Integration

### Base URL: `http://localhost:3000/trpc`

tRPC provides end-to-end type safety and better developer experience.

#### Available Procedures

##### Queries (GET operations)

- `hello` - Simple greeting procedure
- `users.getProfile` - Get user profile

##### Mutations (POST/PUT/DELETE operations)

- `auth.login` - User authentication
- `auth.register` - User registration
- `auth.logout` - User logout
- `users.updateProfile` - Update user information

#### Example tRPC Usage

```typescript
// Client-side usage (with @trpc/client)
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./path/to/server/trpc/router";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Use the procedures
const greeting = await trpc.hello.query("World");
const user = await trpc.auth.login.mutate({
  username: "admin",
  password: "password",
});
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**URL**: `http://localhost:3000/swagger`

The documentation includes:

- Complete endpoint descriptions
- Request/response schemas
- Interactive testing interface
- Authentication examples
- Error response formats

## 🏗️ Architecture Overview

### Configuration (`/config`)

- **app.ts**: Application settings, API configuration, CORS, JWT settings
- **database.ts**: Database connection configuration

### Middleware (`/middleware`)

- **Logger**: Request/response logging
- **CORS**: Cross-Origin Resource Sharing configuration
- **Error Handler**: Global error handling and formatting

### Routes (`/routes`)

- **Modular Structure**: Each feature has its own route file
- **Tagged Endpoints**: Organized with Swagger tags for documentation
- **Type Validation**: Input validation using Elysia's built-in validation

### tRPC (`/trpc`)

- **Type Safety**: End-to-end TypeScript type inference
- **Input Validation**: Using Zod schemas
- **Procedure Types**: Queries for read operations, Mutations for write operations

### Utilities (`/utils`)

- **auth.ts**: JWT utilities, password hashing, validation helpers
- **helpers.ts**: Response formatting, date/string utilities

## 🔒 Security Features

- **Input Validation**: All endpoints validate input data
- **CORS Configuration**: Configurable cross-origin settings
- **Error Handling**: Secure error responses without sensitive data exposure
- **Type Safety**: TypeScript ensures type correctness throughout the application

## 🧪 Testing

To test the API endpoints:

1. **Using curl**:

   ```bash
   # Health check
   curl http://localhost:3000/health

   # Login
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'
   ```

2. **Using the Swagger UI**: Visit `http://localhost:3000/swagger`

3. **Using tRPC endpoints**: Send POST requests to `/trpc/[procedure-name]`

## 🛠️ Development

### Adding New Endpoints

1. **REST Endpoints**: Add to appropriate route file in `/routes`
2. **tRPC Procedures**: Add to `/trpc/router.ts`
3. **Middleware**: Add to `/middleware/index.ts`
4. **Utilities**: Add to `/utils/` directory

### Environment Configuration

The application supports various environment configurations through the `/config` directory. Modify these files to customize:

- Server settings (port, host)
- Database connections
- CORS policies
- JWT configuration
- API versioning

## 📈 Performance

- **Efficient Routing**: Modular route organization
- **Middleware Optimization**: Lightweight middleware chain
- **Type Safety**: Compile-time error detection
- **Request Validation**: Early input validation to prevent processing invalid data

## 🤝 Contributing

1. Follow the existing folder structure
2. Add appropriate TypeScript types
3. Include Swagger documentation for new endpoints
4. Add tRPC procedures for type-safe operations
5. Update this README when adding new features

## 📝 License

This project is part of the COS30043 Interface Design course at Swinburne University.

## Open API documentation

Open your browser and navigate to `http://localhost:3000/swagger` to access the API documentation.
