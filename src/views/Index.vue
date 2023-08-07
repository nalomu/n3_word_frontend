<template>
  <div>
    <div v-if="right" class="card">
      <div class="question"> 题目：{{ right.word }}</div>
      <!--<el-button-group style="width: 100%;display:flex;">-->
      <el-button style="flex: 1;width: 100px;height: 100px;padding: 15px;word-break: break-all" v-for="word in randomWords" @click="checkWord(word)">
        {{ word.translation }}
      </el-button>
      <!--</el-button-group>-->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { UploadRawFile, UploadInstance } from 'element-plus'
import { ElMessage, genFileId } from 'element-plus'
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { BASE_URL } from '@/env'
import request from '@/request'
import { getRandomElementsFromArray } from '@/util'

export default defineComponent({
  name: 'Index',
  computed: {
    ...mapState(useUserStore, ['token'])
  },
  data() {
    return {
      BASE_URL,
      words: [],
      randomWords: [],
      right: null
    }
  },
  mounted() {
    this.getWords()
  },
  methods: {
    checkWord(word) {
      if (word.word === this.right.word) {
        ElMessage.success('正确！')
        this.getRandomWords()
      } else {
        ElMessage.error('错误！')
      }
      // this.right = word
      // this.randomWords = getRandomElementsFromArray(this.words, 4)
    },
    getWords() {
      request.get('words').then(({ data }) => {
        console.log(data)
        if (data.code === 200) {
          this.words = data.data
          this.getRandomWords()

        }
      })
    },
    getRandomWords() {
      this.randomWords = getRandomElementsFromArray(this.words, 4)
      this.right = this.randomWords[Math.floor(this.randomWords.length * Math.random())]
      console.log(this.randomWords, this.right)
    }
  }
})
</script>

<style scoped>
.card {
//min-width: 600px;
}

.question {

  text-align: center;
  margin-bottom: 20px;
}
</style>
