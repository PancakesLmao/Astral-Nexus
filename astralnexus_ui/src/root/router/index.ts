import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Callback',
      component: () => import('../views/CallbackView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/landing',
      name: 'Landing',
      component: () => import('../views/LandingView.vue'),
      meta: { requiresAuth: false }
    },
  ],
})

// Navigation guard for root domain
router.beforeEach(async (to, from, next) => {
  // Allow landing page and login page without authentication checks
  if (to.path === '/' || to.path === '/login') {
    console.log('✅ Root router - Allowing access to', to.path)
    next()
    return
  }

  console.log('=== ROOT ROUTER END ===')
  next()
})

export default router
