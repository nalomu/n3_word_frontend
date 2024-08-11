<template>
  <div class="nalomu-header">
    <div class="site-logo hover:text-sky-400 cursor-pointer transition-all" @click="$router.push('/')">
      <img src="@/assets/logo.png" alt="">
      <span>猹词单</span>
    </div>
    <div class="user-info text-indigo-700" v-if="userStore.user">
      <router-link to="/user" class="hover:text-sky-400" style="margin-right: 8px;" >{{ userStore.user?.nickname }}</router-link>
      <a  @click="userStore.logout" type="text" class="logout-button hover:text-sky-400 cursor-pointer">登出</a>
    </div>
    <div class="user-info text-indigo-700" v-else>
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

@media screen and (max-width: 768px) {
  .site-logo span {
    display: none;
  }
}

.user-info {
  height: 100%;
  display: flex;
  align-items: center;
  margin-right: 40px;

  &-link {
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
  }
}

</style>
