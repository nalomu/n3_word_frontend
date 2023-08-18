import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/views/Index.vue'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
      meta: {
        title: '首页',
        icon:'House'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        title: '登录',
        hidden: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: {
        title: '注册',
        hidden: true
      }
    },
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
  NProgress.start()
})
router.afterEach(() => {
  // 进度条
  NProgress.done()
})
export default router
