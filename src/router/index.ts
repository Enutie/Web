import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { theme: 'light' },
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/views/GamesView.vue'),
      meta: { theme: 'dark' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
