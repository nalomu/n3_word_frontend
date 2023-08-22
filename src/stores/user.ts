import { defineStore } from 'pinia'
import request from '@/request'
import { ElMessage } from 'element-plus'
import { getUserRouter, resetRouter } from '@/router/router'
import type { RouteRecord } from 'vue-router'
import router from '@/router'

declare type User = {
  id: number
  nickname: string
  username: string
  is_admin: boolean
}
declare type UserStore = {
  token: string
  user: User | null
  menus: RouteRecord[]
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => {
    return {
      token: localStorage.getItem('token') || '',
      user: null,
      menus: router.getRoutes()
    }
  },
  actions: {
    setUser(_user: User) {
      this.user = _user
    },
    setToken(payload: string) {
      this.token = payload
      localStorage.setItem('token', payload)
    },
    async getUserInfo() {
      if (!this.token) {
        throw new Error('还没登录')
      }
      const { data } = await request.get('users/me')
      this.setUser(data.data)
      getUserRouter(router)
      console.log(router.getRoutes())
      this.menus = router.getRoutes()
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      resetRouter(router)
      this.menus = router.getRoutes()
      router.push('/login')
    },
    async login(username: string, password: string) {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const { data } = await request.post('token', formData)

      if (data.code === 200) {
        ElMessage.success('登录成功')
        this.setToken(data.data.access_token)
        await this.getUserInfo()
        router.push('/')
      }
    }
  }
})
