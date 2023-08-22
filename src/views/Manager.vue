<template>
  <el-card header="管理中心">
    <el-tabs>
      <el-tab-pane label="单词">
        <div class="operator">
          <el-button @click="handleCreate">添加单词</el-button>
          <el-upload
            ref="upload"
            class="upload-demo"
            :action="BASE_URL + 'uploadfile/'"
            :headers="{'Authorization': 'Bearer '+ token}"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <template #trigger>
              <el-button type="primary">导入单词</el-button>
            </template>
          </el-upload>
          <el-button icon="refresh" @click="getWords" :loading="loading"></el-button>
          <el-form-item>
            <el-input placeholder="筛选单词" v-model="searchQuery.word"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input placeholder="筛选翻译" v-model="searchQuery.translation"></el-input>
          </el-form-item>
          <el-form-item>
            <el-select placeholder="筛选分类" v-model="searchQuery.category_id" clearable>
              <el-option
                v-for="item in categories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-table :data="sliceData" style="height: calc(80vh - 60px - 40px)" :row-class-name="tableRowClassName" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80px"></el-table-column>
          <el-table-column prop="word" label="日文"></el-table-column>
          <el-table-column prop="translation" label="中文"></el-table-column>
          <el-table-column prop="pronunciation" label="注音">
            <template #default="{row}">
              <el-link type="primary" :underline="false" @click="playRow(row)"><span style="margin-right: 8px;">{{ row.pronunciation }}</span>
                <el-icon v-if="row.audio">
                  <Headset />
                </el-icon>
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="category.name" label="分类"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column label="操作" width="200px">
            <template #default="{row}">
              <div class="operator">
                <el-link :underline="false" type="primary" @click="handleEdit(row)">编辑</el-link>
                <el-link :underline="false" type="danger" @click="handleDelete(row)">删除</el-link>
                <el-link :underline="false" type="primary" @click="handleGenerate(row)" :disabled="row.loading">
                  <el-icon :loading="row.loading" v-if="row.loading">
                    <Loading />
                  </el-icon>
                  生成读音
                </el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next" :total="filteredData.length" v-model:current-page="currentPage" v-model:page-size="pageSize" />
      </el-tab-pane>
      <el-tab-pane label="分类">
        <div class="operator">
          <el-button @click="handleCreateCategory">添加分类</el-button>
        </div>
        <el-table :data="categories" style="height: calc(80vh - 60)">
          <el-table-column prop="id" label="ID"></el-table-column>
          <el-table-column prop="name" label="分类名"></el-table-column>
          <el-table-column label="操作">
            <template #default="{row}">
              <el-link :underline="false" style="margin-right: 8px;" type="primary" @click="handleEditCategory(row)">编辑</el-link>
              <el-link :underline="false" type="primary" @click="handleDeleteCategory(row)">删除</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="报错">
        <FeedbackManage />
      </el-tab-pane>
    </el-tabs>
    <!-- 单词添加/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="editVisible">
      <el-form label-width="120px">
        <el-form-item label="日文">
          <el-input v-model="form.word" />
        </el-form-item>
        <el-form-item label="中文">
          <el-input v-model="form.translation" />
        </el-form-item>
        <el-form-item label="注音">
          <el-input v-model="form.pronunciation" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category_id" placeholder="请选择">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">确定</el-button>
          <el-button @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog :title="categoryTab.dialogTitle" v-model="categoryTab.editVisible">
      <el-form label-width="120px" @submit.navive.prevent="onSubmitCategory">
        <el-form-item label="分类名">
          <el-input v-model="categoryTab.form.name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitCategory">确定</el-button>
          <el-button @click="onCancelCategory">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </el-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox, genFileId, UploadInstance, UploadRawFile } from 'element-plus'
import { BASE_URL } from '@/env'
import request from '@/request'
import FeedbackManage from '@/views/components/FeedbackManage.vue'

export default defineComponent({
  name: 'Manager',
  components: { FeedbackManage },
  computed: {
    ...mapState(useUserStore, ['user', 'token']),
    sliceData() {
      return this.filteredData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    filteredData() {
      let words = this.words
      if (this.searchQuery.word) {
        words = words.filter(i => i.word.indexOf(this.searchQuery.word) !== -1)
      }
      if (this.searchQuery.translation) {
        words = words.filter(i => i.translation.indexOf(this.searchQuery.translation) !== -1)
      }
      if (this.searchQuery.category_id) {
        words = words.filter(i => i.category_id === this.searchQuery.category_id)
      }
      return words
    }
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 20,
      BASE_URL,
      words: [],
      categories: [],
      searchQuery: {
        word: '',
        translation: '',
        category_id: null
      },
      dialogTitle: '',
      editVisible: false,
      loading: false,
      form: {
        id: null,
        word: '',
        translation: '',
        pronunciation: '',
        category_id: '',
        remark: ''
      },
      categoryTab: {
        dialogTitle: '',
        editVisible: false,
        form: {
          id: null,
          name: ''
        }
      }
    }
  },
  mounted() {
    this.getWords()
    this.getCategories()
  },
  methods: {
    tableRowClassName({ row }) {
      return row.loading ? 'loading' : ''
    },
    handleExceed(files) {
      (this.$refs.upload as UploadInstance).clearFiles()
      const file = files[0] as UploadRawFile
      file.uid = genFileId()
      ;(this.$refs.upload as UploadInstance).handleStart(file)
    },
    getWords() {
      this.loading = true
      request.get('words').then(({ data }) => {
        this.loading = false
        if (data.code === 200) {
          this.words = data.data
        }
      })
    },
    getCategories() {
      request.get('categories/').then(({ data }) => {
        if (data.code === 200) {
          this.categories = data.data
        }
      })
    },
    handleCreate() {
      this.dialogTitle = '添加单词'
      this.editVisible = true
      this.form = {
        id: null,
        word: '',
        translation: '',
        pronunciation: '',
        category_id: '',
        remark: ''
      }
    },
    handleEdit(row) {
      this.dialogTitle = '编辑单词'
      this.editVisible = true
      this.form = { ...row }
    },
    handleDelete(row) {
      console.log(row)
      ElMessageBox.confirm('确认要删除吗', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }).then(res => {
        request.delete(`words/${row.id}`).then(({ data }) => {
          console.log(data)
          if (data.code === 200) {
            ElMessage.success(data.message)
            this.getWords()
          }
        })
      })
    },
    handleGenerate(row) {
      row.loading = true
      request.get(`words/${row.id}/audio`).then(({ data }) => {
        row.loading = false
        if (data.code === 200) {
          ElMessage.success(data.message)
          this.getWords()
        }
      })
    },
    onSubmit() {
      if (this.form.id) {
        request.put(`words/${this.form.id}`, this.form).then(({ data }) => {
          console.log(data)
          if (data.code === 200) {
            ElMessage.success(data.message)
            this.editVisible = false
            this.getWords()
          }
        })
      } else {
        request.post('words/', this.form).then(({ data }) => {
          console.log(data)
          if (data.code === 200) {
            ElMessage.success(data.message)
            this.editVisible = false
            this.getWords()
          }
        })
      }
    },
    onCancel() {
      this.editVisible = false
    },
    playRow(row) {
      if (row.audio) {
        console.log(row.audio)
        const audio = new Audio(row.audio)
        audio.play()
      }
    },
    ///////////////
    /// 分类部分 ///
    ///////////////
    handleCreateCategory() {
      this.categoryTab.dialogTitle = '添加分类'
      this.categoryTab.editVisible = true
      this.categoryTab.form = {
        id: null,
        name: ''
      }

    },
    handleEditCategory(row) {
      this.categoryTab.dialogTitle = '编辑分类'
      this.categoryTab.editVisible = true
      this.categoryTab.form = { ...row }
    },
    handleDeleteCategory(row) {
      console.log(row)
      ElMessageBox.confirm('确认要删除吗', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }).then(res => {
        request.delete(`categories/${row.id}`).then(({ data }) => {
          if (data.code === 200) {
            ElMessage.success(data.message)
            this.getCategories()
          }
        })
      })
    },
    onSubmitCategory() {
      if (this.categoryTab.form.id) {
        request.put(`categories/${this.categoryTab.form.id}`, this.categoryTab.form).then(({ data }) => {
          if (data.code === 200) {
            ElMessage.success(data.message)
            this.categoryTab.editVisible = false
            this.getCategories()
          }
        })
      } else {
        request.post('categories/', this.categoryTab.form).then(({ data }) => {
          if (data.code === 200) {
            ElMessage.success(data.message)
            this.categoryTab.editVisible = false
            this.getCategories()
          }
        })
      }
    },
    onCancelCategory() {
      this.categoryTab.editVisible = false
    }
  }
})
</script>

<style scoped lang="scss">
.operator {
  display: flex;

  ::v-deep(.el-link),
  ::v-deep(.el-button) {
    margin-right: 8px;
  }
}
</style>
