# Astral Nexus - Frontend

<div align="center">
    <img src="https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/VueJS-Dark.svg" height="45" alt="vue logo" />
    <img width="12" />
    <img src="https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/TypeScript.svg" height="45" alt="typescript logo" />
    <img width="12" />
    <img src="https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Bootstrap.svg" height="45" alt="bootstrap logo" />
</div>

## Quick Start

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended package manager)

### **Installation & Development**

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Access the platform:
# Root:  http://localtest.me:3000
# Blog:  http://blog.localtest.me:3000  
# Admin: http://admin.localtest.me:3000
```

## Project Structure

```
astralnexus_ui/
├── src/
│   ├── root/          # Main domain (localtest.me)
│   │   ├── views/     # Landing & Login pages
│   │   └── router/    # Root routing
│   ├── blog/          # Blog subdomain (blog.localtest.me)
│   │   ├── views/     # Blog views (Home, Posts, Profile)
│   │   └── router/    # Blog routing with lazy loading
│   ├── admin/         # Admin subdomain (admin.localtest.me)
│   │   ├── views/     # Admin dashboard & management
│   │   └── router/    # Admin routing
│   └── shared/        # Reusable components & utilities
│       ├── components/# Shared Vue components
│       ├── stores/    # Pinia state management
│       ├── types/     # TypeScript interfaces
│       └── utils/     # Helper functions
├── root.html          # Entry point for main domain
├── blog.html          # Entry point for blog subdomain  
├── admin.html         # Entry point for admin subdomain
└── vite.config.ts     # Multi-subdomain configuration
```

## Subdomain Architecture

| Subdomain | URL | Purpose | Features |
|-----------|-----|---------|----------|
| **Root** | `localtest.me:3000` | Landing & Auth | Landing page, Login |
| **Blog** | `blog.localtest.me:3000` | Blog Platform | Posts, Events, Profile |
| **Admin** | `admin.localtest.me:3000` | Management | Dashboard, Post Manager |

## Performance Features

### **Lazy Loading Implementation**
All routes use lazy loading for optimal performance:

```typescript
// ✅ Lazy Loading (Current)
component: () => import('../views/PostDetail.vue')

// ❌ Eager Loading (Avoided)  
import PostDetail from '../views/PostDetail.vue'
```

**Benefits:**
- **Faster initial load**
- **Progressive loading** - Components load as needed
- **Scalable** - Performance stays good as features grow

### **Bundle Splitting Strategy:**
- **Initial Load**: Only landing page
- **Blog Routes**: Lazy loaded
- **Admin Panel**: Heavy components loaded on demand
- **Shared Components**: Loaded across subdomains efficiently

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with all subdomains
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run end-to-end tests
pnpm lint             # Lint code

# Type Checking
pnpm type-check       # Check TypeScript types
```

## Technology Stack

- **Frontend Framework**: Vue 3 + TypeScript + Vite
- **Styling**: Bootstrap 5 + Custom CSS
- **Routing**: Vue Router with lazy loading
- **State**: Pinia stores
- **Dev Tools**: Vue DevTools, Hot Reload

## 🔧 Configuration

### **Subdomain Setup**
The project uses `localtest.me` for local subdomain testing:
- Automatically resolves all subdomains to localhost
- No hosts file modification needed
- Works across all operating systems

### **Vite Configuration**
Custom middleware handles subdomain routing:
```typescript
// Automatic subdomain detection and routing
if (host.startsWith('blog.')) {
  req.url = '/blog.html'  // Serve blog UI
} else if (host.startsWith('admin.')) {
  req.url = '/admin.html' // Serve admin UI
}
```

## 📚 Lazy Loading Guide

### **Why Lazy Loading?**
Perfect for multi-subdomain architecture where users don't visit all sections.

### **Implementation Examples:**

```typescript
// Blog Router (src/blog/router/index.ts)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'), // Lazy loaded
    },
    {
      path: '/posts',
      name: 'PostList',
      component: () => import('../views/PostList.vue'), // Lazy loaded
    }
  ]
})
```

### **Best Practices:**
- **Always lazy load**: Blog posts, profile pages, admin panels
- **Consider eager loading**: Critical navigation, frequently accessed components
- **Monitor bundle sizes**: Use `pnpm build --analyze` to check chunk sizes
