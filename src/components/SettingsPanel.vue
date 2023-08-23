<template>
  <el-form label-width="120px">
    <el-form-item label="单词数量">
      <el-input-number v-model="question_count" controls-position="right" :min="1" :max="100" />
    </el-form-item>
    <el-form-item label="单词范围">
      <el-button @click="selectRange">选择范围</el-button>
      <template v-if="question_range.range?.length">
        当前选择了{{ question_range.range?.length }} 个 {{ question_range.type === 'word' ? '单词' : '分类' }}
      </template>
      <template v-else>当前使用默认题库({{ words.length }}单词)</template>
    </el-form-item>
  </el-form>
  <el-drawer title="选择单词范围" v-model="selectRangeVisible" :size="'80%'">
    <word-range-manager :items="words" @confirm="onConfirm" />
  </el-drawer>
</template>

<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import { onMounted, ref } from 'vue'
import WordRangeManager from '@/components/WordRangeManager.vue'
import request from '@/request'

const settings = useSettingsStore()

const question_count = ref(settings.question_count)
const question_range = ref(settings.question_range)
const selectRangeVisible = ref(false)

const selectRange = () => {
  selectRangeVisible.value = true
}
const words = ref([] as Word[])
const onConfirm = (data: QuestionRange) => {
  settings.setRange(data)
  selectRangeVisible.value = false
}
onMounted(() => {
  request.get('words').then(({ data }) => {
    words.value = data.data
  })
})

</script>

<style scoped>

</style>
