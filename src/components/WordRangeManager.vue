<template>
  <div class="wrm">
    <div class="operator">
      <el-button @click="selectedItems=preSelectedItems=[]">清空选择</el-button>
      <el-button @click="selectedItems=preSelectedItems=items">全选</el-button>
    </div>
    <el-alert type="success">框选下面的单词, 默认反选, 按住shift加选，点击也可以选中。</el-alert>
    <div
      ref="selectionBox"
      class="selection-box"
      tabindex="0"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      @mousedown="handleMouseDown"
      @mouseleave="handleMouseUp"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <div v-if="isSelecting" :style="selectionBoxStyles"></div>
      <el-row :gutter="20" class="word-list">
        <el-col v-for="(item, index) in items" :key="item.id" :lg="6" :md="6" :sm="12" :xl="4" :xs="12">
          <div :ref="`item${index}`" :class="{active: preSelectedItems.includes(item)}" class="word-item">

            <div class="ruby">
              <ruby>
                {{ item.word }}
                <rt>{{ item.pronunciation }}</rt>
              </ruby>
            </div>
            <div>{{ item.translation }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { StyleValue } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export default defineComponent({
  emits: ['confirm'],
  props: {
    items: {
      type: Array as PropType<Word[]>,
      required: true
    }
  },
  data() {
    return {
      isSelecting: false,
      isShift: false,
      isControl: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      selectedItems: [] as Word[],
      preSelectedItems: [] as Word[]
    }
  },
  computed: {
    selectionBoxStyles(): StyleValue {
      const rect = (this.$refs.selectionBox as HTMLElement).getBoundingClientRect()
      const scrollTop = (this.$refs.selectionBox as HTMLElement).scrollTop
      return {
        zIndex: '99',
        position: 'absolute',
        border: '1px dashed #000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        left: `${Math.min(this.startX, this.endX) - rect.left}px`,
        top: `${Math.min(this.startY, this.endY) - rect.top + scrollTop}px`,
        width: `${Math.abs(this.startX - this.endX)}px`,
        height: `${Math.abs(this.startY - this.endY)}px`
      }

    }
  },
  mounted() {
    this.selectedItems = this.preSelectedItems = this.items!.filter(i => useSettingsStore().question_range.range.includes(i.id))
  },
  methods: {
    handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        this.isSelecting = false
      }
      if (event.key === 'Shift') {
        this.isShift = true
      }
      if (event.key === 'Control') {
        this.isControl = true
      }
    },
    handleKeyUp(event: KeyboardEvent) {

      if (event.key === 'Shift') {
        this.isShift = false
      }
      if (event.key === 'Control') {
        this.isControl = false
      }
    },
    handleMouseDown(event) {
      this.isSelecting = true
      this.startX = event.clientX
      this.startY = event.clientY
      this.endX = event.clientX
      this.endY = event.clientY
    },
    handleMouseUp(event) {
      if (!this.isSelecting) {
        return
      }
      this.isSelecting = false
      this.checkSelectedItems()
    },
    handleMouseMove(event) {
      if (this.isSelecting) {
        this.endX = event.clientX
        this.endY = event.clientY
        this.checkSelectedItems(false)
      }
    },
    checkSelectedItems(change = true) {

      function difference(arr1, arr2) {
        return arr1.filter(item => !arr2.includes(item))
      }

      if (this.isShift) {
        const newItems = this.items.filter((_, index) =>
          this.isItemWithinSelectionBox(index)
        )
        this.preSelectedItems = difference(this.selectedItems, newItems).concat(newItems)
        if (change) {
          this.selectedItems = this.preSelectedItems
        }
      } else {
        const newItems = this.items.filter((_, index) =>
          this.isItemWithinSelectionBox(index)
        )
        this.preSelectedItems = difference(this.selectedItems, newItems).concat(difference(newItems, this.selectedItems))
        if (change) {
          this.selectedItems = this.preSelectedItems
        }
      }
    },
    isItemWithinSelectionBox(index) {
      const itemRect = this.$refs[`item${index}`][0].getBoundingClientRect()

      const left = Math.min(this.startX, this.endX)
      const right = Math.max(this.startX, this.endX)
      const top = Math.min(this.startY, this.endY)
      const bottom = Math.max(this.startY, this.endY)

      return !(
        right < itemRect.left ||
        left > itemRect.right ||
        bottom < itemRect.top ||
        top > itemRect.bottom
      )
    }
  },
  watch: {
    selectedItems() {
      this.$emit('confirm', this.selectedItems)
    }
  }
})
</script>

<style lang="scss" scoped>
.selection-box:focus,
.selection-box:active {
  outline: none;
}

.selection-box {
  border: 1px solid #ebebeb;
  position: relative;
  z-index: 999;
  min-height: 300px;
  //padding: 50px;
  user-select: none;
  max-height: 600px;
  overflow-y: auto;
}

.word-item.active {
  background-color: #8bffcf;

}

.word-list {
  list-style: none;
  //padding: 0;
  //margin: 0;
}

.word-item {
  .ruby {
    font-size: 20px;
    font-weight: bold;
  }

  //width: calc(25% - 20px);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  margin-top: 20px;
  text-align: center;
  padding: 10px 20px;
}

.operator {
  margin-bottom: 20px;
}

</style>
