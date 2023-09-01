<template>
  <el-container style="justify-content: center;" direction="vertical">
    <h2 style="text-align:center;color: #fff;margin-bottom: 20px;"></h2>
    <el-card header="用户注册">
      <!--login form -->
      <el-form :model="form" ref="registerForm" label-width="100px" @submit.native.prevent="handleSubmit">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="登录名">
          <el-input v-model="form.username" placeholder="请输入登录名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.repassword" type="password" placeholder="请确认密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-container>

</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import request from '@/request'

const { user, token } = useUserStore()
const form = ref({
    username: '',
    nickname: '',
    repassword: '',
    password: ''
  }
)
const handleSubmit = () => {
  if (form.value.password !== form.value.repassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  request
    .post('users/', form.value)
    .then(({ data }) => {
      if (data.code === 200) {
        ElMessage.success(data.message)
        const userStore = useUserStore()
        userStore.login(form.value.username, form.value.password)
      }
    })
}

</script>

<style scoped>

</style>
