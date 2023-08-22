import { useUserStore } from '@/stores/user'
import type { Router } from 'vue-router'

const userRouter = [
  {
    path: '/words',
    name: 'words',
    component: () => import('@/views/Words.vue'),
    meta: {
      icon: 'Notebook',
      title: '单词'
    }
  }
]
const adminRouter = [
  {
    path: '/manager',
    name: 'manager',
    meta: {
      auth: true,
      icon: 'Grid',
      title: '管理'
    },
    component: () => import('@/views/Manager.vue')
  }
]
const WHITE_NAME_LIST = [
  'index',
  'login',
  'register'
]

export function resetRouter(router: Router) {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !WHITE_NAME_LIST.includes(name as string)) {
      if (router.hasRoute(name)) router.removeRoute(name)
    }
  })
}

export function getUserRouter(router: Router) {
  const user = useUserStore().user!
  userRouter.forEach(item => router.addRoute(item))
  if (user.is_admin) {
    adminRouter.forEach(item => router.addRoute(item))
  }

}
