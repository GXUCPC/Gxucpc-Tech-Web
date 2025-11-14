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
          component: defineAsyncComponent(() => import('@/pages/tech/Introduction.vue')),
        },
        {
          name: 'tch_team2-2' ,
          path: 'tch_team2-2' ,
          component: defineAsyncComponent(() => import('@/pages/tech/TiemExprience.vue')),
        },
        {
          name: 'tch_team2-3' ,
          path: 'tch_team2-3' ,
          component: defineAsyncComponent(() => import('@/pages/tech/ContuctUs.vue')),
        },
        {
          name: 'xcpc',
          path: 'xcpc',
          children: [
            {
              name: 'xcpcHome',
              path: '',
              component: defineAsyncComponent(() => import('@/pages/xcpc/XCPCIndex.vue')),
            },
          ],
        },
        {
          name: 'tech',
          path: 'tech',
          children: [
            {
              name: 'techHome',
              path: '',
              component: defineAsyncComponent(() => import('@/pages/tech/TechIndex.vue')),
            },
            {
              name: 'techTeamIntroduction' ,
              path: 'introduction' ,
              component: defineAsyncComponent(() => import('@/pages/tech/Introduction.vue')),
            },
            {
              name: 'techTeamTiemExprience' ,
              path: 'tiemExprience' ,
              component: defineAsyncComponent(() => import('@/pages/tech/TiemExprience.vue')),
            },
            {
              name: 'techTeamContuctUs' ,
              path: 'contuctUs' ,
              component: defineAsyncComponent(() => import('@/pages/tech/ContuctUs.vue')),
            },
          ],
        },
      ],
    },
  ],
})

export default router
