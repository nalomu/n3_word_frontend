<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NalomuHeader from '@/components/NalomuHeader.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
if (userStore.token) {
  userStore.getUserInfo()
}

</script>

<template>
  <el-container class="main">
    <el-header class="header">
      <NalomuHeader />
    </el-header>
    <el-container>
      <el-aside>
        <Sidebar />
      </el-aside>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, .12);
  border-bottom: 1px solid rgba(0, 0, 0,.12);
}
.main {
  min-height: 100vh;
}
</style>
