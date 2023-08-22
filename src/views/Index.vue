<template>
  <div class="index-container">
    <el-card class="operator">
      <el-button @click="restart">{{ this.right ? '重新开始' : '开始答题' }}</el-button>
      <el-button @click="selectRange">选择范围</el-button>
      <el-button v-if="user && right" @click="errorReport">读音/单词报错</el-button>
    </el-card>
    <el-card v-if="right">
      <template #header>
        <div style="display: flex;align-items: center;justify-content: space-between;">

          <div style="text-align:center;">答题卡</div>
          <div>共：{{ words.length }}, 目前: {{ usedWords.size }}, 剩余：{{ words.length - usedWords.size }}</div>
          <div>正确率： {{ (((usedWords.size - errorCount) / usedWords.size) * 100).toFixed(0) }}%</div>

        </div>
      </template>
      <div class="question" v-if="randomWords.length>0">
        <ruby>{{ right.word }}
          <rt> {{ right.pronunciation }}</rt>
        </ruby>
      </div>
      <!--<el-button-group style="width: 100%;display:flex;">-->
      <el-row class="answer" :gutter="20">
        <el-col v-for="word in randomWords" :xs="12" :sm="12" :md="6" class="answer-col">
          <el-button style="flex: 1;width: 100px;height: 100px;padding: 15px;word-break: break-all" @click="checkWord(word)">

            {{ word.translation }}
          </el-button>
        </el-col>
      </el-row>
      <!--</el-button-group>-->
    </el-card>
    <el-dialog title="答题范围" v-model="rangeVisible">
      <WordRangeManager v-if="rangeVisible" :items="rawWords" @confirm="onConfirm" />
    </el-dialog>
    <el-dialog title="读音报错" v-model="reportVisible">
      <Recorder v-if="right" :word="right" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { BASE_URL } from '@/env'
import request from '@/request'
import { getRandomElementsFromArray } from '@/util'
import { Howl } from 'howler'
import WordRangeManager from '@/components/WordRangeManager.vue'
import Recorder from '@/components/Recorder.vue'

export default defineComponent({
  name: 'Index',
  components: { Recorder, WordRangeManager },
  computed: {
    ...mapState(useUserStore, ['user', 'token'])
  },
  data() {
    return {
      rangeVisible: false,
      reportVisible: false,
      BASE_URL,
      usedWords: new Set(),
      rawWords: [],
      words: [],
      randomWords: [],
      right: null,
      errorCount: 0,
      prevError: null,
      audio: null as HTMLAudioElement
    }
  },
  mounted() {
    this.getWords()
  },
  methods: {
    onConfirm(items) {
      this.words = items
      this.rangeVisible = false
    },
    restart() {
      this.errorCount = 0
      this.prevError = null
      this.usedWords.clear()
      this.right = null
      this.randomWords = []
      this.getRandomWords()
    },
    checkWord(word) {
      if (word.word === this.right.word) {
        ElMessage.success('正确！')
        this.getRandomWords()
      } else {
        if (this.prevError != this.right) {
          this.errorCount++
          this.prevError = this.right
        }
        ElMessage.error('错误！')
      }
      // this.right = word
      // this.randomWords = getRandomElementsFromArray(this.words, 4)
    },
    getWords() {
      request.get('words').then(({ data }) => {
        console.log(data)
        if (data.code === 200) {
          this.rawWords = this.words = data.data
        }
      })
    },
    getRandomWords() {
      if (this.usedWords.size === this.words.length) {
        this.randomWords = []
        return ElMessage.success('已经没有啦')
      }
      this.randomWords = getRandomElementsFromArray(this.words, 4)
      const index = Math.floor(this.randomWords.length * Math.random())
      this.right = this.randomWords[index]
      if (this.usedWords.has(this.right)) {
        return this.getRandomWords()
      }
      if (this.audio) {
        this.audio.pause()
      }
      this.audio = new Howl({
        src: [this.right.audio]
      })
      this.audio.play()
      this.usedWords.add(this.right)
    },
    selectRange() {
      // ElMessage.info('开发中……')
      this.rangeVisible = true
    },
    errorReport() {
      // ElMessage.info('开发中……')
      this.reportVisible = true
    }
  }
})
</script>

<style scoped>
.card {
  max-width: 600px;
  width: 100%;
  padding: 30px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.question {
  text-align: center;
  margin-bottom: 20px;
  font-size: 40px;
  padding: 20px;
}

.operator {
  max-width: 600px;
//width: 100%; display: flex; justify-content: center; margin-bottom: 20px;
}

.index-container {
  flex-direction: column;
  display: flex;
  align-items: center;
//justify-content: center;
}

.answer-col {
  text-align: center;
  margin-bottom: 20px;
}
</style>
