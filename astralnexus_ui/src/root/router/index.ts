import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: () => import('../views/LandingView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
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
