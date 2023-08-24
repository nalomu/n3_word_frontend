<template>
  <el-form label-width="80px" @submit.navtive.prevent="submit">
    <el-form-item label="单词数量">
      <el-input-number v-model="settings.question_count" controls-position="right" :min="1" :max="100" />
    </el-form-item>
    <el-form-item label="单词范围">
      <el-button @click="selectRange">选择范围</el-button>
      <template v-if="settings.question_range.range?.length">
        当前选择了{{ settings.question_range.range?.length }} 个 {{ settings.question_range.type === 'word' ? '单词' : '分类' }}
      </template>
      <template v-else>当前使用默认题库({{ words.length }}单词)</template>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" type="primary" @click="submit">保存设置</el-button>
    </el-form-item>
  </el-form>
  <el-drawer title="选择单词范围" v-model="selectRangeVisible" :size="'80%'">
    <el-form label-width="80px">
      <el-form-item label="范围类型">
        <el-select v-model="settings.question_range.type">
          <el-option label="单词" value="word" />
          <el-option label="分类" value="category" />
        </el-select>
      </el-form-item>
      <el-form-item label="单词范围" v-if="settings.question_range.type === 'word'">
        已选择{{ settings.question_range.range?.length }} 个单词
        <word-range-manager v-if="words.length>0" :items="words" @confirm="onConfirm" />
      </el-form-item>
      <el-form-item label="分类范围" v-if="settings.question_range.type === 'category'">
        <el-checkbox-group v-model="settings.question_range.range">
          <el-checkbox v-for="item in categories" :label="item.id" :key="item.id">{{ item.name }}</el-checkbox>
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
  request.post('users/settings', { question_count: settings.question_count, question_range: settings.question_range }).then(({ data }) => {
    loading.value = false
    ElMessage.success(data.message)
    emit('success')
  })
}

</script>

<style scoped>

</style>
