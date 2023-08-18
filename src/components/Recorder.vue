<template>
  <div>
    <div>
      <el-button @click="isRecording ? stop() : start()">{{ isRecording ? '停止录音' : (audioUrl ? '重新录音' : '开始录音') }}</el-button>
    </div>
    <div style="margin-top: 20px;">
      <audio :src="audioUrl" v-if="audioUrl" controls autoplay></audio>
    </div>
    <div>
      <el-button @click="submitAudio">提交</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { ElMessage } from 'element-plus'
import request from '@/request'

export default {
  name: 'Recorder',
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isRecording: false,
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
      request.post(`/words/${this.id}/audio`, formData).then(({ data }) => {
        ElMessage.success(data.message)
        this.$emit('success')
      })
    }
  }
}
</script>

<style scoped>

</style>
