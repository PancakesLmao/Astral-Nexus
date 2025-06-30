import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/events',
      name: 'Events',
      component: () => import('../views/EventsView.vue'),
    },
    {
      path: '/myposts',
      name: 'MyPosts',
      component: () => import('../views/MyPostsView.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
    },
  ],
})

export default router
