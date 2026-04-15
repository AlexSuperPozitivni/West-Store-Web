<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../../lib/api'
import { useActivityLog } from '../../lib/useActivityLog'

const router = useRouter()
const { entries: logEntries } = useActivityLog()

const stats = ref({
  products: 0,
  categories: 0,
  activeProducts: 0,
  mediaFiles: 0
})
const loading = ref(true)
const recentProducts = ref<any[]>([])

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '/storage'

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}/${cleanPath}`
}

const handleAuthError = (e: any) => {
  const status = e?.response?.status
  if (status === 401 || status === 403) {
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_user')
    router.push('/login')
    return true
  }
  return false
}

const fetchStats = async () => {
  loading.value = true
  try {
    const [productsRes, categoriesRes, mediaRes] = await Promise.allSettled([
      api.get('/admin/products'),
      api.get('/admin/categories'),
      api.get('/media')
    ])

    if (productsRes.status === 'fulfilled') {
      const products = productsRes.value.data || []
      stats.value.products = products.length
      stats.value.activeProducts = products.filter((p: any) => p.is_active).length
      recentProducts.value = products.slice(0, 5)
    }
    if (categoriesRes.status === 'fulfilled') {
      stats.value.categories = (categoriesRes.value.data || []).length
    }
    if (mediaRes.status === 'fulfilled') {
      stats.value.mediaFiles = (mediaRes.value.data || []).length
    }
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки статистики')
  } finally {
    loading.value = false
  }
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин. назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч. назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

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

onMounted(fetchStats)
</script>

<template>
  <div class="dashboard-page" v-loading="loading">
    <div class="page-header">
      <div class="header-content">
        <h2>Панель управления</h2>
        <span class="subtitle">Обзор магазина Onlyphones</span>
      </div>
    </div>

    <div class="stats-grid">
      <router-link to="/admin/products" class="stat-card">
        <div class="stat-icon products-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.products }}</div>
          <div class="stat-label">Товаров</div>
        </div>
      </router-link>

      <router-link to="/admin/products" class="stat-card">
        <div class="stat-icon active-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.activeProducts }}</div>
          <div class="stat-label">Активных</div>
        </div>
      </router-link>

      <router-link to="/admin/categories" class="stat-card">
        <div class="stat-icon categories-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.categories }}</div>
          <div class="stat-label">Категорий</div>
        </div>
      </router-link>

      <router-link to="/admin/media" class="stat-card">
        <div class="stat-icon media-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.mediaFiles }}</div>
          <div class="stat-label">Медиа-файлов</div>
        </div>
      </router-link>
    </div>

    <div class="dashboard-grid">
      <div class="panel recent-products">
        <div class="panel-header">
          <h3>Последние товары</h3>
          <router-link to="/admin/products" class="panel-link">Все товары</router-link>
        </div>
        <div class="panel-body">
          <div v-if="recentProducts.length === 0" class="empty-text">Нет товаров</div>
          <div v-for="product in recentProducts" :key="product.id" class="product-row">
            <div class="product-thumb">
              <img v-if="product.image_main" :src="getImageUrl(product.image_main)" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
              <div v-else class="thumb-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-meta">{{ product.category?.name || '—' }}</div>
            </div>
            <div class="product-price">{{ Number(product.price).toLocaleString() }} ₽</div>
            <span :class="['status-dot', product.is_active ? 'active' : 'inactive']"></span>
          </div>
        </div>
      </div>

      <div class="panel activity-panel">
        <div class="panel-header">
          <h3>Последние действия</h3>
          <router-link to="/admin/activity-log" class="panel-link">Все записи</router-link>
        </div>
        <div class="panel-body">
          <div v-if="logEntries.length === 0" class="empty-text">Нет записей</div>
          <div v-for="entry in logEntries.slice(0, 8)" :key="entry.id" class="log-row">
            <span class="log-badge" :style="{ background: actionColors[entry.action] || '#909399' }">
              {{ actionLabels[entry.action] || entry.action }}
            </span>
            <span class="log-target">{{ entry.target }}</span>
            <span class="log-detail" v-if="entry.detail">{{ entry.detail }}</span>
            <span class="log-time">{{ formatTime(entry.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 30px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }

.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px; margin-bottom: 30px;
}
.stat-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--card-bg, #ffffff); padding: 24px; border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
  text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px var(--shadow, rgba(0,0,0,0.12)); }

.stat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.stat-icon svg { width: 26px; height: 26px; }
.products-icon { background: rgba(64,158,255,0.12); color: #409EFF; }
.active-icon { background: rgba(103,194,58,0.12); color: #67c23a; }
.categories-icon { background: rgba(230,162,60,0.12); color: #e6a23c; }
.media-icon { background: rgba(144,147,153,0.12); color: #909399; }

.stat-number { font-size: 28px; font-weight: 700; color: var(--text-primary, #303133); line-height: 1; }
.stat-label { font-size: 13px; color: var(--text-muted, #909399); margin-top: 4px; }

.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.panel {
  background: var(--card-bg, #ffffff); border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); overflow: hidden;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 24px; border-bottom: 1px solid var(--border, #ebeef5);
}
.panel-header h3 { margin: 0; font-size: 16px; color: var(--text-primary, #303133); font-weight: 600; }
.panel-link { font-size: 13px; color: #409EFF; text-decoration: none; }
.panel-link:hover { text-decoration: underline; }
.panel-body { padding: 12px 24px; }

.empty-text { padding: 24px 0; text-align: center; color: var(--text-muted, #909399); font-size: 14px; }

.product-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--border, #f0f2f5);
}
.product-row:last-child { border-bottom: none; }

.product-thumb {
  width: 40px; height: 40px; border-radius: 8px; overflow: hidden;
  background: var(--bg-secondary, #f5f7fa); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { color: var(--text-muted, #c0c4cc); }

.product-info { flex: 1; min-width: 0; }
.product-name { font-size: 14px; color: var(--text-primary, #303133); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-meta { font-size: 12px; color: var(--text-muted, #909399); }
.product-price { font-size: 14px; font-weight: 600; color: var(--text-primary, #303133); white-space: nowrap; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-dot.active { background: #67c23a; }
.status-dot.inactive { background: #f56c6c; }

.log-row {
  display: flex; align-items: center; gap: 8px; padding: 8px 0; flex-wrap: wrap;
  border-bottom: 1px solid var(--border, #f0f2f5); font-size: 13px;
}
.log-row:last-child { border-bottom: none; }
.log-badge {
  font-size: 11px; color: #fff; padding: 2px 8px; border-radius: 4px;
  white-space: nowrap; font-weight: 500;
}
.log-target { color: var(--text-primary, #303133); font-weight: 500; }
.log-detail { color: var(--text-muted, #909399); }
.log-time { margin-left: auto; color: var(--text-muted, #b0b3b8); font-size: 12px; white-space: nowrap; }

@media (max-width: 900px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
