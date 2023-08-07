<template>
  <el-card header="管理中心">

    <el-upload
      ref="upload"
      class="upload-demo"
      :action="BASE_URL + 'uploadfile/'"
      :headers="{'Authorization': 'Bearer '+ token}"
      :limit="1"
      :on-exceed="handleExceed"
    >
      <template #trigger>
        <el-button type="primary">select file</el-button>
      </template>
      <template #tip>
        <div class="el-upload__tip text-red">
          选择文件后会自动上传
        </div>
      </template>
    </el-upload>
  </el-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { genFileId, UploadInstance, UploadRawFile } from 'element-plus'

export default defineComponent({
  name: 'Manager',
  computed: {
    ...mapState(useUserStore, ['user', 'token'])
  },
  data() {
    return {}
  },
  methods: {
    handleExceed(files) {
      (this.$refs.upload as UploadInstance).clearFiles()
      const file = files[0] as UploadRawFile
      file.uid = genFileId()
      ;(this.$refs.upload as UploadInstance).handleStart(file)
    }
  }
})
</script>

<style scoped>

</style>
