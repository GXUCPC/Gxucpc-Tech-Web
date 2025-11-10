import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      component: defineAsyncComponent(() => import('@/pages/MainLayout.vue')),
      children: [
        {
          name: 'home',
          path: '',
          component: defineAsyncComponent(() => import('@/pages/Home.vue')),
        },
        {
          name: 'tch_team2-1' ,
          path: 'tch_team2-1' ,
          component: defineAsyncComponent(() => import('@/pages/Tch_team1-1.vue')),
        },
        {
          name: 'tch_team2-2' ,
          path: 'tch_team2-2' ,
          component: defineAsyncComponent(() => import('@/pages/Tch_team1-2.vue')),
        },
      ],
    },
  ],
})

export default router
