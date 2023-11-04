<template>
  <el-menu
    v-if="!isMobile"
    :default-active="activeRoute.path"
    class="sidebar-menu"
    router
    style="height: 100%"
    unique-opened
  >
    <template v-for="route in userStore.menus.filter(i=>!i.meta.hidden)" :key="route.path">
      <el-sub-menu v-if="route.children.length" :index="route.path">
        <template #title>
          <el-icon>
            <component :is="route.meta.icon"></component>
          </el-icon>
          <span>{{ route.meta.title }}</span>
        </template>
        <el-menu-item v-for="child in route.children" :index="child.path">
          <router-link :to="child.path">{{ child.meta.title }}</router-link>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="route.path">
        <el-icon>
          <component :is="route.meta.icon"></component>
        </el-icon>
        <span>{{ route.meta.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
  <div v-else class="tabbar">
    <template v-for="route in userStore.menus.filter(i=>!i.meta.hidden)" :key="route.path">
      <router-link :class="{active: activeRoute.path === route.path}" :to="route.path" class="tabbar-item">
        <el-icon size="22">
          <component :is="route.meta.icon"></component>
        </el-icon>
        <span>{{ route.meta.title }}</span>
      </router-link>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { onMounted, ref } from 'vue'

const userStore = useUserStore()
const activeRoute = useRoute()
const router = useRouter()
const isMobile = ref(false)
onMounted(function () {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', function () {
    isMobile.value = window.innerWidth < 768
  })
})
</script>

<style lang="scss" scoped>
.sidebar-menu {
  width: 300px;
}

.tabbar {
  width: 100%;
  position: fixed;
  bottom: 0;
  height: 60px;
  display: flex;
  box-shadow: 0 0 5px rgba(0, 0, 0, .2);
  z-index: 1024;
  background-color: #fff;

  &-item {
    color: #282828;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &.active {
      color: hsla(160, 100%, 37%, 1);
    }
  }
}
</style>
