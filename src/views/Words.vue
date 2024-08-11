<template>
  <el-card header="所有单词">

    <el-table v-loading="loading" :data="sliceData" style="height: 80vh">
      <el-table-column label="日文" prop="word"></el-table-column>
      <el-table-column label="中文" prop="translation"></el-table-column>
      <el-table-column label="注音" prop="pronunciation"></el-table-column>
      <el-table-column label="分类" prop="category.name"></el-table-column>
      <el-table-column label="备注" prop="remark"></el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="words.length"
      layout="prev, pager, next"
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
const loading = ref(false)

const getWords = () => {
  loading.value = true
  request.get('words').then(({ data }) => {
    loading.value = false
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
