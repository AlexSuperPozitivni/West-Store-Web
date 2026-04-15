<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useActivityLog } from '../../lib/useActivityLog'

const { entries, clear, reload } = useActivityLog()

const filterAction = ref('')

const actionLabels: Record<string, string> = {
  create: 'Создание',
  update: 'Обновление',
  delete: 'Удаление',
  upload: 'Загрузка',
  'bulk-delete': 'Массовое удаление',
  'status-change': 'Смена статуса',
  'reorder': 'Сортировка'
}

const actionColors: Record<string, string> = {
  create: '#67c23a',
  update: '#409EFF',
  delete: '#f56c6c',
  upload: '#e6a23c',
  'bulk-delete': '#f56c6c',
  'status-change': '#909399',
  'reorder': '#409EFF'
}

const uniqueActions = computed(() => {
  const set = new Set(entries.value.map(e => e.action))
  return Array.from(set)
})

const filteredEntries = computed(() => {
  if (!filterAction.value) return entries.value
  return entries.value.filter(e => e.action === filterAction.value)
})

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин. назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч. назад`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн. назад`
  return ''
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm('Очистить всю историю действий?', 'Подтверждение')
    clear()
    ElMessage.success('История очищена')
  } catch {}
}
</script>

<template>
  <div class="log-page">
    <div class="page-header">
      <div class="header-content">
        <h2>История действий</h2>
        <span class="subtitle">Журнал всех операций в админ-панели</span>
      </div>
      <div class="header-actions">
        <el-button @click="reload">Обновить</el-button>
        <el-button type="danger" @click="handleClear" :disabled="entries.length === 0">Очистить</el-button>
      </div>
    </div>

    <div class="filters-bar" v-if="entries.length > 0">
      <el-select v-model="filterAction" placeholder="Все действия" clearable style="width: 200px">
        <el-option
          v-for="action in uniqueActions"
          :key="action"
          :label="actionLabels[action] || action"
          :value="action"
        />
      </el-select>
      <span class="entries-count">{{ filteredEntries.length }} записей</span>
    </div>

    <div class="log-list">
      <div v-if="filteredEntries.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>Нет записей</p>
      </div>

      <div v-for="entry in filteredEntries" :key="entry.id" class="log-entry">
        <div class="log-timeline">
          <span class="log-dot" :style="{ background: actionColors[entry.action] || '#909399' }"></span>
          <span class="log-line"></span>
        </div>
        <div class="log-body">
          <div class="log-top">
            <span class="log-badge" :style="{ background: actionColors[entry.action] || '#909399' }">
              {{ actionLabels[entry.action] || entry.action }}
            </span>
            <span class="log-target">{{ entry.target }}</span>
            <span class="log-relative" v-if="formatRelative(entry.timestamp)">{{ formatRelative(entry.timestamp) }}</span>
          </div>
          <div class="log-detail" v-if="entry.detail">{{ entry.detail }}</div>
          <div class="log-date">{{ formatDate(entry.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }
.header-actions { display: flex; gap: 8px; }

.filters-bar {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  padding: 14px 20px; background: var(--card-bg, #ffffff); border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06));
}
.entries-count { margin-left: auto; font-size: 13px; color: var(--text-muted, #909399); }

.log-list {
  background: var(--card-bg, #ffffff); border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); padding: 24px;
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 20px; color: var(--text-muted, #c0c4cc);
}
.empty-state p { margin-top: 12px; font-size: 15px; }

.log-entry { display: flex; gap: 16px; }

.log-timeline {
  display: flex; flex-direction: column; align-items: center; width: 16px; flex-shrink: 0;
}
.log-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
.log-line { width: 2px; flex: 1; background: var(--border, #e4e7ed); margin: 4px 0; }

.log-body { flex: 1; padding-bottom: 20px; border-bottom: 1px solid var(--border, #f0f2f5); margin-bottom: 4px; }
.log-entry:last-child .log-body { border-bottom: none; }
.log-entry:last-child .log-line { display: none; }

.log-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.log-badge {
  font-size: 11px; color: #fff; padding: 2px 10px; border-radius: 4px;
  white-space: nowrap; font-weight: 500;
}
.log-target { font-size: 14px; font-weight: 600; color: var(--text-primary, #303133); }
.log-relative { font-size: 12px; color: var(--text-muted, #b0b3b8); margin-left: auto; }
.log-detail { font-size: 13px; color: var(--text-secondary, #606266); margin-top: 4px; }
.log-date { font-size: 12px; color: var(--text-muted, #c0c4cc); margin-top: 4px; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
}
</style>
