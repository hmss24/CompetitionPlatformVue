import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const ROUTERS: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'homepage',
    component: () => import('@/pages/index.vue'),
    meta: { needLogin: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/category',
    name: 'category',
    component: () => import('@/pages/category.vue')
  },
  {
    path: '/contest',
    name: 'contest',
    component: () => import('@/pages/contest/index.vue')
  },
  {
    path: '/contest/edit/:id(\\d+)',
    name: 'contestEdit',
    component: () => import('@/pages/contest/edit.vue')
  },
  {
    path: '/contest/view/:id(\\d+)',
    name: 'contestView',
    component: () => import('@/pages/contest/view.vue')
  },
  {
    path: '/contest/add',
    name: 'contestAdd',
    component: () => import('@/pages/contest/add.vue')
  },
  {
    path: '/contest/form_edit/:id(\\d+)',
    name: 'contestFormEdit',
    component: () => import('@/pages/contest/form_edit.vue')
  }
  // {
  //   path:'/register',
  //   name:'register',
  //   component: () => import('@/pages/RegisterPage.vue'),
  // },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...ROUTERS]
})

// router.beforeEach((to, from, next)=> {

// })

export default router
