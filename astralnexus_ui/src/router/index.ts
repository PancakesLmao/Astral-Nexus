import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const isAuthenticated = () => {
  // For now, check if user has a token in localStorage
  return localStorage.getItem('auth-token') !== null
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => {
        if (isAuthenticated()) {
          return import('../views/Platform.vue')
        } else {
          return Promise.resolve(HomeView)
        }
      },
      children: [
        {
          path: '',
          name: 'platform-home',
          component: () => {
            if (isAuthenticated()) {
              return import('../views/platform/HomeView.vue')
            } else {
              return Promise.resolve({ template: '<div></div>' })
            }
          },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: (to, from, next) => {
        if (isAuthenticated()) {
          next('/')
        } else {
          next()
        }
      },
    },
    // Platform routes (require authentication)
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/Platform.vue'),
      beforeEnter: (to, from, next) => {
        if (isAuthenticated()) {
          next()
        } else {
          next('/login')
        }
      },
      children: [
        {
          path: '',
          component: () => import('../views/platform/EventsView.vue'),
        },
      ],
    },
    {
      path: '/myposts',
      name: 'myposts',
      component: () => import('../views/Platform.vue'),
      beforeEnter: (to, from, next) => {
        if (isAuthenticated()) {
          next()
        } else {
          next('/login')
        }
      },
      children: [
        {
          path: '',
          component: () => import('../views/platform/MyPostView.vue'),
        },
      ],
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Platform.vue'),
      beforeEnter: (to, from, next) => {
        if (isAuthenticated()) {
          next()
        } else {
          next('/login')
        }
      },
      children: [
        {
          path: '',
          component: () => import('../views/platform/ProfileView.vue'),
        },
      ],
    },
  ],
})

export default router
