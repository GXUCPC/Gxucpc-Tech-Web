import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const base = import.meta.env.PROD ? '/me/' : '/'
const router = createRouter({
  history: createWebHistory(base),
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
          name: 'articleList',
          path: 'articles',
          component: defineAsyncComponent(() => import('@/pages/articles/ArticleList.vue')),
        },
        {
          name: 'articleDetail',
          path: 'articles/:id',
          component: defineAsyncComponent(() => import('@/pages/articles/ArticleDetail.vue')),
        },
        {
          name: 'tch_team2-1',
          path: 'tch_team2-1',
          component: defineAsyncComponent(() => import('@/pages/tech/Introduction.vue')),
        },
        {
          name: 'tch_team2-2',
          path: 'tch_team2-2',
          component: defineAsyncComponent(() => import('@/pages/tech/TiemExprience.vue')),
        },
        {
          name: 'tch_team2-3',
          path: 'tch_team2-3',
          component: defineAsyncComponent(() => import('@/pages/tech/JoinUs.vue')),
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
            {
              name: 'xcpcIntrodution',
              path: 'introdution',
              component: defineAsyncComponent(() => import('@/pages/xcpc/XCPCIntroduction.vue')),
            },
            {
              name: 'xcpcJoinUs',
              path: 'join-us',
              component: defineAsyncComponent(() => import('@/pages/xcpc/XCPCJoinUs.vue')),
            },
            {
              name: 'competitionSignUp',
              path: 'competitionSignUp',
              component: defineAsyncComponent(() => import('@/pages/xcpc/competitionSignUp.vue')),
            },
          ],
        },
        {
          name: 'tech',
          path: 'tech',
          children: [
            {
              name: 'techTeamInterview',
              path: 'interview',
              component: defineAsyncComponent(() => import('@/pages/tech/Interview.vue')),
            },
            {
              name: 'techHome',
              path: '',
              component: defineAsyncComponent(() => import('@/pages/tech/TechIndex.vue')),
            },
            {
              name: 'techTeamIntroduction',
              path: 'introduction',
              component: defineAsyncComponent(() => import('@/pages/tech/Introduction.vue')),
            },
            {
              name: 'techTeamTiemExprience',
              path: 'tiemExprience',
              component: defineAsyncComponent(() => import('@/pages/tech/TiemExprience.vue')),
            },
            {
              name: 'techTeamContuctUs',
              path: 'contuctUs',
              component: defineAsyncComponent(() => import('@/pages/tech/JoinUs.vue')),
            },
          ],
        },
      ],
    },
// ===== 纯前端模式：后端相关代码暂时注释（恢复时取消注释）=====
// 纯前端模式：/admin 管理台依赖后端接口，整块注释
//     {
//       path: '/admin',
//       component: () => import('@/pages/admin/AdminLayout.vue'),
//       children: [
//         {
//           name: 'adminNotice',
//           path: 'notice',
//           component: () => import('@/pages/admin/AdminNotice.vue'),
//         },
//         {
//           name: 'adminHome',
//           path: 'interview',
//           component: () => import('@/pages/admin/AdminHome.vue'),
//         },
//         {
//           name: 'adminCompetition',
//           path: 'competition',
//           component: () => import('@/pages/admin/AdminCompetition.vue'),
//         },
//       ],
//     },
  ],
  scrollBehavior(to, from, savedPosition) {
    // 如果是通过浏览器的“前进/后退”按钮触发的，保持原来的滚动位置
    if (savedPosition) {
      return savedPosition
    } else {
      // 如果是点击链接跳转的新页面，直接回到顶部
      return {
        top: 0,
        behavior: 'smooth',
      }
    }
  },
})

export default router
