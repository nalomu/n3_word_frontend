<template>
  <div>
    <el-table :data="data" v-loading="loading" row-key="id">
      <el-table-column label="ID" prop="id" />
      <el-table-column label="状态" prop="status">
        <template #default="{row}">
          <el-tag :type="statusColorMap[row.status]">{{ statusMap[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报错类型" prop="error_type">
        <template #default="{row}">
          {{ errorTypeMap[row.error_type] }}
        </template>
      </el-table-column>
      <el-table-column label="报错单词" prop="word" align="center">
        <template #default="{row}">

          <div style="display:flex;flex-direction: column;align-items: center;">
            <ruby>
              {{ row.word.word }}
              <rt>{{ row.word.pronunciation }}</rt>
            </ruby>
            <div>{{ row.word.translation }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200px">
        <template #default="{row}">
          <el-link :underline="false" type="primary" @click="modalVisible=true;showRecord=row">查看</el-link>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="modalVisible" title="报错详情">
      <el-form label-width="120px" v-if="showRecord">
        <el-form-item label="报错单词">
          <div style="display:flex;flex-direction: column;align-items: center;">
            <ruby>
              {{ showRecord.word.word }}
              <rt>{{ showRecord.word.pronunciation }}</rt>
            </ruby>
            <div>{{ showRecord.word.translation }}</div>
          </div>
        </el-form-item>
        <el-form-item v-if="showRecord.error_type==='pronunciation'" label="上报读音">
          <audio :src="showRecord.audio_url" controls></audio>
        </el-form-item>
        <el-form-item v-if="showRecord.error_type==='translation'" label="上报翻译">
          {{ showRecord.translate }}
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="submit('success')">接受</el-button>
          <el-button type="danger" @click="submit('error')">拒绝</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import request from '@/request'
import { ElMessage } from 'element-plus'

export default defineComponent({
  mounted() {
    this.getData()
  },
  data() {
    return {
      data: [] as Feedback[],
      showRecord: null as null | Feedback,
      loading: false,
      modalVisible: false,
      errorTypeMap: {
        pronunciation: '读音',
        translation: '翻译'
      },
      statusMap: {
        pending: '审核中',
        success: '已接受',
        error: '已驳回'
      },
      statusColorMap: {
        pending: 'warning',
        success: 'success',
        error: 'error'
      }
    }
  },
  methods: {
    getData() {
      this.loading = true
      request.get('/feedbacks').then(({ data }) => {
        this.loading = false
        this.data = data.data
      })
    },
    submit(status) {
      if (!this.showRecord) {
        return
      }
      request.post(`/feedbacks/${this.showRecord.id}`, { status }).then(({ data }) => {
        ElMessage.success(data.message)
        this.modalVisible = false
        this.getData()
      })
    }
  }
})
</script>

<style scoped>

</style>
