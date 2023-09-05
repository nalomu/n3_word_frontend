<template>
  <el-form label-width="120px">
    <el-form-item label="报错单词">
      <div style="font-size: 20px;">
        <ruby>
          {{ word.word }}
          <rt>{{ word.pronunciation }}</rt>
        </ruby>
      </div>
    </el-form-item>
    <el-form-item label="错误类型">
      <el-select v-model="error_type" placeholder="选择错误类型">
        <el-option label="读音错误" value="pronunciation"></el-option>
        <el-option label="翻译错误" value="translate"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="读音上传">
      <div>
        <el-button @click="isRecording ? stop() : start()">
          {{ isRecording ? '停止录音' : (audioUrl ? '重新录音' : '开始录音') }}
        </el-button>
      </div>
      <div style="margin-top: 20px;">
        <audio v-if="audioUrl" :src="audioUrl" autoplay controls></audio>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" @click="submitAudio">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { ElMessage } from 'element-plus'
import request from '@/request'
import type { PropType } from 'vue'

export default {
  name: 'Recorder',
  props: {
    word: {
      type: Object as PropType<Word>,
      required: true
    }
  },
  data() {
    return {
      error_type: 'pronunciation',
      isRecording: false,
      loading: false,
      mediaRecorder: null as MediaRecorder | null,
      audioChunks: [],
      audioUrl: '',
      audioBlob: null as Blob | null,
      stream: null as MediaStream | null
    }
  },
  beforeUnmount() {
    this.stop()
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl)
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
  },
  methods: {
    async start() {
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl)
      }
      this.audioChunks = []
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)

      this.mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      })

      this.mediaRecorder.start()
      this.isRecording = true
      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
        this.audioUrl = URL.createObjectURL(this.audioBlob)
        // 现在你可以将 audioBlob 上传到服务器
      }
    },
    stop() {
      if (this.mediaRecorder?.state === 'recording') {
        this.mediaRecorder.stop()
      }
      this.isRecording = false

    },
    submitAudio() {
      if (!this.audioBlob) {
        return ElMessage.error('请先录音')
      }
      const formData = new FormData()
      formData.append('file', this.audioBlob)
      formData.append('error_type', this.error_type)
      this.loading = true
      request.post(`/words/${this.word.id}/feedback/`, formData).then(({ data }) => {
        this.loading = false
        ElMessage.success(data.message)
        this.$emit('success')
      })
    }
  }
}
</script>

<style scoped>

</style>
