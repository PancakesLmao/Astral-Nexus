<div align="center">
    <img src="https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Docker.svg" height="80" alt="Docker logo" />
    <h2>Complete Docker Development Setup</h2>
    <p>Everything you need to run Astral Nexus in a containerized development environment</p>
</div>

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Development Workflow](#development-workflow)
5. [Available Services](#available-services)
6. [Common Commands](#common-commands)
7. [Development Features](#development-features)
8. [Troubleshooting](#troubleshooting)
9. [OAuth Setup](#oauth-setup)
10. [Advanced Usage](#advanced-usage)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (recommended) or **Docker Engine**
  - [Download for Windows](https://docs.docker.com/desktop/windows/install/)
  - [Download for macOS](https://docs.docker.com/desktop/mac/install/)
  - [Install on Linux](https://docs.docker.com/engine/install/)
- **Docker Compose** (included with Docker Desktop)
- **Git** for cloning the repository

### System Requirements

- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: At least 2GB free space
- **Ports**: 3000, 3001, 5432, 24678 must be available

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PancakesLmao/Astral-Nexus.git
cd Astral-Nexus
```

### 2. Configure Environment Variables

```bash
# The .env file contains all necessary environment variables
# Update OAuth credentials for full functionality (optional for basic development)
```

### 3. Start the Development Environment

```bash
# Build and start all services
docker compose up --build -d

# Or start with logs visible
docker compose up --build
```

### 4. Access the Application

- **Frontend**: http://localtest.me:3000
- **Backend API**: http://api.localtest.me:3001
- **Database**: localhost:5432 (for external tools)
- **Vite HMR**: Port 24678 (automatically handled)

### 5. Verify Everything is Running

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Test backend health
curl http://api.localtest.me:3001/health
```

## ⚙️ Environment Configuration

All configuration is centralized in the `.env` file. Here's what each section controls:

### Application Settings

```env
NODE_ENV=development              # Environment mode
PORT=3001                         # Backend port
VITE_API_BASE_URL=http://api.localtest.me:3001  # Frontend API URL
```

### Database Configuration

```env
DATABASE_URL=postgresql://admin:admin@astralnexus_db:5432/astralnexus
POSTGRES_USER=<username>          # Database username
POSTGRES_PASSWORD=<password>      # Database password
POSTGRES_DB=astralnexus     # Database name
```

### OAuth Configuration

```env
# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Discord OAuth - Get from Discord Developer Portal
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3001/auth/discord/callback
```

### Security & CORS

```env
SESSION_SECRET=your_super_secret_session_key_here_at_least_32_characters_long_development
CORS_ORIGINS=http://localhost:3000,http://localtest.me:3000,http://blog.localtest.me:3000,http://admin.localtest.me:3000
```

## Development Workflow

### Making Code Changes

1. **Frontend Changes** (`astralnexus_ui/`)

   - Edit files in your IDE
   - Changes are automatically reflected via Vite HMR
   - Browser automatically refreshes

2. **Backend Changes** (`astralnexus_be/`)

   - Edit files in your IDE
   - Bun automatically restarts the server
   - API changes are immediately available

3. **Database Changes**
   - Modify `astralnexus_be/init.sql` for schema changes
   - Restart the database service: `docker compose restart astralnexus_db`

### Development Cycle

```bash
# 1. Make your changes in the code
# 2. Changes are automatically applied (hot reloading)
# 3. Test your changes at http://localtest.me:3000
# 4. Check logs if needed
docker compose logs -f astralnexus_ui
docker compose logs -f astralnexus_be

# 5. Commit your changes when ready
git add .
git commit -m "Your changes"
```

## Services

### Frontend Service (`astralnexus_ui`)

- **Technology**: Vue.js 3 + TypeScript + Vite
- **Port**: 3000 (main), 24678 (HMR)
- **Build Target**: Development mode with source maps

### Backend Service (`astralnexus_be`)

- **Technology**: Bun + Elysia.js + TypeScript
- **Port**: 3001
- **Database**: PostgreSQL connection

### Database Service (`astralnexus_db`)

- **Technology**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Volume**: `astral-nexus-dev_astralnexus_db_data`

## Common Commands

### Starting and Stopping

```bash
# Start all services (detached mode)
docker compose up -d

# Start with logs visible
docker compose up

# Start with fresh build
docker compose up --build -d

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: deletes database data)
docker compose down -v
```

### Monitoring and Debugging

```bash
# View status of all services
docker compose ps

# View logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f astralnexus_ui
docker compose logs -f astralnexus_be
docker compose logs -f astralnexus_db

# Execute commands in running containers
docker compose exec astralnexus_be bash
docker compose exec astralnexus_db psql -U admin -d astralnexus
```

### Maintenance

```bash
# Restart specific service
docker compose restart astralnexus_be

# Rebuild specific service
docker compose build astralnexus_ui
docker compose up -d astralnexus_ui

# View resource usage
docker compose top

# Clean up unused Docker resources
docker system prune -f
```

## Troubleshooting

### Common Issues and Solutions

#### Port Already in Use

```bash
# Check what's using the port
netstat -tulpn | grep :3000
# Kill the process or change the port in docker-compose.yml
```

#### Database Connection Issues

```bash
# Check database health
docker compose ps astralnexus_db
# View database logs
docker compose logs astralnexus_db
# Restart database service
docker compose restart astralnexus_db
```

#### Frontend Not Loading

```bash
# Check if service is running
docker compose ps astralnexus_ui
# View frontend logs
docker compose logs -f astralnexus_ui
# Rebuild frontend
docker compose build astralnexus_ui
docker compose up -d astralnexus_ui
```

#### Backend API Not Responding

```bash
# Test backend health
curl http://localhost:3001/health
# Check backend logs
docker compose logs -f astralnexus_be
# Verify environment variables
docker compose exec astralnexus_be env
```

#### Hot Reloading Not Working

```bash
# Ensure volumes are mounted correctly
docker compose config
# Check file permissions (Linux/macOS)
ls -la astralnexus_ui/src/
# Restart the specific service
docker compose restart astralnexus_ui
```

#### Docker Build Failures

```bash
# Clean Docker cache
docker builder prune -f
# Remove old images
docker image prune -f
# Rebuild from scratch
docker compose build --no-cache
```

## 🔐 OAuth Setup

To enable authentication features, you'll need to set up OAuth applications:

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
6. Update `.env` with your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect URI: `http://localhost:3001/auth/discord/callback`
5. Update `.env` with your `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`

### Testing OAuth

```bash
# After setup, test the endpoints
curl http://localhost:3001/auth/google
curl http://localhost:3001/auth/discord
```

## Advanced Usage

### Custom Environment Variables

```bash
# Create environment-specific overrides
cp .env .env.local
# Edit .env.local with your custom values
# Docker Compose automatically loads both files
```

### Development Scripts

```bash
# Add to package.json or create shell scripts
# Example: scripts/dev-setup.sh
#!/bin/bash
docker compose up --build -d
docker compose logs -f
```

### Database Management

```bash
# Backup database
docker compose exec astralnexus_db pg_dump -U admin astralnexus > backup.sql

# Restore database
docker compose exec -T astralnexus_db psql -U admin astralnexus < backup.sql

# Access database shell
docker compose exec astralnexus_db psql -U admin -d astralnexus
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats

# View container resource limits
docker compose config | grep -A 5 "deploy:"
```

### Multi-Environment Setup

```bash
# Different environments
docker compose -f compose.yml -f compose.staging.yml up
docker compose -f compose.yml -f compose.production.yml up
```

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vuejs Docker](https://viblo.asia/p/vuejs-huong-dan-deploy-vuejs-bang-docker-gAm5yDGOldb)
- [Elysia.js Docker](https://beta.elysiajs.com/integrations/docker)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

## Getting Help

If you encounter issues:

1. **Check the logs**: `docker compose logs -f`
2. **Verify service status**: `docker compose ps`
3. **Test connectivity**: Use curl commands provided above
4. **Clean and rebuild**: `docker compose down && docker compose up --build`
5. **Check environment variables**: Ensure `.env` is properly configured

