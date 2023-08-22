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
        icon: 'House'
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
    }
  ]
})
router.beforeEach(async (to, from) => {
  const store = useUserStore()
  if (store.token && !store.user) {
    await store.getUserInfo()
    if (to.matched.length === 0) { // 刷新页面第一次进入页面时，addRoute刚添加路由进去，但没有成功加载需要重进一次
      return {
        ...to,
        replace: true // 重进一次, 不保留重复历史
      }
    }
  }
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
