# Migration Log: Custom OAuth to Supabase Auth

**Date**: November 11-12, 2025  
**Issue**: Authentication system migration  

---

## Overview

This project has been **fully migrated** from a custom Discord OAuth implementation to **Supabase Auth**. This change significantly simplifies our authentication flow and improves security.

### What Changed

- **Removed**: Custom Discord OAuth implementation using `elysia-oauth2`
- **Removed**: Manual token exchange and session management
- **Removed**: Backend-managed OAuth flow
- **Added**: Supabase Auth with Discord provider
- **Added**: PKCE flow for enhanced security
- **Added**: Cross-subdomain session sharing via cookies
- **Added**: Environment-based URL configuration (no hardcoded endpoints)

---

## Technical Changes

### Frontend Changes

#### 1. **Authentication Library**
- **Before**: Manual `fetch()` calls to backend OAuth endpoints
- **After**: `@supabase/supabase-js` client library
- **Location**: `src/shared/lib/supabase.ts`

#### 2. **Session Storage**
- **Before**: localStorage (limited to single domain)
- **After**: Cookie-based storage with `domain=.localtest.me` for cross-subdomain sharing
- **Critical Discovery**: localStorage is NOT shared between subdomains, even when served from the same Vite dev server
  - `localtest.me:3000` → Separate localStorage
  - `blog.localtest.me:3000` → Separate localStorage
  - Solution: Use cookies with domain attribute

#### 3. **Cookie Chunking Implementation**
- **Problem**: Supabase sessions (JWT + refresh token + metadata) can exceed 4KB browser cookie limit
- **Solution**: Automatic cookie chunking
  - Values >3.8KB are split into multiple cookies (`sb-auth-token_0`, `sb-auth-token_1`, etc.)
  - `getItem()` reassembles chunks automatically
  - `setItem()` handles splitting transparently
  - `removeItem()` cleans up all chunks

#### 4. **OAuth Flow**
```
OLD FLOW:
User → Frontend → Backend OAuth endpoint → Discord → Backend callback → Frontend

NEW FLOW:
User → Frontend → Supabase → Discord → Supabase → Frontend
```

#### 5. **URL Configuration** (NEW)
- **All URLs now derived from environment variables** (no hardcoded endpoints)
- Single source of truth: `.env.local`
- Helper functions in `src/shared/utils/index.ts`:
  - `getApiUrl()` - Backend API endpoint
  - `getAppUrl()` - Main frontend URL
  - `getBlogUrl()` - Blog URL (auto-derived from VITE_APP_URL)
  - `getAdminUrl()` - Admin URL (auto-derived)
  - `getSessionDomain()` - Cookie domain (auto-extracted from URL)
  - `getLoginUrl()` - Login page URL

**Example `.env.local`**:
```bash
# Minimal configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localtest.me:3000

# Blog and Admin URLs are auto-derived
# VITE_BLOG_URL defaults to ${VITE_APP_URL}/blog
# VITE_ADMIN_URL defaults to ${VITE_APP_URL}/admin
```

#### 6. **Files Modified**
- `src/shared/lib/supabase.ts` - New Supabase client with chunked cookie storage
- `src/shared/utils/index.ts` - URL helper functions (environment-based)
- `src/shared/stores/auth.ts` - Simplified auth store using Supabase
- `src/shared/stores/user.ts` - Updated to use Supabase session
- `src/root/views/LoginView.vue` - Discord OAuth button, callback handler
- `src/root/router/index.ts` - No auto-redirect for authenticated users
- `src/blog/router/index.ts` - Auth guard with session check
- `src/admin/router/index.ts` - Auth guard with admin role check
- `src/admin/views/Login.vue` - Updated to use URL helpers
- `src/admin/views/AdminDashboard.vue` - Updated to use URL helpers
- `.env.example` - Updated with new environment variable structure

### Backend Changes

#### 1. **OAuth Endpoints**
- **Removed**: `/auth/discord`, `/auth/discord/callback`
- **Kept**: `/auth/logout` (for cookie cleanup), `/auth/me` (for legacy support)
- **New**: Supabase JWT verification only

#### 2. **Authentication Middleware**
- **Before**: Session-based authentication with backend-managed sessions
- **After**: JWT verification using Supabase tokens from `Authorization` header
- **Location**: `src/middleware/auth.ts`

---

## Configuration Guide

### Supabase Dashboard Setup

1. **Get Credentials**
   - Navigate to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api`
   - Copy Project URL and Anon Key

2. **Enable Discord Provider**
   - Go to: Authentication → Providers → Discord
   - Enable Discord
   - Add Discord Client ID and Secret from Discord Developer Portal

3. **Configure Redirect URLs**
   - Add to URL allowlist:
     ```
     http://localtest.me:3000/**
     http://blog.localtest.me:3000/**
     http://admin.localtest.me:3000/**
     ```

### Discord Developer Portal Setup

1. **Add Supabase Callback**
   - OAuth2 → Redirects → Add:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
   - ⚠️ **Important**: Discord redirects to Supabase, NOT your app

### Frontend Environment Setup

Create `astralnexus_ui/.env.local`:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Application URLs - Single Source of Truth
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localtest.me:3000

# Optional (auto-derived if not set)
# VITE_BLOG_URL=http://blog.localtest.me:3000
# VITE_ADMIN_URL=http://admin.localtest.me:3000
```

### Backend Environment Setup

Update `astralnexus_be/.env`:
```bash
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
FRONTEND_SUCCESS_REDIRECT=http://localhost:3000/blog
CORS_ORIGIN=http://localhost:3000
SESSION_DOMAIN=.localtest.me
```

---

## Production Deployment

### Environment Variables

**Frontend** (`.env.production`):
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com

# Blog/Admin auto-derived:
# https://yourdomain.com/blog
# https://yourdomain.com/admin
```

**Backend**:
```bash
NODE_ENV=production
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CORS_ORIGIN=https://yourdomain.com
SESSION_DOMAIN=.yourdomain.com
SESSION_SECURE=true
```

### Supabase Configuration

1. Update redirect URLs to production domains:
   ```
   https://yourdomain.com/**
   https://blog.yourdomain.com/**
   ```

2. Update Discord OAuth redirect:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```