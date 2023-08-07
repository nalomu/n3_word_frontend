import { defineStore } from 'pinia'
import axios from 'axios'
import request from '@/request'

declare type User = {
  id: number
  nickname: string
  username: string
}
declare type UserStore = {
  token: string
  user: User | null
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => {
    return {
      token: localStorage.getItem('token') || '',
      user: null
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
      this.setUser(data)
    }
  }
})
