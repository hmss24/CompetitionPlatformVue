import { createRouter, createWebHistory } from 'vue-router'

const ROUTERS = [
  {
    path: '/',
    name: 'homepage',
    component: () => import('@/pages/index.vue'),
    meta: { needLogin: true }
  },
  {
    path: '/personfile',
    name:'personfile',
    component: () => import('@/pages/category/index.vue'),
  },
  {
    path:'/login',
    name:'login',
    component: () => import('@/pages/login.vue'),
  },
  {
    path: '/category',
    name: 'category',
    component: () => import('@/pages/category/index.vue'),
    meta: { needLogin: true }
  },
  {
    path: '/contest',
    name: 'contest',
    component: () => import('@/pages/contest/index.vue'),
    meta: { needLogin: true }
  },
  {
    path: '/contest/edit',
    name: 'contestEdit',
    component: () => import('@/pages/contest/edit.vue'),
    meta: { needLogin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...ROUTERS]
})

// router.beforeEach((to, from, next)=> {

// })

export default router
