<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../../lib/api'
import { useActivityLog } from '../../lib/useActivityLog'

const router = useRouter()
const { entries: logEntries } = useActivityLog()

const stats = ref({
  products: 0,
  categories: 0,
  activeProducts: 0,
  mediaFiles: 0,
  totalOrders: 0,
  newOrders: 0,
  processingOrders: 0,
  deliveredOrders: 0,
  revenue: 0,
  revenueToday: 0,
  lowStock: 0,
})
const loading = ref(true)
const recentProducts = ref<any[]>([])
const recentOrders = ref<any[]>([])
const topProducts = ref<any[]>([])

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
    const [productsRes, categoriesRes, mediaRes, ordersRes] = await Promise.allSettled([
      api.get('/admin/products'),
      api.get('/admin/categories'),
      api.get('/media'),
      api.get('/admin/orders').catch(() => ({ data: JSON.parse(localStorage.getItem('admin_orders') || '[]') }))
    ])

    if (productsRes.status === 'fulfilled') {
      const products = productsRes.value.data || []
      stats.value.products = products.length
      stats.value.activeProducts = products.filter((p: any) => p.is_active).length
      stats.value.lowStock = products.filter((p: any) => p.stock !== undefined && p.stock !== null && p.stock <= 3).length
      recentProducts.value = products.slice(0, 5)

      // Top products by price (proxy for popular)
      topProducts.value = [...products]
        .filter((p: any) => p.is_active)
        .sort((a: any, b: any) => b.price - a.price)
        .slice(0, 5)
    }
    if (categoriesRes.status === 'fulfilled') {
      stats.value.categories = (categoriesRes.value.data || []).length
    }
    if (mediaRes.status === 'fulfilled') {
      stats.value.mediaFiles = (mediaRes.value.data || []).length
    }
    if (ordersRes.status === 'fulfilled') {
      const orders = ordersRes.value.data || []
      stats.value.totalOrders = orders.length
      stats.value.newOrders = orders.filter((o: any) => o.status === 'new').length
      stats.value.processingOrders = orders.filter((o: any) => o.status === 'processing').length
      stats.value.deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length
      stats.value.revenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      const today = new Date().toISOString().slice(0, 10)
      stats.value.revenueToday = orders
        .filter((o: any) => o.date && o.date.slice(0, 10) === today)
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      recentOrders.value = orders
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
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

const formatPrice = (val: number) => val.toLocaleString('ru-RU') + ' ₽'

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const actionLabels: Record<string, string> = {
  create: 'Создание', update: 'Обновление', delete: 'Удаление',
  upload: 'Загрузка', 'bulk-delete': 'Масс. удаление',
  'status-change': 'Смена статуса', 'reorder': 'Сортировка'
}
const actionColors: Record<string, string> = {
  create: '#67c23a', update: '#409EFF', delete: '#f56c6c',
  upload: '#e6a23c', 'bulk-delete': '#f56c6c',
  'status-change': '#909399', 'reorder': '#409EFF'
}

const statusLabels: Record<string, string> = {
  new: 'Новый', processing: 'В обработке', delivered: 'Доставлен', cancelled: 'Отменён'
}
const statusColors: Record<string, string> = {
  new: '#409EFF', processing: '#e6a23c', delivered: '#67c23a', cancelled: '#f56c6c'
}

const alerts = computed(() => {
  const items: { text: string; type: string; link: string }[] = []
  if (stats.value.newOrders > 0) items.push({ text: `${stats.value.newOrders} новых заказов ожидают обработки`, type: 'warning', link: '/admin/orders' })
  if (stats.value.lowStock > 0) items.push({ text: `${stats.value.lowStock} товаров с низким остатком`, type: 'danger', link: '/admin/products' })
  if (stats.value.processingOrders > 3) items.push({ text: `${stats.value.processingOrders} заказов в обработке`, type: 'info', link: '/admin/orders' })
  return items
})

onMounted(fetchStats)
</script>

<template>
  <div class="dashboard-page" v-loading="loading">
    <div class="page-header">
      <div class="header-content">
        <h2>Панель управления</h2>
        <span class="subtitle">Обзор магазина West-Store</span>
      </div>
      <div class="quick-actions">
        <RouterLink to="/admin/products" class="quick-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Товар
        </RouterLink>
        <RouterLink to="/admin/orders" class="quick-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Заказы
        </RouterLink>
        <RouterLink to="/admin/analytics" class="quick-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Аналитика
        </RouterLink>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="alerts.length" class="alerts-section">
      <RouterLink v-for="(alert, i) in alerts" :key="i" :to="alert.link" :class="['alert-card', alert.type]">
        <svg v-if="alert.type === 'warning'" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
        <svg v-else-if="alert.type === 'danger'" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        <span>{{ alert.text }}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="alert-arrow"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </RouterLink>
    </div>

    <!-- Revenue + Orders Stats -->
    <div class="revenue-row">
      <div class="revenue-card main-revenue">
        <div class="revenue-label">Общая выручка</div>
        <div class="revenue-value">{{ formatPrice(stats.revenue) }}</div>
        <div class="revenue-sub">Сегодня: {{ formatPrice(stats.revenueToday) }}</div>
      </div>
      <div class="revenue-card">
        <div class="revenue-mini-value" style="color:#409EFF">{{ stats.newOrders }}</div>
        <div class="revenue-label">Новые</div>
      </div>
      <div class="revenue-card">
        <div class="revenue-mini-value" style="color:#e6a23c">{{ stats.processingOrders }}</div>
        <div class="revenue-label">В обработке</div>
      </div>
      <div class="revenue-card">
        <div class="revenue-mini-value" style="color:#67c23a">{{ stats.deliveredOrders }}</div>
        <div class="revenue-label">Доставлены</div>
      </div>
      <div class="revenue-card">
        <div class="revenue-mini-value">{{ stats.totalOrders }}</div>
        <div class="revenue-label">Всего заказов</div>
      </div>
    </div>

    <!-- Stats Grid -->
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
          <div class="stat-label">Медиа</div>
        </div>
      </router-link>
    </div>

    <!-- Main Grid: Recent Orders + Top Products + Activity -->
    <div class="dashboard-grid-3">
      <!-- Recent Orders -->
      <div class="panel">
        <div class="panel-header">
          <h3>Последние заказы</h3>
          <router-link to="/admin/orders" class="panel-link">Все заказы</router-link>
        </div>
        <div class="panel-body">
          <div v-if="recentOrders.length === 0" class="empty-state-mini">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <p>Заказов пока нет</p>
          </div>
          <div v-for="order in recentOrders" :key="order.id" class="order-row">
            <div class="order-info">
              <div class="order-number">{{ order.order_number }}</div>
              <div class="order-customer">{{ order.customer_name }}</div>
            </div>
            <div class="order-right">
              <div class="order-total">{{ formatPrice(order.total) }}</div>
              <span class="mini-badge" :style="{ background: (statusColors[order.status] || '#909399') + '18', color: statusColors[order.status] || '#909399' }">
                {{ statusLabels[order.status] || order.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="panel">
        <div class="panel-header">
          <h3>Топ товары</h3>
          <router-link to="/admin/products" class="panel-link">Все товары</router-link>
        </div>
        <div class="panel-body">
          <div v-if="topProducts.length === 0" class="empty-state-mini">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            <p>Товаров пока нет</p>
          </div>
          <div v-for="product in topProducts" :key="product.id" class="product-row">
            <div class="product-thumb">
              <img v-if="product.image_main" :src="getImageUrl(product.image_main)" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
              <div v-else class="thumb-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-meta">{{ product.category?.name || '—' }}</div>
            </div>
            <div class="product-price">{{ formatPrice(product.price) }}</div>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="panel">
        <div class="panel-header">
          <h3>Действия</h3>
          <router-link to="/admin/activity-log" class="panel-link">Все записи</router-link>
        </div>
        <div class="panel-body">
          <div v-if="logEntries.length === 0" class="empty-state-mini">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <p>Нет записей</p>
          </div>
          <div v-for="entry in logEntries.slice(0, 8)" :key="entry.id" class="log-row">
            <span class="log-badge" :style="{ background: actionColors[entry.action] || '#909399' }">
              {{ actionLabels[entry.action] || entry.action }}
            </span>
            <span class="log-target">{{ entry.target }}</span>
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
  margin-bottom: 24px; padding: 22px 28px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 22px; color: var(--text-primary, #303133); font-weight: 600; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 4px; display: block; }

.quick-actions { display: flex; gap: 8px; }
.quick-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
  background: var(--bg-secondary, #f5f7fa); color: var(--text-primary, #303133);
  text-decoration: none; transition: all 0.15s; border: 1px solid transparent;
}
.quick-btn:hover { background: #409EFF; color: #fff; }

/* Alerts */
.alerts-section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.alert-card {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px; border-radius: 10px; font-size: 14px; font-weight: 500;
  text-decoration: none; transition: all 0.15s;
}
.alert-card.warning { background: #fdf6ec; color: #e6a23c; }
.alert-card.danger { background: #fef0f0; color: #f56c6c; }
.alert-card.info { background: #ecf5ff; color: #409EFF; }
.alert-card:hover { filter: brightness(0.97); transform: translateX(4px); }
.alert-arrow { margin-left: auto; opacity: 0.5; }

/* Revenue Row */
.revenue-row {
  display: grid; grid-template-columns: 2fr repeat(4, 1fr); gap: 16px; margin-bottom: 20px;
}
.revenue-card {
  background: var(--card-bg, #ffffff); border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06));
  display: flex; flex-direction: column; justify-content: center;
}
.main-revenue { border-left: 4px solid #67c23a; }
.revenue-label { font-size: 12px; color: var(--text-muted, #909399); margin-bottom: 4px; }
.revenue-value { font-size: 26px; font-weight: 700; color: #67c23a; line-height: 1.2; }
.revenue-sub { font-size: 12px; color: var(--text-muted, #909399); margin-top: 6px; }
.revenue-mini-value { font-size: 28px; font-weight: 700; color: var(--text-primary, #303133); line-height: 1; margin-bottom: 4px; }

/* Stats Grid */
.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;
}
.stat-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--card-bg, #ffffff); padding: 20px; border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06));
  text-decoration: none; transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--shadow, rgba(0,0,0,0.1)); }

.stat-icon { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-icon svg { width: 22px; height: 22px; }
.products-icon { background: rgba(64,158,255,0.1); color: #409EFF; }
.active-icon { background: rgba(103,194,58,0.1); color: #67c23a; }
.categories-icon { background: rgba(230,162,60,0.1); color: #e6a23c; }
.media-icon { background: rgba(144,147,153,0.1); color: #909399; }

.stat-number { font-size: 24px; font-weight: 700; color: var(--text-primary, #303133); line-height: 1; }
.stat-label { font-size: 12px; color: var(--text-muted, #909399); margin-top: 2px; }

/* 3-Column Grid */
.dashboard-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.panel {
  background: var(--card-bg, #ffffff); border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06)); overflow: hidden;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border, #ebeef5);
}
.panel-header h3 { margin: 0; font-size: 15px; color: var(--text-primary, #303133); font-weight: 600; }
.panel-link { font-size: 12px; color: #409EFF; text-decoration: none; }
.panel-link:hover { text-decoration: underline; }
.panel-body { padding: 8px 20px; }

.empty-state-mini { padding: 24px 0; text-align: center; color: var(--text-muted, #c0c4cc); font-size: 13px; }
.empty-state-mini p { margin: 8px 0 0; }

/* Order Rows */
.order-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid var(--border, #f0f2f5);
}
.order-row:last-child { border-bottom: none; }
.order-number { font-size: 13px; font-weight: 600; color: var(--text-primary, #303133); }
.order-customer { font-size: 12px; color: var(--text-muted, #909399); }
.order-right { text-align: right; }
.order-total { font-size: 13px; font-weight: 600; color: var(--text-primary, #303133); margin-bottom: 2px; }
.mini-badge {
  display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px;
  border-radius: 4px; white-space: nowrap;
}

/* Product Rows */
.product-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--border, #f0f2f5);
}
.product-row:last-child { border-bottom: none; }
.product-thumb {
  width: 36px; height: 36px; border-radius: 8px; overflow: hidden;
  background: var(--bg-secondary, #f5f7fa); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { color: var(--text-muted, #c0c4cc); }
.product-info { flex: 1; min-width: 0; }
.product-name { font-size: 13px; color: var(--text-primary, #303133); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-meta { font-size: 11px; color: var(--text-muted, #909399); }
.product-price { font-size: 13px; font-weight: 600; color: var(--text-primary, #303133); white-space: nowrap; }

/* Log Rows */
.log-row {
  display: flex; align-items: center; gap: 8px; padding: 7px 0; flex-wrap: wrap;
  border-bottom: 1px solid var(--border, #f0f2f5); font-size: 12px;
}
.log-row:last-child { border-bottom: none; }
.log-badge { font-size: 10px; color: #fff; padding: 2px 7px; border-radius: 4px; white-space: nowrap; font-weight: 500; }
.log-target { color: var(--text-primary, #303133); font-weight: 500; }
.log-time { margin-left: auto; color: var(--text-muted, #b0b3b8); font-size: 11px; white-space: nowrap; }

@media (max-width: 1200px) {
  .revenue-row { grid-template-columns: 1fr 1fr; }
  .dashboard-grid-3 { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .quick-actions { display: none; }
  .revenue-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .revenue-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
