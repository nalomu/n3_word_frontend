<template>
  <el-card header="所有单词">

    <el-table :data="words" style="height: 80vh">
      <el-table-column prop="word" label="日文"></el-table-column>
      <el-table-column prop="translation" label="中文"></el-table-column>
      <el-table-column prop="pronunciation" label="注音"></el-table-column>
      <el-table-column prop="category.name" label="分类"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
    </el-table>
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
  data() {
    return {
      words: []
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
