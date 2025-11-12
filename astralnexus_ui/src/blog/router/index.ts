import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/shared/lib/supabase'
import { getLoginUrl } from '@/shared/utils'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events',
      name: 'Events',
      component: () => import('../views/EventsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('../views/NotificationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Track redirect attempts to prevent loops
let redirectAttempts = 0
const MAX_REDIRECT_ATTEMPTS = 3

// Navigation guard for blog subdomain
router.beforeEach(async (to, from, next) => {
  console.log('=== BLOG ROUTER START ===')
  console.log('Blog router - Navigating to:', to.path)
  console.log('Blog router - From:', from.path || 'initial')
  console.log('Blog router - localStorage keys:', Object.keys(localStorage))

  const storedToken = localStorage.getItem('sb-auth-token')
  console.log('Blog router - sb-auth-token exists:', !!storedToken)
  if (storedToken) {
    console.log('Blog router - Token length:', storedToken.length)
    try {
      const parsed = JSON.parse(storedToken)
      console.log('Blog router - Token has user:', !!parsed?.currentSession?.user)
      console.log('Blog router - Token expires at:', parsed?.currentSession?.expires_at)
    } catch (e) {
      console.error('Blog router - Failed to parse token:', e)
    }
  }

  // Check for redirect loop
  if (redirectAttempts >= MAX_REDIRECT_ATTEMPTS) {
    redirectAttempts = 0
    next()
    return
  }

  // Wait a moment for Supabase to initialize if this is the first navigation
  if (!from.name) {
    // console.log('Blog router - Initial navigation, waiting 200ms for Supabase...')
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Check if user is authenticated
  console.log('Blog router - Calling supabase.auth.getSession()...')
  const { data: { session }, error } = await supabase.auth.getSession()

  console.log('Blog router - Session check result:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    expiresAt: session?.expires_at,
    error: error?.message
  })

  if (!session) {
    console.log('❌ User not authenticated on blog subdomain')
    redirectAttempts++
    console.log(`Redirect attempt ${redirectAttempts}/${MAX_REDIRECT_ATTEMPTS}`)

    // Add a delay before redirecting to help with debugging
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Redirecting to login...')

    // Redirect to root domain login
    window.location.href = getLoginUrl()
    return
  }

  console.log('Blog router - User authenticated, allowing access')
  redirectAttempts = 0 // Reset on successful auth check

  // User is authenticated, allow access
  next()
})

export default router
