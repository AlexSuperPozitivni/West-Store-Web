<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: '',
})

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const editor = ref<HTMLElement | null>(null)

onMounted(() => {
  if (editor.value) editor.value.innerHTML = props.modelValue || ''
})

// Внешнее изменение значения (например, загрузка с сервера) → обновляем DOM,
// но не трогаем во время набора, чтобы не сбивать курсор.
watch(() => props.modelValue, (val) => {
  if (editor.value && document.activeElement !== editor.value && editor.value.innerHTML !== (val || '')) {
    editor.value.innerHTML = val || ''
  }
})

const sync = () => {
  if (editor.value) emit('update:modelValue', editor.value.innerHTML)
}

const exec = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  editor.value?.focus()
  sync()
}

const addLink = () => {
  const url = window.prompt('Введите ссылку (URL):', 'https://')
  if (url) exec('createLink', url)
}
</script>

<template>
  <div class="rte">
    <div class="rte-toolbar">
      <button type="button" title="Жирный" @click="exec('bold')"><b>Ж</b></button>
      <button type="button" title="Курсив" @click="exec('italic')"><i>К</i></button>
      <button type="button" title="Список" @click="exec('insertUnorderedList')">• Список</button>
      <button type="button" title="Ссылка" @click="addLink">🔗 Ссылка</button>
      <button type="button" title="Убрать форматирование" class="rte-clear" @click="exec('removeFormat')">✕ Очистить</button>
    </div>
    <div
      ref="editor"
      class="rte-content"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="sync"
      @blur="sync"
    ></div>
  </div>
</template>

<style scoped>
.rte {
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.rte-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 8px;
  background: #f5f7fa;
  border-bottom: 1px solid var(--el-border-color, #ebeef5);
}

.rte-toolbar button {
  border: 1px solid transparent;
  background: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  color: #303133;
  cursor: pointer;
  transition: all 0.15s;
}

.rte-toolbar button:hover {
  border-color: #409eff;
  color: #409eff;
}

.rte-clear {
  margin-left: auto;
  color: #909399 !important;
}

.rte-content {
  min-height: 90px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  outline: none;
}

.rte-content:empty::before {
  content: attr(data-placeholder);
  color: #c0c4cc;
}

.rte-content :deep(ul) {
  margin: 6px 0;
  padding-left: 20px;
}

.rte-content :deep(a) {
  color: #409eff;
}
</style>
