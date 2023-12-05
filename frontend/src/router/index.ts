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
<<<<<<< HEAD
    component: () => import('@/pages/contest/edit.vue')
  },
  // {
  //   path: '/contest/view/:id(\\d+)',
  //   name: 'contestView',
  //   component: () => import('@/pages/contest/view.vue')
  // }
  // {
  //   path:'/register',
  //   name:'register',
  //   component: () => import('@/pages/RegisterPage.vue'),
  // },
=======
    component: () => import('@/pages/contest/edit.vue'),
    meta: { needLogin: true }
  },
  {
    path: '/NLogin',
    name:'NLogin',
    component: () => import('@/pages/NLoginPage.vue'),
  }
>>>>>>> b8af5b5 (临时)
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...ROUTERS]
})

// router.beforeEach((to, from, next)=> {

// })

export default router
