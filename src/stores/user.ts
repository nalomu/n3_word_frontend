import { defineStore } from 'pinia'
import axios from 'axios'

declare type User = {
  id: number
  nickname: string
  username: string
}
declare type UserStore = {
  token: string
  user: User|null
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => {
    return {
      token: '',
      user: null
    }
  },
  actions: {
    setUser(_user: User) {
      this.user = _user
    },
    setToken(payload: string) {
      this.token = payload
    },
    async getUserInfo() {
      if (!this.token) {
        throw new Error('还没登录')
      }
      const { data } = await axios.get('http://localhost:8000/users/me/', {
        headers: {
          'Authorization': 'bearer ' + this.token
        }
      })
      this.setUser(data)
    }
  }
})
