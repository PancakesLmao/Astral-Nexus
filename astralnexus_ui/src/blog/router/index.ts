import { createRouter, createWebHistory } from 'vue-router'
import { API_BASE_URL } from '@/shared/api'
import { checkUserAuth, redirectToLogin } from '@/shared/utils'

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
      path: '/myposts',
      name: 'MyPosts',
      component: () => import('../views/MyPostsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/myposts/:id',
      name: 'PostDetail',
      component: () => import('@/shared/components/PostDetail.vue'),
      props: true,
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

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  console.log('Blog router: Checking route:', to.path)

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Blog router: Route requires authentication')

    // Check if user is authenticated
    const { isAuthenticated } = await checkUserAuth(API_BASE_URL)

    if (!isAuthenticated) {
      console.log('Blog router: User not authenticated, redirecting to login')
      redirectToLogin()
      return
    }

    console.log('Blog router: User authenticated, proceeding')
  }

  next()
})

export default router
