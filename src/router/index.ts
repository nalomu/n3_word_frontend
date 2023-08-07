import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/views/Index.vue'
import { useUserStore } from '@/stores/user'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/words',
      name: 'words',
      component: () => import('@/views/Words.vue')
    },
    {
      path: '/manager',
      name: 'manager',
      meta: {
        auth: true
      },
      component: () => import('@/views/Manager.vue')
    }
  ]
})
router.beforeEach((to, from) => {
  const store = useUserStore()
  // 检查用户是否已登录
  if (
    !store.token
    && to.meta.auth === true
    && to.name !== 'Login'// ❗️ 避免无限重定向
  ) {
    // 将用户重定向到登录页面
    return { name: 'login' }
  }
})
export default router
