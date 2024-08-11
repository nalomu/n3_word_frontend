<template>
  <el-form label-width="80px" @submit.navtive.prevent="submit">
    <el-form-item label="单词数量">
      <el-input-number v-model="settings.question_count" :max="100" :min="1" controls-position="right" />
    </el-form-item>
    <el-form-item label="答题类型">
      <el-radio-group v-model="settings.question_type">
        <el-radio label="word" value="word">词汇练习</el-radio>
        <el-radio label="pronounce" value="pronounce">读音练习</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="关闭朗读">
      <el-switch v-model="settings.close_audio" />
    </el-form-item>
    <el-form-item label="单词范围">
      <el-button @click="selectRange">选择范围</el-button>
      <template v-if="settings.question_range.range?.length">
        当前选择了{{ settings.question_range.range?.length }} 个
        {{ settings.question_range.type === 'word' ? '单词' : '分类' }}
      </template>
      <template v-else>当前使用默认题库({{ words.length }}单词)</template>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" type="primary" @click="submit">保存设置</el-button>
    </el-form-item>
  </el-form>
  <el-drawer v-model="selectRangeVisible" :size="'80%'" title="选择单词范围">
    <el-form label-width="80px">
      <el-form-item label="范围类型">
        <el-select v-model="settings.question_range.type">
          <el-option label="单词" value="word" />
          <el-option label="分类" value="category" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="settings.question_range.type === 'word'" label="单词范围">
        已选择{{ settings.question_range.range?.length }} 个单词
        <word-range-manager v-if="words.length>0" :items="words" @confirm="onConfirm" />
      </el-form-item>
      <el-form-item v-if="settings.question_range.type === 'category'" label="分类范围">
        <el-checkbox-group v-model="settings.question_range.range">
          <el-checkbox v-for="item in categories" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <el-button @click="selectRangeVisible=false">完成</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts" setup>
import { useSettingsStore } from '@/stores/settings'
import { onMounted, ref } from 'vue'
import WordRangeManager from '@/components/WordRangeManager.vue'
import request from '@/request'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['success'])
const settings = useSettingsStore()

const selectRangeVisible = ref(false)
const loading = ref(false)

const selectRange = () => {
  selectRangeVisible.value = true
}
const words = ref([] as Word[])
const categories = ref([] as Category[])
const onConfirm = (data: Word[]) => {
  settings.question_range.range = data.map(i => i.id)
}
onMounted(() => {
  request.get('words').then(({ data }) => {
    words.value = data.data
  })
  request.get('categories').then(({ data }) => {
    categories.value = data.data
  })
})
const submit = () => {
  loading.value = true
  request.post('users/settings', {
    question_count: settings.question_count,
    question_range: settings.question_range,
    question_type: settings.question_type,
    close_audio: settings.close_audio
  }).then(({ data }) => {
    loading.value = false
    ElMessage.success(data.message)
    emit('success')
  })
}

</script>

<style scoped>

</style>
