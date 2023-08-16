// 1. 导入 axios 和其他所需库
import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { BASE_URL } from '@/env'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 2. 创建一个 Axios 实例，可以配置基本的请求设置
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL, // 设置默认的 API 基础路径
  timeout: 10000 // 设置超时时间
})

// 3. 定义请求拦截器（可选，可以在这里设置请求前的操作）
request.interceptors.request.use((config) => {
  // 在请求前做一些操作，例如添加认证 token
  const store = useUserStore()
  if (store.token) {
    config.headers.Authorization = 'Bearer ' + store.token
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// 4. 定义响应拦截器（可选，可以在这里对响应做统一处理）
request.interceptors.response.use((response: AxiosResponse) => {
  if (response.data.code === 401) {
    const store = useUserStore()
    store.logout()
  }
  if (response.data.code != 200) {
    ElMessage.error(response.data.message)
  }
  // 在响应中做一些操作，例如处理错误状态码，或者统一处理响应数据
  return response
}, (error: AxiosError) => {
  // 处理请求错误，例如网络错误或服务器错误
  // 可以根据需要返回自定义的错误对象
  return Promise.reject(error)
})

export default request
