<template>
  <el-menu
    style="height: 100%"
    :default-active="activeRoute.path"
    :collapse="collapse"
    unique-opened
    router
    class="sidebar-menu"
  >
    <template v-for="route in userStore.menus.filter(i=>!i.meta.hidden)" :key="route.path">
      <el-sub-menu v-if="route.children.length" :index="route.path">
        <template #title>
          <el-icon><component :is="route.meta.icon"></component></el-icon>
          <span>{{ route.meta.title }}</span>
        </template>
        <el-menu-item v-for="child in route.children" :index="child.path">
          <router-link :to="child.path">{{ child.meta.title }}</router-link>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="route.path">
        <el-icon><component :is="route.meta.icon"></component></el-icon>
        <span>{{ route.meta.title }}</span>
      </el-menu-item>
    </template>
    <el-menu-item v-if="isMobile" @click="collapse=!collapse">
      <el-icon><component :is="collapse?'Expand':'Fold'" /></el-icon>
      <span>收起</span>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { onMounted, ref } from 'vue'

const userStore = useUserStore()
const activeRoute = useRoute()
const router = useRouter()
const collapse = ref(false)
const isMobile = ref(false)
onMounted(function () {
  collapse.value = window.innerWidth < 768
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', function () {
    collapse.value = window.innerWidth < 768
    isMobile.value = window.innerWidth < 768
  })
})
</script>

<style>
.sidebar-menu:not(.el-menu--collapse){
  width: 300px;
}
</style>
