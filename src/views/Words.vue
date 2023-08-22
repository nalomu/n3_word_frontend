<template>
  <el-card header="所有单词">

    <el-table :data="sliceData" style="height: 80vh">
      <el-table-column prop="word" label="日文"></el-table-column>
      <el-table-column prop="translation" label="中文"></el-table-column>
      <el-table-column prop="pronunciation" label="注音"></el-table-column>
      <el-table-column prop="category.name" label="分类"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :total="words.length" v-model:current-page="currentPage" v-model:page-size="pageSize" />
  </el-card>
</template>

<script lang="ts">
import request from '@/request'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Words',
  mounted() {
    this.getWords()
  },
  computed: {
    sliceData() {
      return this.words.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    }
  },
  data() {
    return {
      words: [],
      currentPage: 1,
      pageSize: 20
    }
  },
  methods: {

    getWords() {
      request.get('words').then(({ data }) => {
        console.log(data)
        if (data.code === 200) {
          this.words = data.data

        }
      })
    }
  }
})</script>

<style scoped>

</style>
