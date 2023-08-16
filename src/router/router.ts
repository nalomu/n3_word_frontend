import { useUserStore } from '@/stores/user'
import type { Router } from 'vue-router'

const userRouter = [
  {
    path: '/words',
    name: 'words',
    component: () => import('@/views/Words.vue'),
    meta: {
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
      title: '管理'
    },
    component: () => import('@/views/Manager.vue')
  }
]

export function getUserRouter(router: Router) {
  const user = useUserStore().user!
  userRouter.forEach(item => router.addRoute(item))
  if (user.is_admin) {
    adminRouter.forEach(item => router.addRoute(item))
  }

}
