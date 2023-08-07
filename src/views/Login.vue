<template>
  <el-container style="justify-content: center;" direction="vertical">
    <h2 style="text-align:center;color: #fff;margin-bottom: 20px;"></h2>
    <el-card header="N3 词汇练习">
      <!--login form -->
      <el-form :model="form" ref="loginForm" label-width="100px" @submit.native.prevent="handleSubmit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-container>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import { mapState } from 'pinia'
import { ElMessage } from 'element-plus'
import request from '@/request'

export default defineComponent({
  name: 'Login',
  computed: {
    ...mapState(useUserStore, ['user', 'token'])

  },
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    handleSubmit() {
      const formData = new FormData()
      formData.append('username', this.form.username)
      formData.append('password', this.form.password)

      request
        .post('token', formData)
        .then((response) => {
          ElMessage.success('登录成功')
          const userStore = useUserStore()
          userStore.setToken(response.data.access_token)
          userStore.getUserInfo().then(() => {
            router.push('/')
          })
        })
        .catch(({ response }) => {
          console.log(response)
        })
    }
  }
})</script>

<style scoped>

</style>
