<template>
  <div>
    <div class="operator">

      <el-button @click="selectedItems=preSelectedItems=[]">清空选择</el-button>
      <el-button @click="selectedItems=preSelectedItems=items">全选</el-button>
      <el-button @click="$emit('confirm', selectedItems)">确定</el-button>
    </div>
    <el-alert type="success">框选下面的单词, 默认反选, 按住shift加选，点击也可以选中。</el-alert>
    <div
      tabindex="0"
      class="selection-box"
      ref="selectionBox"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseUp"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
    >
      <div :style="selectionBoxStyles" v-if="isSelecting"></div>
      <ul class="word-list">
        <li class="word-item" :class="{active: preSelectedItems.includes(item)}" v-for="(item, index) in items" :key="item.id" :ref="`item${index}`">
          <div class="ruby">
            <ruby>
              {{ item.word }}
              <rt>{{ item.pronunciation }}</rt>
            </ruby>
          </div>
          <div>{{ item.translation }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['confirm'],
  props: {
    items: {
      type: Array,
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
      selectedItems: [],
      preSelectedItems: []
    }
  },
  computed: {
    selectionBoxStyles() {
      const styles = {
        position: 'fixed',
        border: '1px dashed #000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        left: `${Math.min(this.startX, this.endX)}px`,
        top: `${Math.min(this.startY, this.endY)}px`,
        width: `${Math.abs(this.startX - this.endX)}px`,
        height: `${Math.abs(this.startY - this.endY)}px`
      }
      return styles
    }
  },
  mounted() {

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
      // if (event.target != this.$refs.selectionBox) {
      //   return
      // }
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
      console.log('this.isControl, this.isShift:', this.isControl, this.isShift)

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
  padding: 50px;
  user-select: none;
  max-height: 600px;
  overflow-y: auto;
}

li.active {
  background-color: #8bffcf;

}

.word-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
}

.word-item {
  .ruby {
    font-size: 20px;
    font-weight: bold;
  }

  width: calc(25% - 20px);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  margin: 10px;
  text-align: center;
  padding: 10px 20px;
}

.operator {
  margin-bottom: 20px;
}
</style>
