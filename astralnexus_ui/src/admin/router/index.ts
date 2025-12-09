import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/shared/lib/supabase'
import { getLoginUrl, getBlogUrl } from '@/shared/utils'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'AdminDashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/login',
      name: 'AdminLogin',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/posts',
      name: 'PostManager',
      component: () => import('../views/PostManager.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

// Track redirect attempts to prevent loops
let redirectAttempts = 0
const MAX_REDIRECT_ATTEMPTS = 3

// Navigation guard to check admin authentication
router.beforeEach(async (to, from, next) => {
  console.log('Admin router: Checking route:', to.path)

  // Check for redirect loop
  if (redirectAttempts >= MAX_REDIRECT_ATTEMPTS) {
    redirectAttempts = 0
    next()
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Admin router: Route requires authentication')

    // Check Supabase session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.log('Admin router: No session, redirecting to root login')
      redirectAttempts++
      window.location.href = getLoginUrl()
      return
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.role === 'admin' ||
                    session.user.email?.includes('admin')

    if (to.meta.requiresAdmin && !isAdmin) {
      console.log('Admin router: User is not admin, redirecting to blog')
      redirectAttempts++
      window.location.href = getBlogUrl()
      return
    }

    console.log('Admin router: Admin authenticated, proceeding')
    redirectAttempts = 0 // Reset on successful auth check
  }

  next()
})

export default router
