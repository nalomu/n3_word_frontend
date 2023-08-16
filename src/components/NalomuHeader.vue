<template>
  <div class="nalomu-header">
    <div class="site-logo">
      <img src="@/assets/logo.svg" alt="">
      <span>NWP</span>
    </div>
    <div class="user-info" v-if="userStore.user">
      <span style="margin-right: 8px;">{{ userStore.user?.nickname }}</span>
      <a @click="userStore.logout" type="text" class="logout-button">登出</a>
    </div>
    <div class="user-info" v-else>
      <router-link class="user-info-link" to="/login">登录</router-link>
      <router-link class="user-info-link" to="/register">注册</router-link>
    </div>
  </div>
</template>
<script setup lang="ts">

import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
<style lang="scss">
.nalomu-header {
  height: 100%;
  display: flex;
  justify-content: space-between;
}

.site-logo {
  display: flex;
  align-items: center;
  font-size: 26px;
  font-weight: bold;

  img {
    width: 60px;
    height: 60px;
  }

  span {
    margin-left: 10px;
  }
}

.user-info {
  height: 100%;
  display: flex;
  align-items: center;

  &-link {
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
  }
}

</style>
