import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'AdminDashboard',
      component: () => import('../views/AdminDashboard.vue'),
    },
    {
      path: '/posts',
      name: 'PostManager',
      component: () => import('../views/PostManager.vue'),
    },
  ],
})

export default router
