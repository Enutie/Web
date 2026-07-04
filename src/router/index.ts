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
    // Old search-engine results still point at /index.html; without this the
    // app boots but no route matches and the page renders empty.
    {
      path: '/index.html',
      redirect: '/',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Keep the canonical URL in sync with the route so crawlers consolidate
// duplicate URLs (like /index.html) onto the clean path.
router.afterEach((to) => {
  const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (link) link.href = `https://enutie.com${to.path}`
})

export default router
