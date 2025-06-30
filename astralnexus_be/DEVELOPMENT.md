# Development Guide - Elysian Realm API

## 📋 Quick Reference

### Server Information

- **Development URL**: `http://localhost:3001`
- **Swagger Documentation**: `http://localhost:3001/swagger`
- **tRPC Endpoint**: `http://localhost:3001/trpc`

### Project Status

✅ **Organized folder structure**
✅ **tRPC integration with type safety**
✅ **Swagger documentation with tags**
✅ **Modular route architecture**
✅ **Middleware implementation**
✅ **Configuration management**
✅ **Utility functions**

## 🎯 What You Have Now

### 1. **Organized Architecture**

```
src/
├── config/     → Application & database configuration
├── middleware/ → CORS, logging, error handling
├── routes/     → Modular REST API endpoints
├── trpc/       → Type-safe RPC procedures
├── utils/      → Helper functions & utilities
└── index.ts    → Main application entry
```

### 2. **REST API Endpoints**

| Method | Endpoint             | Description            | Tag   |
| ------ | -------------------- | ---------------------- | ----- |
| GET    | `/`                  | API welcome message    | App   |
| GET    | `/health`            | Health check           | App   |
| GET    | `/version`           | Version info           | App   |
| POST   | `/auth/login`        | User authentication    | Auth  |
| POST   | `/auth/register`     | User registration      | Auth  |
| POST   | `/auth/logout`       | User logout            | Auth  |
| GET    | `/users/profile/:id` | Get user profile       | Users |
| PUT    | `/users/profile/:id` | Update user profile    | Users |
| GET    | `/users`             | List users (paginated) | Users |

### 3. **tRPC Procedures**

| Type     | Procedure             | Description         |
| -------- | --------------------- | ------------------- |
| Query    | `hello`               | Simple greeting     |
| Mutation | `auth.login`          | User login          |
| Mutation | `auth.register`       | User registration   |
| Mutation | `auth.logout`         | User logout         |
| Query    | `users.getProfile`    | Get user profile    |
| Mutation | `users.updateProfile` | Update user profile |

## 🚀 How to Use This Setup

### 1. **Testing the API**

#### Using Swagger UI

1. Open `http://localhost:3001/swagger`
2. Navigate through the organized tags (App, Auth, Users)
3. Test endpoints directly in the browser

#### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get user profile
curl http://localhost:3001/users/profile/1
```

#### Using tRPC

```bash
# Hello query
curl -X POST http://localhost:3001/trpc/hello \
  -H "Content-Type: application/json" \
  -d '{"input":"World"}'

# Auth login mutation
curl -X POST http://localhost:3001/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### 2. **Adding New Features**

#### Adding a New REST Endpoint

1. Open the appropriate route file (e.g., `src/routes/users.ts`)
2. Add your endpoint with proper typing:

```typescript
.post('/new-endpoint', ({ body }) => {
  // Your logic here
  return { success: true };
}, {
  body: t.Object({
    // Define your input schema
  }),
  detail: {
    tags: ['Users'],
    summary: 'Your endpoint description'
  }
})
```

#### Adding a New tRPC Procedure

1. Open `src/trpc/router.ts`
2. Add to the appropriate router:

```typescript
newProcedure: publicProcedure
  .input(
    z.object({
      // Your input schema
    })
  )
  .mutation(({ input }) => {
    // Your logic here
    return { success: true };
  });
```

### 3. **Configuration**

#### Environment Variables

Create `.env` file based on `.env.example`:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
```

#### App Configuration

Modify `src/config/app.ts` for:

- Server settings
- API paths
- CORS policies
- JWT settings

## 🔧 Development Workflow

### 1. **Start Development**

```bash
cd elysia_be
pnpm dev
```

### 2. **Check API Documentation**

Visit `http://localhost:3001/swagger`

### 3. **Test Endpoints**

- Use Swagger UI for interactive testing
- Use curl/Postman for manual testing
- Write unit tests for automated testing

### 4. **Monitor Logs**

The server logs all requests and responses in the terminal.

## 🎨 Customization

### 1. **Swagger Tags**

Add new tags in `src/index.ts`:

```typescript
tags: [{ name: "NewFeature", description: "New feature endpoints" }];
```

### 2. **Middleware**

Add custom middleware in `src/middleware/index.ts`:

```typescript
export const customMiddleware = new Elysia({ name: "custom" }).onRequest(
  ({ request }) => {
    // Your custom logic
  }
);
```

### 3. **Utilities**

Add helper functions in `src/utils/`:

- `auth.ts` for authentication utilities
- `helpers.ts` for general utilities
- Create new files for specific features

## 🚦 Next Steps

### Immediate Tasks

1. **Database Integration**: Set up your preferred database (PostgreSQL, MongoDB, etc.)
2. **Authentication**: Implement real JWT tokens and password hashing
3. **Validation**: Enhance input validation and error messages
4. **Testing**: Add unit and integration tests

### Advanced Features

1. **Rate Limiting**: Implement API rate limiting
2. **Caching**: Add Redis for caching
3. **File Upload**: Implement file upload endpoints
4. **Real-time**: Add WebSocket support
5. **Monitoring**: Add logging and metrics

### Frontend Integration

1. **tRPC Client**: Set up tRPC client in your Vue.js frontend
2. **Type Safety**: Share types between frontend and backend
3. **API Client**: Create typed API client for REST endpoints

## 📞 Support

### Common Issues

1. **Port in use**: Change port in `src/config/app.ts`
2. **CORS errors**: Update CORS settings in middleware
3. **Type errors**: Check TypeScript configuration

### Resources

- [Elysia Documentation](https://elysiajs.com/)
- [tRPC Documentation](https://trpc.io/)
- [Swagger/OpenAPI](https://swagger.io/)

Your API is now well-organized, documented, and ready for development! 🎉
