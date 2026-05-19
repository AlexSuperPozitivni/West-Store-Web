<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'

const router = useRouter()

type Period = 'week' | 'month' | 'quarter' | 'year'

const activePeriod = ref<Period>('month')
const loading = ref(false)

const periods: { key: Period; label: string }[] = [
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'quarter', label: 'Квартал' },
  { key: 'year', label: 'Год' },
]

interface AnalyticsData {
  revenue: number
  revenueDelta: number
  orders: number
  ordersDelta: number
  avgCheck: number
  avgCheckDelta: number
  revenueChart: { label: string; value: number; orders: number }[]
  topProducts: { name: string; qty: number; revenue: number }[]
  categoryStats: { name: string; revenue: number }[]
  recentOrders: { id: number; order_number: string; date: string; amount: number; status: string; customer: string }[]
  statusCounts: Record<string, number>
  startDate: string
  endDate: string
}

const data = ref<AnalyticsData>({
  revenue: 0, revenueDelta: 0,
  orders: 0, ordersDelta: 0,
  avgCheck: 0, avgCheckDelta: 0,
  revenueChart: [], topProducts: [], categoryStats: [],
  recentOrders: [], statusCounts: {},
  startDate: '', endDate: ''
})

// Financial report
const reportTab = ref<'analytics' | 'report'>('analytics')
const reportLoading = ref(false)
const reportFrom = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
const reportTo = ref(new Date().toISOString().slice(0, 10))

interface ReportData {
  period: { from: string; to: string }
  summary: {
    totalRevenue: number
    deliveredRevenue: number
    cancelledRevenue: number
    totalOrders: number
    avgCheck: number
    newOrders: number
    processingOrders: number
    deliveredOrders: number
    cancelledOrders: number
  }
  dailyData: { date: string; orders: number; revenue: number }[]
  topProducts: { name: string; qty: number; revenue: number }[]
  categoryBreakdown: { name: string; qty: number; revenue: number }[]
  orders: { order_number: string; date: string; customer: string; phone: string; total: number; status: string; items_count: number }[]
}

const report = ref<ReportData | null>(null)

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

const fetchAnalytics = async () => {
  loading.value = true
  try {
    await ensureCsrf()
    const res = await api.get('/admin/analytics', { params: { period: activePeriod.value } })
    data.value = res.data
  } catch (e: any) {
    if (!handleAuthError(e)) ElMessage.error('Ошибка загрузки аналитики')
  } finally {
    loading.value = false
  }
}

const fetchReport = async () => {
  reportLoading.value = true
  try {
    await ensureCsrf()
    const res = await api.get('/admin/analytics/financial-report', {
      params: { from: reportFrom.value, to: reportTo.value }
    })
    report.value = res.data
  } catch (e: any) {
    if (!handleAuthError(e)) ElMessage.error('Ошибка загрузки отчёта')
  } finally {
    reportLoading.value = false
  }
}

const maxRevenue = computed(() => Math.max(1, ...data.value.revenueChart.map(d => d.value)))
const maxProductRevenue = computed(() => data.value.topProducts.length ? Number(data.value.topProducts[0].revenue) : 1)

const totalCategoryRevenue = computed(() => data.value.categoryStats.reduce((s, c) => s + Number(c.revenue), 0))

const categoryColors = ['#409EFF', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b37feb', '#00b4d8', '#e76f51']

const categoriesWithPct = computed(() =>
  data.value.categoryStats.map((c, i) => ({
    ...c,
    revenue: Number(c.revenue),
    pct: totalCategoryRevenue.value > 0 ? Math.round((Number(c.revenue) / totalCategoryRevenue.value) * 100) : 0,
    color: categoryColors[i % categoryColors.length]
  }))
)

const donutGradient = computed(() => {
  const cats = categoriesWithPct.value
  if (!cats.length) return 'conic-gradient(#e5e7eb 0deg 360deg)'
  let acc = 0
  const stops: string[] = []
  for (const c of cats) {
    stops.push(`${c.color} ${acc}deg ${acc + c.pct * 3.6}deg`)
    acc += c.pct * 3.6
  }
  if (acc < 360) stops.push(`#e5e7eb ${acc}deg 360deg`)
  return `conic-gradient(${stops.join(', ')})`
})

const linePoints = computed(() => {
  const chartData = data.value.revenueChart
  if (!chartData.length) return '50,30'
  const max = maxRevenue.value
  const w = 100
  const h = 60
  const pad = 4
  const step = (w - pad * 2) / (chartData.length - 1 || 1)
  return chartData.map((d, i) => {
    const x = pad + i * step
    const y = h - pad - ((d.value / max) * (h - pad * 2))
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

const formatMoney = (v: number): string => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.0', '') + ' млн ₽'
  if (v >= 1_000) return Math.round(v / 1_000).toLocaleString() + ' тыс ₽'
  return v.toLocaleString() + ' ₽'
}

const formatRub = (v: number): string => Number(v).toLocaleString('ru-RU') + ' ₽'

const statusLabel = (s: string): string => {
  const map: Record<string, string> = { new: 'Новый', processing: 'В обработке', delivered: 'Доставлен', cancelled: 'Отменён' }
  return map[s] || s
}

const statusColor = (s: string): string => {
  const map: Record<string, string> = { new: '#409EFF', processing: '#e6a23c', delivered: '#67c23a', cancelled: '#f56c6c' }
  return map[s] || '#909399'
}

// PDF generation using browser print
const downloadPdf = () => {
  if (!report.value) return

  const r = report.value
  const s = r.summary

  const dailyRows = r.dailyData.map(d =>
    `<tr><td>${d.date}</td><td>${d.orders}</td><td>${formatRub(d.revenue)}</td></tr>`
  ).join('')

  const topRows = r.topProducts.map((p, i) =>
    `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.qty}</td><td>${formatRub(Number(p.revenue))}</td></tr>`
  ).join('')

  const catRows = r.categoryBreakdown.map(c =>
    `<tr><td>${c.name}</td><td>${c.qty}</td><td>${formatRub(Number(c.revenue))}</td></tr>`
  ).join('')

  const orderRows = r.orders.map(o =>
    `<tr><td>${o.order_number}</td><td>${o.date}</td><td>${o.customer}</td><td>${formatRub(o.total)}</td><td>${statusLabel(o.status)}</td></tr>`
  ).join('')

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Финансовый отчёт West-Store</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; font-size: 13px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 16px; margin: 28px 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
  .period { color: #666; margin-bottom: 24px; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
  .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 18px; }
  .summary-card .label { font-size: 12px; color: #6b7280; }
  .summary-card .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  th { background: #f3f4f6; font-weight: 600; font-size: 12px; color: #374151; }
  td { font-size: 13px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #d1d5db; font-size: 11px; color: #9ca3af; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
<h1>Финансовый отчёт WEST-STORE</h1>
<p class="period">Период: ${r.period.from} — ${r.period.to}</p>

<div class="summary-grid">
  <div class="summary-card"><div class="label">Общая выручка</div><div class="value">${formatRub(s.totalRevenue)}</div></div>
  <div class="summary-card"><div class="label">Выручка (доставлено)</div><div class="value">${formatRub(s.deliveredRevenue)}</div></div>
  <div class="summary-card"><div class="label">Отменено</div><div class="value">${formatRub(s.cancelledRevenue)}</div></div>
  <div class="summary-card"><div class="label">Всего заказов</div><div class="value">${s.totalOrders}</div></div>
  <div class="summary-card"><div class="label">Средний чек</div><div class="value">${formatRub(s.avgCheck)}</div></div>
  <div class="summary-card"><div class="label">Статусы</div><div class="value" style="font-size:13px">Новые: ${s.newOrders} | В обработке: ${s.processingOrders} | Доставлено: ${s.deliveredOrders} | Отменено: ${s.cancelledOrders}</div></div>
</div>

<h2>Выручка по дням</h2>
<table><thead><tr><th>Дата</th><th>Заказов</th><th>Выручка</th></tr></thead><tbody>${dailyRows || '<tr><td colspan="3">Нет данных</td></tr>'}</tbody></table>

<h2>Топ товаров</h2>
<table><thead><tr><th>#</th><th>Товар</th><th>Кол-во</th><th>Выручка</th></tr></thead><tbody>${topRows || '<tr><td colspan="4">Нет данных</td></tr>'}</tbody></table>

<h2>По категориям</h2>
<table><thead><tr><th>Категория</th><th>Кол-во</th><th>Выручка</th></tr></thead><tbody>${catRows || '<tr><td colspan="3">Нет данных</td></tr>'}</tbody></table>

<h2>Список заказов</h2>
<table><thead><tr><th>Номер</th><th>Дата</th><th>Клиент</th><th>Сумма</th><th>Статус</th></tr></thead><tbody>${orderRows || '<tr><td colspan="5">Нет данных</td></tr>'}</tbody></table>

<div class="footer">Сформировано: ${new Date().toLocaleString('ru-RU')} | WEST-STORE</div>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        URL.revokeObjectURL(url)
      }, 300)
    }
  }
}

watch(activePeriod, () => fetchAnalytics())
onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <div class="analytics-page">
    <!-- Tab switcher -->
    <div class="tab-bar">
      <button :class="['main-tab', { active: reportTab === 'analytics' }]" @click="reportTab = 'analytics'">
        Аналитика
      </button>
      <button :class="['main-tab', { active: reportTab === 'report' }]" @click="reportTab = 'report'">
        Финансовый отчёт
      </button>
    </div>

    <!-- ANALYTICS TAB -->
    <div v-if="reportTab === 'analytics'" v-loading="loading">
      <div class="page-header">
        <div class="header-content">
          <h2>Аналитика продаж</h2>
          <span class="subtitle">Статистика магазина West-Store</span>
        </div>
        <div class="period-selector">
          <button
            v-for="p in periods"
            :key="p.key"
            :class="['period-btn', { active: activePeriod === p.key }]"
            @click="activePeriod = p.key"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon revenue-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ formatMoney(data.revenue) }}</div>
            <div class="stat-label">Выручка</div>
            <div :class="['stat-delta', data.revenueDelta >= 0 ? 'up' : 'down']">
              {{ data.revenueDelta >= 0 ? '+' : '' }}{{ data.revenueDelta }}%
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orders-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a1 1 0 01-1 1h-2"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ data.orders }}</div>
            <div class="stat-label">Заказов</div>
            <div :class="['stat-delta', data.ordersDelta >= 0 ? 'up' : 'down']">
              {{ data.ordersDelta >= 0 ? '+' : '' }}{{ data.ordersDelta }}%
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon avg-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ formatRub(data.avgCheck) }}</div>
            <div class="stat-label">Средний чек</div>
            <div :class="['stat-delta', data.avgCheckDelta >= 0 ? 'up' : 'down']">
              {{ data.avgCheckDelta >= 0 ? '+' : '' }}{{ data.avgCheckDelta }}%
            </div>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="panel chart-panel">
          <div class="panel-header"><h3>Динамика выручки</h3></div>
          <div class="panel-body">
            <div class="line-chart-wrap">
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" class="line-chart-svg">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#409EFF" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#409EFF" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <polygon :points="`4,56 ${linePoints} 96,56`" fill="url(#lineGrad)" />
                <polyline :points="linePoints" fill="none" stroke="#409EFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="line-anim"/>
              </svg>
            </div>
            <div class="bar-chart">
              <div v-for="(bar, i) in data.revenueChart" :key="i" class="bar-col">
                <div class="bar-value">{{ formatMoney(bar.value) }}</div>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ height: (bar.value / maxRevenue * 100) + '%' }"></div>
                </div>
                <div class="bar-label">{{ bar.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel donut-panel">
          <div class="panel-header"><h3>Продажи по категориям</h3></div>
          <div class="panel-body donut-body">
            <div class="donut-chart" :style="{ background: donutGradient }">
              <div class="donut-hole">
                <span class="donut-total">{{ formatMoney(data.revenue) }}</span>
              </div>
            </div>
            <div class="category-legend">
              <div v-for="c in categoriesWithPct" :key="c.name" class="legend-item">
                <span class="legend-dot" :style="{ background: c.color }"></span>
                <span class="legend-name">{{ c.name }}</span>
                <span class="legend-pct">{{ c.pct }}%</span>
                <span class="legend-amount">{{ formatMoney(c.revenue) }}</span>
              </div>
              <div v-if="!categoriesWithPct.length" class="legend-empty">Нет данных</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="panel top-products-panel">
          <div class="panel-header"><h3>Топ товаров</h3></div>
          <div class="panel-body">
            <div v-for="(prod, i) in data.topProducts" :key="i" class="top-product-row">
              <span class="tp-rank">{{ i + 1 }}</span>
              <div class="tp-info">
                <div class="tp-name">{{ prod.name }}</div>
                <div class="tp-meta">{{ prod.qty }} шт. &middot; {{ formatRub(Number(prod.revenue)) }}</div>
              </div>
              <div class="tp-bar-track">
                <div class="tp-bar-fill" :style="{ width: (Number(prod.revenue) / maxProductRevenue * 100) + '%' }"></div>
              </div>
            </div>
            <div v-if="!data.topProducts.length" class="panel-empty">Нет данных за период</div>
          </div>
        </div>

        <div class="panel orders-panel">
          <div class="panel-header"><h3>Последние заказы</h3></div>
          <div class="panel-body">
            <div v-for="order in data.recentOrders" :key="order.id" class="order-row">
              <span class="order-id">{{ order.order_number }}</span>
              <span class="order-date">{{ order.date }}</span>
              <span class="order-amount">{{ formatRub(order.amount) }}</span>
              <span class="order-status" :style="{ color: statusColor(order.status) }">{{ statusLabel(order.status) }}</span>
            </div>
            <div v-if="!data.recentOrders.length" class="panel-empty">Нет заказов</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FINANCIAL REPORT TAB -->
    <div v-if="reportTab === 'report'" v-loading="reportLoading">
      <div class="page-header">
        <div class="header-content">
          <h2>Финансовый отчёт</h2>
          <span class="subtitle">Формирование отчётности с выгрузкой в PDF</span>
        </div>
      </div>

      <div class="report-controls">
        <div class="date-group">
          <label>Период с</label>
          <input type="date" v-model="reportFrom" class="date-input" />
        </div>
        <div class="date-group">
          <label>по</label>
          <input type="date" v-model="reportTo" class="date-input" />
        </div>
        <button class="report-btn generate-btn" @click="fetchReport">Сформировать</button>
        <button v-if="report" class="report-btn pdf-btn" @click="downloadPdf">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Скачать PDF
        </button>
      </div>

      <div v-if="report" class="report-content">
        <div class="report-summary-grid">
          <div class="report-card">
            <div class="rc-label">Общая выручка</div>
            <div class="rc-value">{{ formatRub(report.summary.totalRevenue) }}</div>
          </div>
          <div class="report-card">
            <div class="rc-label">Доставлено</div>
            <div class="rc-value green">{{ formatRub(report.summary.deliveredRevenue) }}</div>
            <div class="rc-sub">{{ report.summary.deliveredOrders }} заказов</div>
          </div>
          <div class="report-card">
            <div class="rc-label">Отменено</div>
            <div class="rc-value red">{{ formatRub(report.summary.cancelledRevenue) }}</div>
            <div class="rc-sub">{{ report.summary.cancelledOrders }} заказов</div>
          </div>
          <div class="report-card">
            <div class="rc-label">Всего заказов</div>
            <div class="rc-value">{{ report.summary.totalOrders }}</div>
          </div>
          <div class="report-card">
            <div class="rc-label">Средний чек</div>
            <div class="rc-value">{{ formatRub(report.summary.avgCheck) }}</div>
          </div>
          <div class="report-card">
            <div class="rc-label">В обработке</div>
            <div class="rc-value orange">{{ report.summary.newOrders + report.summary.processingOrders }}</div>
          </div>
        </div>

        <div class="report-section">
          <h3>Выручка по дням</h3>
          <div class="report-table-wrap">
            <table class="report-table">
              <thead><tr><th>Дата</th><th>Заказов</th><th>Выручка</th></tr></thead>
              <tbody>
                <tr v-for="d in report.dailyData" :key="d.date">
                  <td>{{ d.date }}</td>
                  <td>{{ d.orders }}</td>
                  <td>{{ formatRub(d.revenue) }}</td>
                </tr>
                <tr v-if="!report.dailyData.length"><td colspan="3" class="empty-cell">Нет данных</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="report-row">
          <div class="report-section">
            <h3>Топ товаров</h3>
            <div class="report-table-wrap">
              <table class="report-table">
                <thead><tr><th>#</th><th>Товар</th><th>Кол-во</th><th>Выручка</th></tr></thead>
                <tbody>
                  <tr v-for="(p, i) in report.topProducts" :key="i">
                    <td>{{ i + 1 }}</td>
                    <td>{{ p.name }}</td>
                    <td>{{ p.qty }}</td>
                    <td>{{ formatRub(Number(p.revenue)) }}</td>
                  </tr>
                  <tr v-if="!report.topProducts.length"><td colspan="4" class="empty-cell">Нет данных</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="report-section">
            <h3>По категориям</h3>
            <div class="report-table-wrap">
              <table class="report-table">
                <thead><tr><th>Категория</th><th>Кол-во</th><th>Выручка</th></tr></thead>
                <tbody>
                  <tr v-for="c in report.categoryBreakdown" :key="c.name">
                    <td>{{ c.name }}</td>
                    <td>{{ c.qty }}</td>
                    <td>{{ formatRub(Number(c.revenue)) }}</td>
                  </tr>
                  <tr v-if="!report.categoryBreakdown.length"><td colspan="3" class="empty-cell">Нет данных</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3>Заказы за период ({{ report.orders.length }})</h3>
          <div class="report-table-wrap">
            <table class="report-table">
              <thead><tr><th>Номер</th><th>Дата</th><th>Клиент</th><th>Сумма</th><th>Статус</th></tr></thead>
              <tbody>
                <tr v-for="o in report.orders" :key="o.order_number">
                  <td>{{ o.order_number }}</td>
                  <td>{{ o.date }}</td>
                  <td>{{ o.customer }}</td>
                  <td>{{ formatRub(o.total) }}</td>
                  <td><span :style="{ color: statusColor(o.status) }">{{ statusLabel(o.status) }}</span></td>
                </tr>
                <tr v-if="!report.orders.length"><td colspan="5" class="empty-cell">Нет заказов</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="!reportLoading" class="report-placeholder">
        Выберите период и нажмите «Сформировать» для создания отчёта
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-page { padding: 20px 0; }

/* Main tabs */
.tab-bar { display: flex; gap: 4px; margin-bottom: 24px; background: var(--bg-secondary, #f0f2f5); padding: 4px; border-radius: 10px; width: fit-content; }
.main-tab {
  padding: 10px 24px; border: none; border-radius: 8px; background: transparent;
  font-size: 14px; font-weight: 600; color: var(--text-muted, #606266); cursor: pointer; transition: all 0.2s;
}
.main-tab.active { background: var(--card-bg, #fff); color: var(--text-primary, #303133); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

/* Header */
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 30px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
  flex-wrap: wrap; gap: 16px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }

.period-selector { display: flex; gap: 6px; }
.period-btn {
  padding: 8px 18px; border: 1px solid var(--border, #dcdfe6); border-radius: 6px;
  background: var(--card-bg, #fff); color: var(--text-primary, #606266);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.period-btn:hover { border-color: #409EFF; color: #409EFF; }
.period-btn.active { background: #409EFF; color: #fff; border-color: #409EFF; }

/* Stats grid */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px; margin-bottom: 24px;
}
.stat-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--card-bg, #ffffff); padding: 22px 24px; border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px var(--shadow, rgba(0,0,0,0.12)); }
.stat-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon svg { width: 26px; height: 26px; }
.revenue-icon { background: rgba(64,158,255,0.12); color: #409EFF; }
.orders-icon { background: rgba(103,194,58,0.12); color: #67c23a; }
.avg-icon { background: rgba(230,162,60,0.12); color: #e6a23c; }

.stat-info { min-width: 0; }
.stat-number { font-size: 22px; font-weight: 700; color: var(--text-primary, #303133); line-height: 1.2; }
.stat-label { font-size: 13px; color: var(--text-muted, #909399); margin-top: 2px; }
.stat-delta { font-size: 12px; font-weight: 600; margin-top: 4px; }
.stat-delta.up { color: #67c23a; }
.stat-delta.down { color: #f56c6c; }

/* Panels */
.panel { background: var(--card-bg, #ffffff); border-radius: 12px; box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); overflow: hidden; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--border, #ebeef5); }
.panel-header h3 { margin: 0; font-size: 16px; color: var(--text-primary, #303133); font-weight: 600; }
.panel-body { padding: 20px 24px; }
.panel-empty { text-align: center; padding: 30px; color: var(--text-muted, #909399); font-size: 14px; }

.charts-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; margin-bottom: 24px; }

.line-chart-wrap { margin-bottom: 16px; }
.line-chart-svg { width: 100%; height: 120px; }
.line-anim { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 1.2s ease forwards; }
@keyframes drawLine { to { stroke-dashoffset: 0; } }

.bar-chart { display: flex; gap: 6px; align-items: flex-end; height: 160px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
.bar-value { font-size: 10px; color: var(--text-muted, #909399); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.bar-track { width: 100%; max-width: 48px; height: 110px; background: var(--bg-secondary, #f5f7fa); border-radius: 6px 6px 0 0; position: relative; overflow: hidden; display: flex; align-items: flex-end; }
.bar-fill { width: 100%; background: linear-gradient(180deg, #409EFF, #79bbff); border-radius: 6px 6px 0 0; transition: height 0.6s ease; }
.bar-label { font-size: 11px; color: var(--text-muted, #909399); white-space: nowrap; }

.donut-body { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
.donut-chart { width: 180px; height: 180px; border-radius: 50%; position: relative; flex-shrink: 0; transition: background 0.4s; }
.donut-hole { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 110px; height: 110px; border-radius: 50%; background: var(--card-bg, #ffffff); display: flex; align-items: center; justify-content: center; }
.donut-total { font-size: 13px; font-weight: 700; color: var(--text-primary, #303133); text-align: center; line-height: 1.3; }

.category-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 180px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.legend-name { color: var(--text-primary, #303133); font-weight: 500; min-width: 80px; }
.legend-pct { color: var(--text-muted, #909399); min-width: 32px; text-align: right; }
.legend-amount { color: var(--text-muted, #909399); margin-left: auto; }
.legend-empty { color: var(--text-muted, #909399); font-size: 13px; }

.bottom-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; }

.top-product-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border, #f0f2f5); }
.top-product-row:last-child { border-bottom: none; }
.tp-rank { width: 24px; height: 24px; border-radius: 6px; background: var(--bg-secondary, #f0f2f5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--text-muted, #909399); flex-shrink: 0; }
.top-product-row:nth-child(1) .tp-rank { background: #409EFF; color: #fff; }
.top-product-row:nth-child(2) .tp-rank { background: #67c23a; color: #fff; }
.top-product-row:nth-child(3) .tp-rank { background: #e6a23c; color: #fff; }
.tp-info { flex: 1; min-width: 0; }
.tp-name { font-size: 13px; color: var(--text-primary, #303133); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tp-meta { font-size: 11px; color: var(--text-muted, #909399); margin-top: 2px; }
.tp-bar-track { width: 120px; height: 6px; background: var(--bg-secondary, #f0f2f5); border-radius: 3px; overflow: hidden; flex-shrink: 0; }
.tp-bar-fill { height: 100%; background: linear-gradient(90deg, #409EFF, #79bbff); border-radius: 3px; transition: width 0.6s ease; }

.order-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border, #f0f2f5); font-size: 13px; }
.order-row:last-child { border-bottom: none; }
.order-id { font-weight: 600; color: var(--text-primary, #303133); min-width: 120px; font-size: 12px; }
.order-date { color: var(--text-muted, #909399); flex: 1; }
.order-amount { font-weight: 600; color: var(--text-primary, #303133); white-space: nowrap; }
.order-status { font-weight: 500; white-space: nowrap; font-size: 12px; }

/* === FINANCIAL REPORT === */
.report-controls {
  display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap;
  background: var(--card-bg, #fff); padding: 20px 24px; border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); margin-bottom: 24px;
}
.date-group { display: flex; flex-direction: column; gap: 4px; }
.date-group label { font-size: 12px; color: var(--text-muted, #909399); font-weight: 500; }
.date-input {
  padding: 8px 14px; border: 1px solid var(--border, #dcdfe6); border-radius: 8px;
  font-size: 14px; color: var(--text-primary, #303133); background: var(--card-bg, #fff);
}
.date-input:focus { outline: none; border-color: #409EFF; }

.report-btn {
  padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; border: none; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
}
.generate-btn { background: #409EFF; color: #fff; }
.generate-btn:hover { background: #337ecc; }
.pdf-btn { background: #f56c6c; color: #fff; }
.pdf-btn:hover { background: #d9534f; }

.report-content { display: flex; flex-direction: column; gap: 24px; }

.report-summary-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
}
.report-card {
  background: var(--card-bg, #fff); padding: 20px; border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
}
.rc-label { font-size: 13px; color: var(--text-muted, #909399); }
.rc-value { font-size: 24px; font-weight: 700; color: var(--text-primary, #303133); margin-top: 4px; }
.rc-value.green { color: #67c23a; }
.rc-value.red { color: #f56c6c; }
.rc-value.orange { color: #e6a23c; }
.rc-sub { font-size: 12px; color: var(--text-muted, #909399); margin-top: 2px; }

.report-section {
  background: var(--card-bg, #fff); border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
}
.report-section h3 { font-size: 16px; font-weight: 600; color: var(--text-primary, #303133); margin: 0 0 16px; }

.report-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.report-table-wrap { overflow-x: auto; }
.report-table { width: 100%; border-collapse: collapse; }
.report-table th, .report-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border, #ebeef5); font-size: 13px; }
.report-table th { background: var(--bg-secondary, #f5f7fa); font-weight: 600; color: var(--text-primary, #374151); font-size: 12px; }
.empty-cell { text-align: center; color: var(--text-muted, #909399); padding: 20px; }

.report-placeholder {
  text-align: center; padding: 60px; color: var(--text-muted, #909399);
  background: var(--card-bg, #fff); border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
}

/* Responsive */
@media (max-width: 1100px) {
  .charts-row { grid-template-columns: 1fr; }
  .bottom-row { grid-template-columns: 1fr; }
  .report-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .donut-body { flex-direction: column; align-items: center; }
  .tp-bar-track { display: none; }
  .report-controls { flex-direction: column; align-items: stretch; }
  .report-summary-grid { grid-template-columns: repeat(2, 1fr); }
  .order-id { min-width: 80px; font-size: 11px; }
}
</style>
