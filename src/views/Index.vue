<template>
  <div class="index-container">
    <el-card class="operator">
      <el-button round @click="restart">{{ right ? '重新开始' : '开始答题' }}</el-button>
      <el-button round @click="selectRange">答题设置</el-button>
      <el-button v-if="user && right" round @click="errorReport">读音/单词报错</el-button>
    </el-card>
    <el-card class="operator">
      题库：共{{ total }} 个单词，目前 {{ currentStart }} - {{ currentEnd }}
      <el-button round @click="nextChapter">跳过本节</el-button>
      <el-button round @click="showWords">查看本节单词</el-button>
    </el-card>
    <el-drawer
      :model-value="!!right"
      size="100%"
      style="width: 100%;max-width: 500px"
      @close="right=null"
      @closed="reset"
    >
      <template #header>
        <div class="answer-header">
          <div style="flex: 1">
            <el-progress :color="colors" :percentage="usedWords.size/words.length * 100" />
          </div>
          <div>正确率： {{ ((avg(acc)) * 100).toFixed(0) }}%</div>
        </div>
      </template>
      <div v-if="randomWords.length>0" class="question">
        <ruby>{{ right.word }}
          <rt> {{ right.pronunciation }}</rt>
        </ruby>
      </div>
      <template v-else>
        <div style="text-align:center; display: flex;flex-direction: column;justify-content: space-around;min-height: 400px">
          <h2>恭喜你完成了本轮答题！</h2>
          <div>

            <div class="flex">
              <div class="result-item">
                <div>单词</div>
                <div style="color:#2c3e50 ">{{ words.length }}个</div>
              </div>
              <div class="result-item">
                <div>正确率</div>
                <div style="color: #27bc7f"> {{ ((avg(acc)) * 100).toFixed(0) }}%</div>
              </div>
            </div>
            <div class="flex">
              <div class="result-item">
                <div>正确</div>
                <div style="color: #27bc7f">{{ acc.filter(i => i).length }}</div>
              </div>
              <div class="result-item">
                <div>错误</div>
                <div style="color: #ff3f3f"> {{ acc.filter(i => !i).length }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="result-action">
          <el-button @click="restart">重新开始</el-button>
          <el-button type="primary" @click="nextChapter">下一章节</el-button>
        </div>
      </template>
      <!--<el-button-group style="width: 100%;display:flex;">-->
      <el-row :gutter="20" class="answer">
        <el-col v-for="word in randomWords" :md="12" :sm="12" :xs="24" class="answer-col">
          <el-button bg class="option-button" text @click="checkWord(word)">
            {{ word.translation }}
          </el-button>
        </el-col>
      </el-row>
      <!--</el-button-group>-->
    </el-drawer>
    <el-drawer v-model="settingsVisible" size="80%" title="答题设置">
      <SettingsPanel v-if="settingsVisible" @success="onConfirm" />
    </el-drawer>
    <el-drawer v-model="reportVisible" size="80%" title="读音报错">
      <Recorder v-if="right" :word="right" />
    </el-drawer>
    <el-drawer v-model="wordsVisible" size="100%" title="本节单词">
      <el-row :gutter="20" class="word-list">
        <el-col v-for="(item, index) in words" :key="item.id" :lg="6" :md="6" :sm="12" :xl="4" :xs="12">
          <div :ref="`item${index}`" class="word-item">

            <div class="ruby">
              <ruby>
                {{ item.word }}
                <rt>{{ item.pronunciation }}</rt>
              </ruby>
            </div>
            <div>{{ item.translation }}</div>
          </div>
        </el-col>

      </el-row>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/request'
import { avg, getRandomElementsFromArray } from '@/util'
import { Howl } from 'howler'
import Recorder from '@/components/Recorder.vue'
import { useSettingsStore } from '@/stores/settings'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { NotificationHandle } from 'element-plus/es/components/notification/src/notification'

// 使用设置存储
const settings = useSettingsStore()

// 创建一些响应式变量
const words = ref<Word[]>([]) // 存储获取的单词列表
const total = ref(0) // 存储总题数
const page = ref(1) // 存储当前页数

const usedWords = ref<Set<Word>>(new Set()) // 存储已经使用的单词集合
const randomWords = ref<Word[]>([]) // 存储随机选取的单词列表
const acc = ref<boolean[]>([]) // 存储答题准确性的数组
const right = ref<Word | null>(null) // 存储当前正确的单词
const prevError = ref<Word | null>(null) // 存储上一个错误的单词


const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]
// 计算属性，计算最大页数
const maxPage = computed(() => {
  return Math.ceil(total.value / (settings.question_count || 40))
})

// 计算属性，计算当前页的起始题号
const currentStart = computed(() => {
  return (page.value - 1) * (settings.question_count || 40) + 1
})

// 计算属性，计算当前页的结束题号
const currentEnd = computed(() => {
  return Math.min(total.value, (page.value) * (settings.question_count || 40))
})

// 获取用户信息
const { user } = useUserStore()


// 获取单词数据
const getWords = async () => {

  const ins = ElMessage({
    duration: 0,
    message: '加载题库中',
    //@ts-ignore
    icon: 'loading'
  })
  const { data } = await request.post('words_list', {
    question_range: settings.question_range,
    question_count: settings.question_count,
    page: page.value
  })
  ins.close()
  if (data.code === 200) {
    words.value = data.data.data
    total.value = data.data.total
  }
}

/**
 * 答题相关部分
 */
//
const reset = () => {
  prevError.value = null
  usedWords.value.clear()
  right.value = null
  randomWords.value = []
  acc.value = []
}

// 重新开始答题
const restart = () => {
  reset()
  getRandomWords()
}

// 切换到下一章节
const nextChapter = () => {
  if (page.value < maxPage.value) {
    page.value++
    getWords().then(restart)
  } else {
    ElMessageBox.confirm('恭喜你，本题库已经完成啦！', '提示', {
      confirmButtonText: '重新开始',
      cancelButtonText: '结束答题'
    }).then(() => {
      page.value = 0
      nextChapter()
    })
  }
}

let notify: NotificationHandle
// 检查单词是否正确
const checkWord = (word) => {
  if (notify) {
    notify.close()
  }
  console.log(usedWords.value.size)
  if (word.word === right.value!.word) {
    notify = ElNotification.success({
      message: '正确！',
      position: 'bottom-right'
    })
    acc.value[usedWords.value.size - 1] = prevError.value != right.value
    getRandomWords()
  } else {
    prevError.value = right.value
    notify = ElNotification.error({
      message: '错误！',
      position: 'bottom-right'
    })
  }
}


const audio = ref(null as HTMLAudioElement | null) // 存储音频元素
// 播放正确的单词的音频
const playRightAudio = () => {
  // 如果已经在播放了先暂停
  if (audio.value) {
    audio.value!.pause()
  }
  audio.value = new Howl({ src: [right.value!.audio] })
  audio.value!.play()
}
// 随机获取单词
const getRandomWords = () => {
  // 如果所有单词都过了一遍就结束了
  if (usedWords.value.size === words.value.length) {
    randomWords.value = []
    return ElMessageBox.confirm('本节完成啦！', '提示', {
      confirmButtonText: '下一章节',
      cancelButtonText: '结束答题'
    }).then(nextChapter)
  }

  // 随机拿4个单词作为选项，其中一个作为正确选项
  randomWords.value = getRandomElementsFromArray(words.value, 4)
  const index = Math.floor(randomWords.value.length * Math.random())
  right.value = randomWords.value[index]
  // 如果已经使用过这个单词就换一个
  if (usedWords.value.has(right.value!)) {
    return getRandomWords()
  }
  usedWords.value.add(right.value!)
  playRightAudio()
}


/**
 * 设置面板和反馈面板
 */
const settingsVisible = ref(false) // 控制设置面板的显示状态
const reportVisible = ref(false) // 控制报告面板的显示状态

// 打开设置面板
const selectRange = () => {
  settingsVisible.value = true
}

// 打开报告面板
const errorReport = () => {
  reportVisible.value = true
}
// 处理确认按钮点击事件
const onConfirm = () => {
  settingsVisible.value = false
  getWords().then(() => {
    restart()
  })
}

const wordsVisible = ref(false)
const showWords = () => {
  wordsVisible.value = true
}

// 在组件挂载后执行初始化操作
onMounted(async () => {
  await getWords()
})

</script>

<style lang="scss" scoped>
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
  // width: 100 %;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.index-container {
  flex-direction: column;
  display: flex;
  align-items: center;
  // justify-content: center;
}

.answer-col {
  text-align: center;
  margin-bottom: 20px;
}

.word-list {
  list-style: none;
  //padding: 0;
  //margin: 0;
}

.word-item {
  .ruby {
    font-size: 20px;
    font-weight: bold;
  }

  //width: calc(25% - 20px);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  margin-top: 20px;
  text-align: center;
  padding: 10px 20px;
}

.option-button {
  flex: 1;
  width: 100%;
  height: 80px;
  padding: 15px;
  word-break: break-all;
  border-radius: 40px;
  font-size: 20px;
  font-weight: bold;
}
.flex{
  display: flex;
}
.result-item{
  font-size: 18px;
  flex: 0 0 calc(50% - 30px);
  margin: 10px 15px;
  border-radius: 15px;
  border: 3px solid #EBEBEB;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.result-action {
  text-align: center;
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .el-button{
    margin: 15px;
    font-size: 20px;
    padding: 30px 40px;
    border-radius: 100px;
  }
}

.answer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
