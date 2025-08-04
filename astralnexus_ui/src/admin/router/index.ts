import { createRouter, createWebHistory } from 'vue-router'

// Admin authentication check function
const checkAdminAuth = async () => {
  try {
    const response = await fetch('http://api.localtest.me:3001/admin/me', {
      method: 'GET',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      return data.success
    }
    return false
  } catch (error) {
    console.error('Admin auth check failed:', error)
    return false
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'AdminDashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard to check admin authentication
router.beforeEach(async (to, from, next) => {
  console.log('Admin router: Checking route:', to.path)

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Admin router: Route requires authentication')

    // Check if admin is authenticated
    const isAuthenticated = await checkAdminAuth()

    if (!isAuthenticated) {
      console.log('Admin router: Admin not authenticated, redirecting to login')
      next('/login')
      return
    }

    console.log('Admin router: Admin authenticated, proceeding')
  }

  next()
})

export default router
