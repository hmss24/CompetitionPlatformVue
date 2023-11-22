import { createRouter, createWebHistory } from 'vue-router'

const ROUTERS = [
  {
    path: '/',
    name: 'homepage',
    component: () => import("@/pages/index.vue"),
    meta: { needLogin: true },
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...ROUTERS
  ]
});

// router.beforeEach((to, from, next)=> {
  
// })

export default router
