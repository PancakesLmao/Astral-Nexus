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

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (for local development)
- [Bun](https://bun.sh/) (for backend development)
- [pnpm](https://pnpm.io/) (for frontend development)

### Quick Start - Docker (Recommended)

For Docker-based development (recommended), see [DOCKER_DEVELOPMENT.md](./DOCKER_DEVELOPMENT.md)

```bash
# Start all services in production mode
docker compose up --build -d

# Access the application
# Frontend: http://localtest.me:3000
# Blog: http://blog.localtest.me:3000
# Admin: http://admin.localtest.me:3000
# Backend API: http://api.localtest.me:3001
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

- API: http://api.localtest.me:3001

### Important Notes

⚠️ **Subdomain Configuration Required**

This project uses subdomain routing. You must use the `.localtest.me` domains for proper functionality:

- **Frontend Root**: `http://localtest.me:3000`
- **Frontend Blog**: `http://blog.localtest.me:3000`
- **Frontend Admin**: `http://admin.localtest.me:3000`
- **Backend API**: `http://api.localtest.me:3001`

### Environment Configuration

Create a `.env` file in the root directory with:

```env
# Application
NODE_ENV=development
PORT=3001
VITE_API_BASE_URL=http://api.localtest.me:3001

# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=astralnexus

# CORS
CORS_ORIGIN=http://localtest.me:3000,http://blog.localtest.me:3000,http://admin.localtest.me:3000

# Session
SESSION_SECRET=your_super_secret_session_key_here
SESSION_DOMAIN=.localtest.me

# Supabase Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OAuth (Legacy - keeping for reference)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://api.localtest.me:3001/auth/discord/callback
```

## Authentication Setup

This project uses **Supabase Auth** for authentication with Discord OAuth integration.

### Quick Setup:

1. **Create Supabase Project**: Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Configure Discord OAuth**: Enable Discord provider in Supabase Auth settings
3. **Set Environment Variables**: Add Supabase keys to your `.env` files
4. **Remove Old Edge Functions**: Clean up any existing authentication edge functions
