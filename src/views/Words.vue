<template>
  <el-card header="所有单词">

    <el-table :data="sliceData" style="height: 80vh">
      <el-table-column prop="word" label="日文"></el-table-column>
      <el-table-column prop="translation" label="中文"></el-table-column>
      <el-table-column prop="pronunciation" label="注音"></el-table-column>
      <el-table-column prop="category.name" label="分类"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next"
      :total="words.length"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
    />
  </el-card>
</template>

<script lang="ts" setup>
import request from '@/request'
import { computed, onMounted, ref } from 'vue'

const words = ref([] as Word[])
const currentPage = ref(1)
const pageSize = ref(20)
const sliceData = computed(() => {
  return words.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})
const getWords = () => {
  request.get('words').then(({ data }) => {
    console.log(data)
    if (data.code === 200) {
      words.value = data.data

    }
  })
}
onMounted(() => {
  getWords()
})
</script>

<style scoped>

</style>
