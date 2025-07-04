import { createRouter, createWebHistory } from 'vue-router'
import { API_BASE_URL } from '@/shared/api'
import { checkUserAuth, redirectToLogin } from '@/shared/utils'

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
      path: '/posts',
      name: 'PostManager',
      component: () => import('../views/PostManager.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  console.log('Admin router: Checking route:', to.path)

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Admin router: Route requires authentication')

    // Check if user is authenticated
    const { isAuthenticated } = await checkUserAuth(API_BASE_URL)

    if (!isAuthenticated) {
      console.log('Admin router: User not authenticated, redirecting to login')
      redirectToLogin()
      return
    }

    console.log('Admin router: User authenticated, proceeding')
  }

  next()
})

export default router
