<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NalomuHeader from '@/components/NalomuHeader.vue'
</script>

<template>
  <el-container class="main bg-gradient-to-tl from-blue-50">
    <el-header class="header bg-gradient-to-r from-indigo-50 shadow-sm">
      <NalomuHeader />
    </el-header>
    <el-container class="container">
      <el-aside width="auto">
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
  //box-shadow: 0 1px 3px rgba(0, 0, 0, .12);
  //border-bottom: 1px solid rgba(0, 0, 0, .12);
  position: fixed;
  width: 100%;
  //background-color: #fff;
  z-index: 1024;
}

.main {
  min-height: 100vh;
}
.container{
  margin-top: 60px;

}
@media only screen and (max-width: 600px) {
  .container{
    padding-bottom: 60px;
  }
}
</style>
