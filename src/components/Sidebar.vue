<template>
  <el-menu
    style="height: 100%"
    :default-active="activeRoute.path"
    unique-opened
    router
  >
    <template v-for="route in userStore.menus.filter(i=>!i.meta.hidden)" :key="route.path">
      <el-sub-menu v-if="route.children.length" :index="route.path">
        <template #title>
          <i :class="route.meta.icon"></i>
          <span>{{ route.meta.title }}</span>
        </template>
        <el-menu-item v-for="child in route.children" :index="child.path">
          <router-link :to="child.path">{{ child.meta.title }}</router-link>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="route.path">
        <i :class="route.meta.icon"></i>
        <span>{{ route.meta.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const activeRoute = useRoute()
const router = useRouter()
</script>

<style scoped>

</style>
