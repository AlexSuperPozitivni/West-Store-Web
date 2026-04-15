<script setup lang="ts">
import { ref, computed } from 'vue'

type Period = 'week' | 'month' | 'quarter' | 'year'

const activePeriod = ref<Period>('month')

const periods: { key: Period; label: string }[] = [
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'quarter', label: 'Квартал' },
  { key: 'year', label: 'Год' },
]

// --- Demo data keyed by period ---

interface PeriodData {
  revenue: number
  revenueDelta: number
  orders: number
  ordersDelta: number
  avgCheck: number
  avgCheckDelta: number
  conversion: number
  conversionDelta: number
  revenueChart: { label: string; value: number }[]
  topProducts: { name: string; qty: number; revenue: number }[]
  recentOrders: { id: number; date: string; amount: number; status: string }[]
}

const demoData: Record<Period, PeriodData> = {
  week: {
    revenue: 892_400,
    revenueDelta: 8.3,
    orders: 14,
    ordersDelta: 16.7,
    avgCheck: 63_743,
    avgCheckDelta: -2.1,
    conversion: 3.8,
    conversionDelta: 0.4,
    revenueChart: [
      { label: 'Пн', value: 148_200 },
      { label: 'Вт', value: 95_800 },
      { label: 'Ср', value: 203_500 },
      { label: 'Чт', value: 67_300 },
      { label: 'Пт', value: 175_600 },
      { label: 'Сб', value: 134_000 },
      { label: 'Вс', value: 68_000 },
    ],
    topProducts: [
      { name: 'iPhone 16 Pro 256GB', qty: 3, revenue: 389_700 },
      { name: 'AirPods Pro 3', qty: 4, revenue: 99_600 },
      { name: 'MacBook Air M4 16/512', qty: 1, revenue: 164_900 },
      { name: 'iPhone 16 128GB', qty: 2, revenue: 139_800 },
      { name: 'Apple Watch Ultra 2', qty: 1, revenue: 79_900 },
      { name: 'iPad Air M3 256GB', qty: 1, revenue: 74_900 },
      { name: 'Чехол MagSafe iPhone 16', qty: 3, revenue: 14_700 },
      { name: 'AirPods 4', qty: 1, revenue: 17_900 },
    ],
    recentOrders: [
      { id: 1087, date: '14.04.2026 15:32', amount: 129_900, status: 'Доставлен' },
      { id: 1086, date: '14.04.2026 12:10', amount: 24_900, status: 'В пути' },
      { id: 1085, date: '13.04.2026 18:45', amount: 164_900, status: 'Собирается' },
      { id: 1084, date: '13.04.2026 09:20', amount: 69_900, status: 'Доставлен' },
      { id: 1083, date: '12.04.2026 21:05', amount: 4_900, status: 'Доставлен' },
    ],
  },
  month: {
    revenue: 3_847_200,
    revenueDelta: 12.4,
    orders: 58,
    ordersDelta: 9.2,
    avgCheck: 66_331,
    avgCheckDelta: 3.0,
    conversion: 4.1,
    conversionDelta: 0.6,
    revenueChart: [
      { label: '1 нед', value: 892_400 },
      { label: '2 нед', value: 1_024_800 },
      { label: '3 нед', value: 978_300 },
      { label: '4 нед', value: 951_700 },
    ],
    topProducts: [
      { name: 'iPhone 16 Pro 256GB', qty: 12, revenue: 1_558_800 },
      { name: 'MacBook Air M4 16/512', qty: 6, revenue: 989_400 },
      { name: 'AirPods Pro 3', qty: 14, revenue: 348_600 },
      { name: 'iPhone 16 128GB', qty: 8, revenue: 559_200 },
      { name: 'iPad Air M3 256GB', qty: 4, revenue: 299_600 },
      { name: 'Apple Watch Ultra 2', qty: 3, revenue: 239_700 },
      { name: 'MacBook Pro M4 Pro 18/512', qty: 2, revenue: 479_800 },
      { name: 'AirPods 4', qty: 5, revenue: 89_500 },
      { name: 'iPad Pro M4 11" 256GB', qty: 2, revenue: 199_800 },
      { name: 'Чехол MagSafe iPhone 16', qty: 9, revenue: 44_100 },
    ],
    recentOrders: [
      { id: 1087, date: '14.04.2026 15:32', amount: 129_900, status: 'Доставлен' },
      { id: 1086, date: '14.04.2026 12:10', amount: 24_900, status: 'В пути' },
      { id: 1085, date: '13.04.2026 18:45', amount: 164_900, status: 'Собирается' },
      { id: 1084, date: '13.04.2026 09:20', amount: 69_900, status: 'Доставлен' },
      { id: 1083, date: '12.04.2026 21:05', amount: 4_900, status: 'Доставлен' },
    ],
  },
  quarter: {
    revenue: 11_240_600,
    revenueDelta: 18.7,
    orders: 164,
    ordersDelta: 14.5,
    avgCheck: 68_540,
    avgCheckDelta: 3.7,
    conversion: 4.3,
    conversionDelta: 0.9,
    revenueChart: [
      { label: 'Фев', value: 3_210_400 },
      { label: 'Мар', value: 4_183_000 },
      { label: 'Апр', value: 3_847_200 },
    ],
    topProducts: [
      { name: 'iPhone 16 Pro 256GB', qty: 38, revenue: 4_936_200 },
      { name: 'MacBook Air M4 16/512', qty: 18, revenue: 2_968_200 },
      { name: 'AirPods Pro 3', qty: 42, revenue: 1_045_800 },
      { name: 'iPhone 16 128GB', qty: 22, revenue: 1_537_800 },
      { name: 'iPad Air M3 256GB', qty: 10, revenue: 749_000 },
      { name: 'Apple Watch Ultra 2', qty: 8, revenue: 639_200 },
      { name: 'MacBook Pro M4 Pro 18/512', qty: 5, revenue: 1_199_500 },
      { name: 'AirPods 4', qty: 15, revenue: 268_500 },
      { name: 'iPad Pro M4 11" 256GB', qty: 6, revenue: 599_400 },
      { name: 'Чехол MagSafe iPhone 16', qty: 28, revenue: 137_200 },
    ],
    recentOrders: [
      { id: 1087, date: '14.04.2026 15:32', amount: 129_900, status: 'Доставлен' },
      { id: 1086, date: '14.04.2026 12:10', amount: 24_900, status: 'В пути' },
      { id: 1085, date: '13.04.2026 18:45', amount: 164_900, status: 'Собирается' },
      { id: 1084, date: '13.04.2026 09:20', amount: 69_900, status: 'Доставлен' },
      { id: 1083, date: '12.04.2026 21:05', amount: 4_900, status: 'Доставлен' },
    ],
  },
  year: {
    revenue: 42_860_400,
    revenueDelta: 24.1,
    orders: 612,
    ordersDelta: 19.8,
    avgCheck: 70_033,
    avgCheckDelta: 3.6,
    conversion: 4.5,
    conversionDelta: 1.2,
    revenueChart: [
      { label: 'Май', value: 2_850_000 },
      { label: 'Июн', value: 2_640_000 },
      { label: 'Июл', value: 2_410_000 },
      { label: 'Авг', value: 2_980_000 },
      { label: 'Сен', value: 3_760_000 },
      { label: 'Окт', value: 4_120_000 },
      { label: 'Ноя', value: 4_580_000 },
      { label: 'Дек', value: 5_230_000 },
      { label: 'Янв', value: 3_050_000 },
      { label: 'Фев', value: 3_210_400 },
      { label: 'Мар', value: 4_183_000 },
      { label: 'Апр', value: 3_847_000 },
    ],
    topProducts: [
      { name: 'iPhone 16 Pro 256GB', qty: 142, revenue: 18_437_800 },
      { name: 'MacBook Air M4 16/512', qty: 64, revenue: 10_553_600 },
      { name: 'AirPods Pro 3', qty: 158, revenue: 3_934_200 },
      { name: 'iPhone 16 128GB', qty: 86, revenue: 6_011_400 },
      { name: 'iPad Air M3 256GB', qty: 38, revenue: 2_846_200 },
      { name: 'MacBook Pro M4 Pro 18/512', qty: 22, revenue: 5_277_800 },
      { name: 'Apple Watch Ultra 2', qty: 30, revenue: 2_397_000 },
      { name: 'AirPods 4', qty: 54, revenue: 966_600 },
      { name: 'iPad Pro M4 11" 256GB', qty: 18, revenue: 1_798_200 },
      { name: 'Чехол MagSafe iPhone 16', qty: 96, revenue: 470_400 },
    ],
    recentOrders: [
      { id: 1087, date: '14.04.2026 15:32', amount: 129_900, status: 'Доставлен' },
      { id: 1086, date: '14.04.2026 12:10', amount: 24_900, status: 'В пути' },
      { id: 1085, date: '13.04.2026 18:45', amount: 164_900, status: 'Собирается' },
      { id: 1084, date: '13.04.2026 09:20', amount: 69_900, status: 'Доставлен' },
      { id: 1083, date: '12.04.2026 21:05', amount: 4_900, status: 'Доставлен' },
    ],
  },
}

const currentData = computed(() => demoData[activePeriod.value])

const maxRevenue = computed(() => Math.max(...currentData.value.revenueChart.map(d => d.value)))

const maxProductRevenue = computed(() => {
  const products = currentData.value.topProducts
  return products.length ? products[0].revenue : 1
})

// Category breakdown (fixed proportions, scaled to period revenue)
const categories = computed(() => {
  const r = currentData.value.revenue
  return [
    { name: 'iPhone', pct: 55, amount: Math.round(r * 0.55), color: '#409EFF' },
    { name: 'MacBook', pct: 20, amount: Math.round(r * 0.20), color: '#67c23a' },
    { name: 'AirPods', pct: 10, amount: Math.round(r * 0.10), color: '#e6a23c' },
    { name: 'iPad', pct: 8, amount: Math.round(r * 0.08), color: '#f56c6c' },
    { name: 'Watch', pct: 4, amount: Math.round(r * 0.04), color: '#909399' },
    { name: 'Аксессуары', pct: 3, amount: Math.round(r * 0.03), color: '#b37feb' },
  ]
})

const donutGradient = computed(() => {
  const cats = categories.value
  let acc = 0
  const stops: string[] = []
  for (const c of cats) {
    stops.push(`${c.color} ${acc}deg ${acc + c.pct * 3.6}deg`)
    acc += c.pct * 3.6
  }
  return `conic-gradient(${stops.join(', ')})`
})

// SVG line chart points
const linePoints = computed(() => {
  const data = currentData.value.revenueChart
  const max = maxRevenue.value
  const w = 100
  const h = 60
  const pad = 4
  const step = (w - pad * 2) / (data.length - 1 || 1)
  return data.map((d, i) => {
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

const formatRub = (v: number): string => v.toLocaleString('ru-RU') + ' ₽'

const statusColor = (s: string): string => {
  if (s === 'Доставлен') return '#67c23a'
  if (s === 'В пути') return '#409EFF'
  if (s === 'Собирается') return '#e6a23c'
  return '#909399'
}
</script>

<template>
  <div class="analytics-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>Аналитика продаж</h2>
        <span class="subtitle">Демо-данные Onlyphones</span>
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

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon revenue-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ formatMoney(currentData.revenue) }}</div>
          <div class="stat-label">Выручка</div>
          <div :class="['stat-delta', currentData.revenueDelta >= 0 ? 'up' : 'down']">
            {{ currentData.revenueDelta >= 0 ? '↑' : '↓' }}{{ Math.abs(currentData.revenueDelta) }}%
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orders-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a1 1 0 01-1 1h-2"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ currentData.orders }}</div>
          <div class="stat-label">Заказов</div>
          <div :class="['stat-delta', currentData.ordersDelta >= 0 ? 'up' : 'down']">
            {{ currentData.ordersDelta >= 0 ? '↑' : '↓' }}{{ Math.abs(currentData.ordersDelta) }}%
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon avg-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ formatRub(currentData.avgCheck) }}</div>
          <div class="stat-label">Средний чек</div>
          <div :class="['stat-delta', currentData.avgCheckDelta >= 0 ? 'up' : 'down']">
            {{ currentData.avgCheckDelta >= 0 ? '↑' : '↓' }}{{ Math.abs(currentData.avgCheckDelta) }}%
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon conv-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ currentData.conversion }}%</div>
          <div class="stat-label">Конверсия</div>
          <div :class="['stat-delta', currentData.conversionDelta >= 0 ? 'up' : 'down']">
            {{ currentData.conversionDelta >= 0 ? '↑' : '↓' }}{{ Math.abs(currentData.conversionDelta) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <!-- Revenue Chart -->
      <div class="panel chart-panel">
        <div class="panel-header">
          <h3>Динамика выручки</h3>
        </div>
        <div class="panel-body">
          <!-- SVG line -->
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
          <!-- Bar chart below -->
          <div class="bar-chart">
            <div
              v-for="(bar, i) in currentData.revenueChart"
              :key="i"
              class="bar-col"
            >
              <div class="bar-value">{{ formatMoney(bar.value) }}</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: (bar.value / maxRevenue * 100) + '%' }"
                ></div>
              </div>
              <div class="bar-label">{{ bar.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category donut -->
      <div class="panel donut-panel">
        <div class="panel-header">
          <h3>Продажи по категориям</h3>
        </div>
        <div class="panel-body donut-body">
          <div class="donut-chart" :style="{ background: donutGradient }">
            <div class="donut-hole">
              <span class="donut-total">{{ formatMoney(currentData.revenue) }}</span>
            </div>
          </div>
          <div class="category-legend">
            <div v-for="c in categories" :key="c.name" class="legend-item">
              <span class="legend-dot" :style="{ background: c.color }"></span>
              <span class="legend-name">{{ c.name }}</span>
              <span class="legend-pct">{{ c.pct }}%</span>
              <span class="legend-amount">{{ formatMoney(c.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="bottom-row">
      <!-- Top products -->
      <div class="panel top-products-panel">
        <div class="panel-header">
          <h3>Топ товаров</h3>
        </div>
        <div class="panel-body">
          <div
            v-for="(prod, i) in currentData.topProducts"
            :key="i"
            class="top-product-row"
          >
            <span class="tp-rank">{{ i + 1 }}</span>
            <div class="tp-info">
              <div class="tp-name">{{ prod.name }}</div>
              <div class="tp-meta">{{ prod.qty }} шт. &middot; {{ formatRub(prod.revenue) }}</div>
            </div>
            <div class="tp-bar-track">
              <div
                class="tp-bar-fill"
                :style="{ width: (prod.revenue / maxProductRevenue * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent orders -->
      <div class="panel orders-panel">
        <div class="panel-header">
          <h3>Последние заказы</h3>
        </div>
        <div class="panel-body">
          <div
            v-for="order in currentData.recentOrders"
            :key="order.id"
            class="order-row"
          >
            <span class="order-id">#{{ order.id }}</span>
            <span class="order-date">{{ order.date }}</span>
            <span class="order-amount">{{ formatRub(order.amount) }}</span>
            <span class="order-status" :style="{ color: statusColor(order.status) }">{{ order.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-page { padding: 20px 0; }

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
.period-btn.active {
  background: #409EFF; color: #fff; border-color: #409EFF;
}

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

.stat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon svg { width: 26px; height: 26px; }
.revenue-icon { background: rgba(64,158,255,0.12); color: #409EFF; }
.orders-icon { background: rgba(103,194,58,0.12); color: #67c23a; }
.avg-icon { background: rgba(230,162,60,0.12); color: #e6a23c; }
.conv-icon { background: rgba(179,127,235,0.12); color: #b37feb; }

.stat-info { min-width: 0; }
.stat-number { font-size: 22px; font-weight: 700; color: var(--text-primary, #303133); line-height: 1.2; }
.stat-label { font-size: 13px; color: var(--text-muted, #909399); margin-top: 2px; }
.stat-delta {
  font-size: 12px; font-weight: 600; margin-top: 4px;
}
.stat-delta.up { color: #67c23a; }
.stat-delta.down { color: #f56c6c; }

/* Panels */
.panel {
  background: var(--card-bg, #ffffff); border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); overflow: hidden;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 24px; border-bottom: 1px solid var(--border, #ebeef5);
}
.panel-header h3 { margin: 0; font-size: 16px; color: var(--text-primary, #303133); font-weight: 600; }
.panel-body { padding: 20px 24px; }

/* Charts row */
.charts-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; margin-bottom: 24px; }

/* Line chart */
.line-chart-wrap { margin-bottom: 16px; }
.line-chart-svg { width: 100%; height: 120px; }
.line-anim {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: drawLine 1.2s ease forwards;
}
@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

/* Bar chart */
.bar-chart { display: flex; gap: 6px; align-items: flex-end; height: 160px; }
.bar-col {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0;
}
.bar-value { font-size: 10px; color: var(--text-muted, #909399); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.bar-track {
  width: 100%; max-width: 48px; height: 110px; background: var(--bg-secondary, #f5f7fa);
  border-radius: 6px 6px 0 0; position: relative; overflow: hidden;
  display: flex; align-items: flex-end;
}
.bar-fill {
  width: 100%; background: linear-gradient(180deg, #409EFF, #79bbff); border-radius: 6px 6px 0 0;
  transition: height 0.6s ease;
  animation: growBar 0.8s ease forwards;
}
@keyframes growBar {
  from { transform: scaleY(0); transform-origin: bottom; }
  to { transform: scaleY(1); transform-origin: bottom; }
}
.bar-label { font-size: 11px; color: var(--text-muted, #909399); white-space: nowrap; }

/* Donut chart */
.donut-body { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
.donut-chart {
  width: 180px; height: 180px; border-radius: 50%; position: relative; flex-shrink: 0;
  transition: background 0.4s;
}
.donut-hole {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 110px; height: 110px; border-radius: 50%;
  background: var(--card-bg, #ffffff);
  display: flex; align-items: center; justify-content: center;
}
.donut-total { font-size: 13px; font-weight: 700; color: var(--text-primary, #303133); text-align: center; line-height: 1.3; }

.category-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 180px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.legend-name { color: var(--text-primary, #303133); font-weight: 500; min-width: 80px; }
.legend-pct { color: var(--text-muted, #909399); min-width: 32px; text-align: right; }
.legend-amount { color: var(--text-muted, #909399); margin-left: auto; }

/* Bottom row */
.bottom-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; }

/* Top products */
.top-product-row {
  display: flex; align-items: center; gap: 12px; padding: 10px 0;
  border-bottom: 1px solid var(--border, #f0f2f5);
}
.top-product-row:last-child { border-bottom: none; }
.tp-rank {
  width: 24px; height: 24px; border-radius: 6px; background: var(--bg-secondary, #f0f2f5);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--text-muted, #909399); flex-shrink: 0;
}
.top-product-row:nth-child(1) .tp-rank { background: #409EFF; color: #fff; }
.top-product-row:nth-child(2) .tp-rank { background: #67c23a; color: #fff; }
.top-product-row:nth-child(3) .tp-rank { background: #e6a23c; color: #fff; }

.tp-info { flex: 1; min-width: 0; }
.tp-name { font-size: 13px; color: var(--text-primary, #303133); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tp-meta { font-size: 11px; color: var(--text-muted, #909399); margin-top: 2px; }
.tp-bar-track {
  width: 120px; height: 6px; background: var(--bg-secondary, #f0f2f5); border-radius: 3px;
  overflow: hidden; flex-shrink: 0;
}
.tp-bar-fill {
  height: 100%; background: linear-gradient(90deg, #409EFF, #79bbff); border-radius: 3px;
  transition: width 0.6s ease;
}

/* Orders */
.order-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 0;
  border-bottom: 1px solid var(--border, #f0f2f5); font-size: 13px;
}
.order-row:last-child { border-bottom: none; }
.order-id { font-weight: 600; color: var(--text-primary, #303133); min-width: 50px; }
.order-date { color: var(--text-muted, #909399); flex: 1; }
.order-amount { font-weight: 600; color: var(--text-primary, #303133); white-space: nowrap; }
.order-status { font-weight: 500; white-space: nowrap; font-size: 12px; }

/* Responsive */
@media (max-width: 1100px) {
  .charts-row { grid-template-columns: 1fr; }
  .bottom-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; align-items: flex-start; }
  .donut-body { flex-direction: column; align-items: center; }
  .tp-bar-track { display: none; }
}
</style>
