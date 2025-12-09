<h1 align="center">Astral Nexus - Blog Platform</h1>
<p align="center">A blog platform about Hoyo games for the community</p>

<div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
    <img src="https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/VueJS-Dark.svg" height="45" alt="vue logo" />
    <img width="12" />
    <img src="https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg" height="45" alt="typescript logo" />
    <img width="12" />
    <img src="https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TailwindCSS-Dark.svg" height="45" alt="tailwind logo" />
    <img width="12" />
    <img src="https://elysiajs.com/assets/elysia.svg" height="45" alt="elysia logo" />
</div>

## Documentation

- **[API Routes Documentation](./docs/API_ROUTES.md)** - Complete API endpoint reference and route organization
- **[Naming Conventions Guide](./docs/NAMING_CONVENTIONS.md)** - Comprehensive guide for naming standards across all layers (database, APIs, types, components)
- **[Authentication Details](./docs/auth-detailed/README.md)** - In-depth authentication flows, PKCE implementation, session management
- **[User Actions](./docs/user-action/README.md)** - Post creation, liking system, and comment workflows

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (for local development)
- [Bun](https://bun.sh/) (for backend development)
- [pnpm](https://pnpm.io/) (for frontend development)

### Quick Start

```bash
# Start all services in production mode
docker compose up --build -d

# Access the application
# Frontend: http://localtest.me
# Blog: http://blog.localtest.me
# Admin: http://admin.localtest.me
# Backend API: http://api.localtest.me / http://localtest.me:3001
```

### Local Development Setup

#### Frontend (astralnexus_ui)

```bash
# Navigate to frontend directory
cd astralnexus_ui

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

**Frontend URLs:**

- Root: http://localtest.me:3000
- Blog: http://blog.localtest.me:3000
- Admin: http://admin.localtest.me:3000

#### Backend (astralnexus_be)

```bash
# Navigate to backend directory
cd astralnexus_be

# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

**Backend URL:**

- http://api.localtest.me:3001 / http://localtest.me:3001
- API documentation will be available at `/swagger` endpoint when running in development mode.

### Important Notes

⚠️ **Subdomain Configuration Required**

This project uses subdomain routing. You must use the `.localtest.me` domains for proper functionality:

### Environment Configuration

Create a `.env` file in the backend root directory with:

```env
# Application
NODE_ENV=development

# Database
DATABASE_URL=postgresql://<username>:<password>@<db_endpoint>/<database_name>
# PostgreSQL Configuration for Docker
POSTGRES_LOG_STATEMENT=all
POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C

# CORS
CORS_ORIGIN=http://localtest.me:3000,http://blog.localtest.me:3000,http://admin.localtest.me:3000

# Session
SESSION_DOMAIN=.localtest.me

# Supabase Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
Create a .env.local file in the frontend root directory with:

```env
NODE_ENV=development
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=supabase_anon_key_here

VITE_APP_URL=http://localtest.me:3000
VITE_BLOG_URL=http://blog.localtest.me:3000
VITE_ADMIN_URL=http://admin.localtest.me:3000
```

### Quick Setup:

1. **Create Supabase Project**: Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Configure Discord OAuth**: Enable Discord provider in Supabase Auth settings
3. **Set Environment Variables**: Add Supabase keys to your `.env` files

#### Authentication

This project uses **Supabase Auth** for authentication with Discord OAuth integration.
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable "Discord" and provide your Discord OAuth credentials
4. Go to Discord Developer Portal > Create an application > OAuth2.0 and set the redirect URI to `https://your-project.supabase.co/auth/v1/callback`
