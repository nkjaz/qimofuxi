import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/subjects',
    name: 'Subjects',
    component: () => import('@/views/subjects/index.vue'),
    meta: {
      title: '学科管理'
    }
  },
  {
    path: '/subjects/create',
    name: 'SubjectCreate',
    component: () => import('@/views/subjects/create.vue'),
    meta: {
      title: '创建学科'
    }
  },
  {
    path: '/subjects/:id',
    name: 'SubjectDetail',
    component: () => import('@/views/subjects/detail.vue'),
    meta: {
      title: '学科详情'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 期末复习平台`
  }
  next()
})

export default router
