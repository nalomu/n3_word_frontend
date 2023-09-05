<template>
  <div class="index-container">
    <el-card class="operator">
      <el-button round @click="restart">{{ right ? '重新开始' : '开始答题' }}</el-button>
      <el-button round @click="selectRange">答题设置</el-button>
      <el-button round v-if="user && right" @click="errorReport">读音/单词报错</el-button>
    </el-card>
    <el-card class="operator">
      题库：共{{ total }} 个单词，目前 {{ currentStart }} - {{ currentEnd }}
      <el-button round @click="nextChapter">跳过本节</el-button>
      <el-button round @click="showWords">查看本节单词</el-button>
    </el-card>
    <el-card v-if="right" style="width: 100%;max-width: 500px">
      <template #header>
        <div style="display: flex;align-items: center;justify-content: space-between;width:100%">

          <div style="text-align:center;">答题卡</div>
          <div>共：{{ words.length }}, 目前: {{ usedWords.size }}, 剩余：{{ words.length - usedWords.size }}</div>
          <div>正确率： {{ ((avg(acc)) * 100).toFixed(0) }}%</div>

        </div>
      </template>
      <div v-if="randomWords.length>0" class="question">
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
          <el-button type="primary" @click="nextChapter">下一章节</el-button>
        </div>
      </template>
      <!--<el-button-group style="width: 100%;display:flex;">-->
      <el-row :gutter="20" class="answer">
        <el-col v-for="word in randomWords" :md="6" :sm="12" :xs="12" class="answer-col">
          <el-button
            style="flex: 1;width: 100px;height: 100px;padding: 15px;word-break: break-all"
            @click="checkWord(word)"
          >

            {{ word.translation }}
          </el-button>
        </el-col>
      </el-row>
      <!--</el-button-group>-->
    </el-card>
    <el-drawer v-model="settingsVisible" size="80%" title="答题设置">
      <SettingsPanel v-if="settingsVisible" @success="onConfirm" />
    </el-drawer>
    <el-drawer v-model="reportVisible" size="80%" title="读音报错">
      <Recorder v-if="right" :word="right" />
    </el-drawer>
    <el-drawer v-model="wordsVisible" size="80%" title="本节单词">
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
// 重新开始答题
const restart = () => {
  prevError.value = null
  usedWords.value.clear()
  right.value = null
  randomWords.value = []
  acc.value = []
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

// 检查单词是否正确
const checkWord = (word) => {
  console.log(usedWords.value.size)
  if (word.word === right.value!.word) {
    ElNotification.success('正确！')
    acc.value[usedWords.value.size - 1] = prevError.value != right.value
    getRandomWords()
  } else {
    prevError.value = right.value
    ElNotification.error('错误！')
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
</style>
