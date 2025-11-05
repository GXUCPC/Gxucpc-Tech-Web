import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      component: defineAsyncComponent(() => import('@/pages/MainLayout.vue')),
    },
  ],
})

export default router
