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
  daily_count: number

}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsStore => {
    return {
      question_range: {
        type: 'word',
        range: []
      },
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
    }
  }
})
