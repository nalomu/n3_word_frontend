<template>
  <div class="index-container">
    <el-card class="operator">
      <el-button @click="restart">{{ this.right ? '重新开始' : '开始答题' }}</el-button>
      <el-button @click="selectRange">答题设置</el-button>
      <el-button v-if="user && right" @click="errorReport">读音/单词报错</el-button>
    </el-card>
    <el-card v-if="right" style="width: 100%;max-width: 500px">
      <template #header>
        <div style="display: flex;align-items: center;justify-content: space-between;width:100%">

          <div style="text-align:center;">答题卡</div>
          <div>共：{{ words.length }}, 目前: {{ usedWords.size }}, 剩余：{{ words.length - usedWords.size }}</div>
          <div>正确率： {{ ((avg(acc)) * 100).toFixed(0) }}%</div>

        </div>
      </template>
      <div class="question" v-if="randomWords.length>0">
        <ruby>{{ right.word }}
          <rt> {{ right.pronunciation }}</rt>
        </ruby>
      </div>
      <template v-else>
        <div style="text-align:center;">
          <h2>恭喜你完成了本轮答题！</h2>
          <div>你回答了共：{{ words.length }}个单词</div>
          <div>正确： {{ acc.filter(i => i).length }}</div>
          <div>错误： {{ acc.filter(i => !i).length }}</div>
          <div>正确率： {{ ((avg(acc)) * 100).toFixed(0) }}%</div>

        </div>
        <div style="text-align:center;margin-top:20px;">
          <el-button @click="restart">重新开始</el-button>
        </div>
      </template>
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
    <el-drawer title="答题设置" v-model="settingsVisible" size="80%">
      <SettingsPanel v-if="settingsVisible" @success="onConfirm" />
    </el-drawer>
    <el-drawer title="读音报错" v-model="reportVisible" size="80%">
      <Recorder v-if="right" :word="right" />
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { BASE_URL } from '@/env'
import request from '@/request'
import { avg, getRandomElementsFromArray } from '@/util'
import { Howl } from 'howler'
import WordRangeManager from '@/components/WordRangeManager.vue'
import Recorder from '@/components/Recorder.vue'
import { useSettingsStore } from '@/stores/settings'
import SettingsPanel from '@/components/SettingsPanel.vue'

export default defineComponent({
  name: 'Index',
  components: { SettingsPanel, Recorder, WordRangeManager },
  computed: {
    ...mapState(useUserStore, ['user', 'token'])
  },
  data() {
    return {
      settingsVisible: false,
      reportVisible: false,
      BASE_URL,
      usedWords: new Set() as Set<Word>,
      rawWords: [] as Word[],
      words: [] as Word[],
      randomWords: [] as Word[],
      acc: [] as boolean[],
      right: null as null | Word,
      prevError: null as null | Word,
      audio: null as HTMLAudioElement | null
    }
  },
  mounted() {
    this.getWords()
  },
  methods: {
    avg,
    onConfirm() {
      this.settingsVisible = false
      this.getWords().then(() => {
        this.restart()
      })
    },
    restart() {
      this.prevError = null
      this.usedWords.clear()
      this.right = null
      this.randomWords = []
      this.acc = []
      this.getRandomWords()
    },
    checkWord(word) {
      console.log(this.usedWords.size)
      if (word.word === this.right!.word) {
        ElMessage.success('正确！')
        this.acc[this.usedWords.size - 1] = this.prevError != this.right
        this.getRandomWords()
      } else {
        this.prevError = this.right
        ElMessage.error('错误！')
      }
      // this.right = word
      // this.randomWords = getRandomElementsFromArray(this.words, 4)
    },
    async getWords() {
      const settings = useSettingsStore()
      const { data } = await request.post('wordsList', {
        question_range: settings.question_range,
        question_count: settings.question_count
      })
      if (data.code === 200) {
        this.rawWords = this.words = data.data
      }
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
      this.audio!.play()
      this.usedWords.add(this.right)
    },
    selectRange() {
      // ElMessage.info('开发中……')
      this.settingsVisible = true
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
  max-width: 500px;
  width: 100%;
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
