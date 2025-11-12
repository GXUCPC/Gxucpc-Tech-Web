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
          component: defineAsyncComponent(() => import('@/pages/Tch_team/Introduction.vue')),
        },
        {
          name: 'tch_team2-2' ,
          path: 'tch_team2-2' ,
          component: defineAsyncComponent(() => import('@/pages/Tch_team/Tiem_exprience.vue')),
        },
        {
          name: 'tch_team2-3' ,
          path: 'tch_team2-3' ,
          component: defineAsyncComponent(() => import('@/pages/Tch_team/Contuct_us.vue')),
        },
      ],
    },
  ],
})

export default router
