<template>
  <el-container style="justify-content: center;" direction="vertical">
    <h2 style="text-align:center;color: #fff;margin-bottom: 20px;"></h2>
    <el-card header="登录">
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
      const userStore = useUserStore()
      userStore.login(this.form.username, this.form.password)
    }
  }
})</script>

<style scoped>

</style>
