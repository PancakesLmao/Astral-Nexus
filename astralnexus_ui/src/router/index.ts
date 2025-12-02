import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/shared/lib/supabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Root/Landing routes
    {
      path: '/',
      name: 'Landing Page',
      component: () => import('../root/views/LandingView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../root/views/LoginView.vue'),
    },

    // Blog routes (with /blog prefix)
    {
      path: '/blog',
      name: 'BlogHome',
      component: () => import('../blog/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/blog/events',
      name: 'BlogEvents',
      component: () => import('../blog/views/EventsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/blog/notifications',
      name: 'BlogNotifications',
      component: () => import('../blog/views/NotificationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/blog/profile',
      name: 'BlogProfile',
      component: () => import('../blog/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },

    // Admin routes (with /admin prefix)
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('../admin/views/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('../admin/views/Login.vue'),
    },
    {
      path: '/admin/posts',
      name: 'AdminPostManager',
      component: () => import('../admin/views/PostManager.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  console.log('Router beforeEach - Navigating to:', to.path)

  // Skip auth check for public routes
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  try {
    // Get Supabase session - this is the ONLY auth check we need
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Supabase session exists:', !!session)

    if (session) {
      console.log('User authenticated:', session.user.email)

      // Check admin access for admin routes
      if (to.meta.requiresAdmin) {
        const isAdmin = session.user.user_metadata?.role === 'admin' ||
                        session.user.email?.includes('admin')

        if (!isAdmin) {
          console.log('Admin access required, redirecting to blog')
          next('/blog')
          return
        }
      }

      next()
    } else {
      console.log('No session, redirecting to login')
      next('/login')
    }
  } catch (error) {
    console.error('Auth check error:', error)
    next('/login')
  }
})

export default router
