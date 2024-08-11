import { defineStore } from 'pinia'
import request from '@/request'
import { ElMessage } from 'element-plus'
import { getUserRouter, resetRouter } from '@/router/router'
import type { RouteRecord } from 'vue-router'
import router from '@/router'

declare type SettingsStore = {
  /**
   * 答题范围
   */
  question_range: QuestionRange
  /**
   * 单次数量
   */
  question_count: number
  /**
   * 答题类型
   */
  question_type: 'word' | 'pronounce'
  /**
   * 每日答题数量
   */
  daily_count: number
  /**
   * 关闭音频
   */
  close_audio: boolean

}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsStore => {
    return {
      question_range: {
        type: 'word',
        range: []
      },
      close_audio:false,
      question_type: 'word',
      question_count: 40,
      daily_count: 40
    }
  },
  actions: {
    setRange(range: QuestionRange) {
      this.question_range = range
    },
    setCount(count: number) {
      this.question_count = count
    },
    setType(type: 'word' | 'pronounce') {
      this.question_type = type
    },
    setDailyCount(count: number) {
      this.daily_count = count
    },
    setCloseAudio(close: boolean) {
      this.close_audio = close
    },
  }
})
