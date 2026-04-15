<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'
import { useActivityLog } from '../../lib/useActivityLog'

interface OrderItem {
  name: string
  image: string
  qty: number
  price: number
}

interface Order {
  id: number
  order_number: string
  date: string
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_address: string
  items: OrderItem[]
  total: number
  status: 'new' | 'processing' | 'delivered' | 'cancelled'
  notes: string
}

const router = useRouter()
const { log } = useActivityLog()

const orders = ref<Order[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)
const editStatus = ref<string>('')
const editNotes = ref('')

// Filters
const searchQuery = ref('')
const filterStatus = ref('')
const filterDateRange = ref<[string, string] | null>(null)

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')

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

const statusLabels: Record<string, string> = {
  new: 'Новый',
  processing: 'В обработке',
  delivered: 'Доставлен',
  cancelled: 'Отменён'
}

const statusColors: Record<string, string> = {
  new: '#409EFF',
  processing: '#e6a23c',
  delivered: '#67c23a',
  cancelled: '#f56c6c'
}

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' }
]

// Stats
const totalOrders = computed(() => orders.value.length)
const newOrders = computed(() => orders.value.filter(o => o.status === 'new').length)
const processingOrders = computed(() => orders.value.filter(o => o.status === 'processing').length)
const completedOrders = computed(() => orders.value.filter(o => o.status === 'delivered').length)

// Filtered orders
const filteredOrders = computed(() => {
  let result = [...orders.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o =>
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    )
  }

  if (filterStatus.value) {
    result = result.filter(o => o.status === filterStatus.value)
  }

  if (filterDateRange.value) {
    const [from, to] = filterDateRange.value
    result = result.filter(o => {
      const d = o.date.slice(0, 10)
      return d >= from && d <= to
    })
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Demo data generator
function generateDemoOrders(): Order[] {
  const names = [
    'Александр Иванов', 'Мария Петрова', 'Дмитрий Сидоров', 'Елена Козлова',
    'Артём Новиков', 'Анна Смирнова', 'Максим Волков', 'Ольга Лебедева',
    'Сергей Морозов', 'Татьяна Николаева', 'Иван Соколов', 'Екатерина Попова',
    'Андрей Кузнецов', 'Наталья Фёдорова', 'Павел Захаров', 'Юлия Васильева',
    'Кирилл Орлов', 'Светлана Белова'
  ]

  const phones = [
    '+7 (916) 123-45-67', '+7 (903) 234-56-78', '+7 (926) 345-67-89',
    '+7 (905) 456-78-90', '+7 (915) 567-89-01', '+7 (909) 678-90-12',
    '+7 (917) 789-01-23', '+7 (906) 890-12-34', '+7 (925) 901-23-45',
    '+7 (903) 012-34-56', '+7 (916) 111-22-33', '+7 (926) 444-55-66',
    '+7 (905) 777-88-99', '+7 (915) 222-33-44', '+7 (909) 555-66-77',
    '+7 (917) 888-99-00', '+7 (906) 333-44-55', '+7 (925) 666-77-88'
  ]

  const addresses = [
    'г. Москва, ул. Тверская, д. 15, кв. 42',
    'г. Москва, Кутузовский пр-т, д. 26, кв. 8',
    'г. Москва, ул. Арбат, д. 10, кв. 17',
    'г. Москва, Ленинский пр-т, д. 72, кв. 105',
    'г. Москва, ул. Новый Арбат, д. 21, кв. 3',
    'г. Москва, Бульвар Дмитрия Донского, д. 6, кв. 91',
    'г. Москва, ул. Профсоюзная, д. 44, кв. 28',
    'г. Москва, Комсомольский пр-т, д. 58, кв. 64'
  ]

  const products: OrderItem[] = [
    { name: 'iPhone 16 Pro 256GB', image: '', qty: 1, price: 134990 },
    { name: 'iPhone 16 Pro Max 512GB', image: '', qty: 1, price: 174990 },
    { name: 'iPhone 16 128GB', image: '', qty: 1, price: 94990 },
    { name: 'AirPods Pro 3', image: '', qty: 1, price: 24990 },
    { name: 'AirPods 4', image: '', qty: 1, price: 16990 },
    { name: 'MacBook Air M4 13" 256GB', image: '', qty: 1, price: 129990 },
    { name: 'MacBook Air M4 15" 512GB', image: '', qty: 1, price: 164990 },
    { name: 'MacBook Pro M4 Pro 14"', image: '', qty: 1, price: 219990 },
    { name: 'iPad Air M3 11"', image: '', qty: 1, price: 69990 },
    { name: 'iPad Pro M4 13"', image: '', qty: 1, price: 149990 },
    { name: 'Apple Watch Ultra 3', image: '', qty: 1, price: 84990 },
    { name: 'Apple Watch Series 10', image: '', qty: 1, price: 44990 },
    { name: 'Чехол MagSafe iPhone 16 Pro', image: '', qty: 1, price: 5990 },
    { name: 'Зарядка MagSafe 15W', image: '', qty: 1, price: 4990 }
  ]

  const statuses: Order['status'][] = ['new', 'processing', 'delivered', 'cancelled']

  const result: Order[] = []

  for (let i = 0; i < 18; i++) {
    const itemCount = Math.floor(Math.random() * 3) + 1
    const orderItems: OrderItem[] = []
    const usedIndexes = new Set<number>()

    for (let j = 0; j < itemCount; j++) {
      let idx: number
      do {
        idx = Math.floor(Math.random() * products.length)
      } while (usedIndexes.has(idx))
      usedIndexes.add(idx)
      const item = { ...products[idx] }
      if (Math.random() > 0.7) item.qty = 2
      orderItems.push(item)
    }

    const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60))

    let status: Order['status']
    if (daysAgo < 2) status = 'new'
    else if (daysAgo < 7) status = Math.random() > 0.3 ? 'processing' : 'new'
    else if (daysAgo < 20) status = Math.random() > 0.3 ? 'delivered' : 'processing'
    else status = Math.random() > 0.15 ? 'delivered' : 'cancelled'

    result.push({
      id: i + 1,
      order_number: `OP-${String(10000 + i).slice(1)}`,
      date: date.toISOString(),
      customer_name: names[i % names.length],
      customer_phone: phones[i % phones.length],
      customer_email: `${names[i % names.length].split(' ')[0].toLowerCase()}@mail.ru`,
      customer_address: addresses[i % addresses.length],
      items: orderItems,
      total,
      status,
      notes: ''
    })
  }

  return result
}

const loadFromLocalStorage = (): Order[] => {
  try {
    const data = localStorage.getItem('admin_orders')
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return []
}

const saveToLocalStorage = (data: Order[]) => {
  localStorage.setItem('admin_orders', JSON.stringify(data))
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/orders')
    orders.value = res.data || []
  } catch (e: any) {
    if (handleAuthError(e)) return
    // Fallback to localStorage
    let stored = loadFromLocalStorage()
    if (stored.length === 0) {
      stored = generateDemoOrders()
      saveToLocalStorage(stored)
    }
    orders.value = stored
  } finally {
    loading.value = false
  }
}

const openOrderDetail = (order: Order) => {
  currentOrder.value = { ...order, items: [...order.items] }
  editStatus.value = order.status
  editNotes.value = order.notes || ''
  dialogVisible.value = true
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatPrice = (val: number) => {
  return val.toLocaleString('ru-RU') + ' ₽'
}

const getItemsCount = (order: Order) => {
  return order.items.reduce((sum, item) => sum + item.qty, 0)
}

const updateOrderStatus = async () => {
  if (!currentOrder.value) return

  const order = orders.value.find(o => o.id === currentOrder.value!.id)
  if (!order) return

  const oldStatus = order.status
  const newStatus = editStatus.value as Order['status']

  if (oldStatus === newStatus && editNotes.value === order.notes) {
    dialogVisible.value = false
    return
  }

  try {
    await ensureCsrf()
    await api.put(`/admin/orders/${order.id}`, {
      status: newStatus,
      notes: editNotes.value
    })
    order.status = newStatus
    order.notes = editNotes.value
    ElMessage.success('Заказ обновлён')
  } catch (e: any) {
    if (handleAuthError(e)) return
    // Fallback: update locally
    order.status = newStatus
    order.notes = editNotes.value
    saveToLocalStorage(orders.value)
    ElMessage.success('Заказ обновлён (локально)')
  }

  if (oldStatus !== newStatus) {
    log('status-change', 'Заказ', `${order.order_number}: ${statusLabels[oldStatus]} → ${statusLabels[newStatus]}`)
  }

  dialogVisible.value = false
}

const deleteOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `Удалить заказ ${order.order_number}?`,
      'Подтверждение удаления',
      { confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', type: 'warning' }
    )
  } catch {
    return
  }

  try {
    await ensureCsrf()
    await api.delete(`/admin/orders/${order.id}`)
    orders.value = orders.value.filter(o => o.id !== order.id)
    ElMessage.success('Заказ удалён')
  } catch (e: any) {
    if (handleAuthError(e)) return
    // Fallback: delete locally
    orders.value = orders.value.filter(o => o.id !== order.id)
    saveToLocalStorage(orders.value)
    ElMessage.success('Заказ удалён (локально)')
  }

  log('delete', 'Заказ', order.order_number)
}

onMounted(fetchOrders)
</script>

<template>
  <div class="orders-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>Заказы</h2>
        <span class="subtitle">Управление заказами магазина</span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ totalOrders }}</div>
        <div class="stat-label">Всего заказов</div>
        <div class="stat-icon stat-icon--total">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #409EFF">{{ newOrders }}</div>
        <div class="stat-label">Новые</div>
        <div class="stat-icon stat-icon--new">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zm-6-2h4v-4h-4v4zm-8 0h6v-2H6v2zm0-4h6v-2H6v2zm0-4h12v-2H6v2z"/></svg>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #e6a23c">{{ processingOrders }}</div>
        <div class="stat-label">В обработке</div>
        <div class="stat-icon stat-icon--processing">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #67c23a">{{ completedOrders }}</div>
        <div class="stat-label">Доставлены</div>
        <div class="stat-icon stat-icon--completed">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <el-input
        v-model="searchQuery"
        placeholder="Поиск по номеру, имени или телефону..."
        clearable
        class="filter-search"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterStatus" placeholder="Статус" clearable class="filter-status">
        <el-option
          v-for="opt in statusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-date-picker
        v-model="filterDateRange"
        type="daterange"
        range-separator="—"
        start-placeholder="От"
        end-placeholder="До"
        format="DD.MM.YYYY"
        value-format="YYYY-MM-DD"
        class="filter-date"
      />
    </div>

    <!-- Orders Table -->
    <div class="orders-table-wrap" v-loading="loading">
      <table v-if="filteredOrders.length > 0" class="orders-table">
        <thead>
          <tr>
            <th>Заказ</th>
            <th>Дата</th>
            <th>Клиент</th>
            <th>Товары</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" @click="openOrderDetail(order)" class="order-row">
            <td class="col-number">
              <span class="order-number">{{ order.order_number }}</span>
            </td>
            <td class="col-date">{{ formatDate(order.date) }}</td>
            <td class="col-customer">
              <div class="customer-name">{{ order.customer_name }}</div>
              <div class="customer-phone">{{ order.customer_phone }}</div>
            </td>
            <td class="col-items">{{ getItemsCount(order) }} шт.</td>
            <td class="col-total">{{ formatPrice(order.total) }}</td>
            <td class="col-status">
              <span
                class="status-badge"
                :style="{ background: statusColors[order.status] + '18', color: statusColors[order.status], borderColor: statusColors[order.status] + '40' }"
              >
                {{ statusLabels[order.status] }}
              </span>
            </td>
            <td class="col-actions" @click.stop>
              <el-button size="small" @click="openOrderDetail(order)">Детали</el-button>
              <el-button size="small" type="danger" @click="deleteOrder(order)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="!loading" class="empty-state">
        <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor" style="opacity: 0.3;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
        <p>Заказы не найдены</p>
      </div>
    </div>

    <!-- Order Detail Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentOrder ? 'Заказ ' + currentOrder.order_number : 'Детали заказа'"
      width="700px"
      class="order-dialog"
    >
      <template v-if="currentOrder">
        <!-- Customer Info -->
        <div class="detail-section">
          <h4>Клиент</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Имя</span>
              <span class="detail-value">{{ currentOrder.customer_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон</span>
              <span class="detail-value">{{ currentOrder.customer_phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ currentOrder.customer_email }}</span>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
              <span class="detail-label">Адрес доставки</span>
              <span class="detail-value">{{ currentOrder.customer_address }}</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="detail-section">
          <h4>Товары</h4>
          <div class="order-items-list">
            <div v-for="(item, idx) in currentOrder.items" :key="idx" class="order-item-row">
              <div class="item-image">
                <img v-if="item.image" :src="getImageUrl(item.image)" alt="" />
                <div v-else class="item-image-placeholder">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="opacity:0.3;"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                </div>
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-qty">{{ item.qty }} x {{ formatPrice(item.price) }}</div>
              </div>
              <div class="item-total">{{ formatPrice(item.price * item.qty) }}</div>
            </div>
          </div>
          <div class="order-total-row">
            <strong>Итого:</strong>
            <strong>{{ formatPrice(currentOrder.total) }}</strong>
          </div>
        </div>

        <!-- Status & Notes -->
        <div class="detail-section">
          <h4>Управление</h4>
          <el-form label-position="top">
            <el-form-item label="Статус заказа">
              <el-select v-model="editStatus" style="width: 100%">
                <el-option
                  v-for="opt in statusOptions.filter(o => o.value)"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Заметки">
              <el-input
                v-model="editNotes"
                type="textarea"
                :rows="3"
                placeholder="Внутренние заметки по заказу..."
              />
            </el-form-item>
          </el-form>
        </div>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">Закрыть</el-button>
        <el-button type="primary" @click="updateOrderStatus">Сохранить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.orders-page {
  padding: 20px 0;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 25px 30px;
  background: var(--card-bg, #ffffff);
  border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0, 0, 0, 0.08));
  border-radius: 8px;
}

.header-content h2 {
  font-size: 24px;
  color: var(--text-primary, #303133);
  font-weight: 500;
  margin: 0;
}

.subtitle {
  font-size: 12px;
  color: var(--text-muted, #909399);
  margin-top: 5px;
  display: block;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--card-bg, #ffffff);
  border-radius: 10px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.06));
  position: relative;
  overflow: hidden;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted, #909399);
  margin-top: 4px;
}

.stat-icon {
  position: absolute;
  top: 16px;
  right: 18px;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon--total { background: #f0f2f5; color: #606266; }
.stat-icon--new { background: #ecf5ff; color: #409EFF; }
.stat-icon--processing { background: #fdf6ec; color: #e6a23c; }
.stat-icon--completed { background: #f0f9eb; color: #67c23a; }

/* Filters */
.filters-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-search {
  flex: 1;
  min-width: 240px;
}

.filter-status {
  width: 180px;
}

.filter-date {
  width: 280px;
}

/* Table */
.orders-table-wrap {
  background: var(--card-bg, #ffffff);
  border-radius: 10px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.06));
  overflow: hidden;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table thead {
  background: var(--bg-secondary, #f5f7fa);
}

.orders-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted, #909399);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border, #ebeef5);
}

.orders-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border, #ebeef5);
  font-size: 14px;
  color: var(--text-primary, #303133);
}

.order-row {
  cursor: pointer;
  transition: background 0.15s;
}

.order-row:hover {
  background: var(--bg-secondary, #f5f7fa);
}

.order-number {
  font-weight: 600;
  color: #409EFF;
}

.customer-name {
  font-weight: 500;
}

.customer-phone {
  font-size: 12px;
  color: var(--text-muted, #909399);
  margin-top: 2px;
}

.col-total {
  font-weight: 600;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}

.col-actions {
  white-space: nowrap;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted, #909399);
}

.empty-state p {
  margin-top: 12px;
  font-size: 15px;
}

/* Detail Dialog */
.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border, #ebeef5);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted, #909399);
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary, #303133);
  font-weight: 500;
}

/* Order Items List */
.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 8px;
}

.item-image {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
}

.item-qty {
  font-size: 12px;
  color: var(--text-muted, #909399);
  margin-top: 2px;
}

.item-total {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  white-space: nowrap;
}

.order-total-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 12px 0;
  margin-top: 10px;
  border-top: 2px solid var(--border, #ebeef5);
  font-size: 16px;
  color: var(--text-primary, #303133);
}

/* Responsive */
@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-row {
    flex-direction: column;
  }

  .filter-search,
  .filter-status,
  .filter-date {
    width: 100%;
    min-width: unset;
  }

  .orders-table-wrap {
    overflow-x: auto;
  }

  .orders-table {
    min-width: 700px;
  }
}

@media (max-width: 500px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 14px 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark Theme */
:global([data-theme="dark"]) .page-header,
:global([data-theme="dark"]) .stat-card,
:global([data-theme="dark"]) .orders-table-wrap {
  background: #1e1e1e;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

:global([data-theme="dark"]) .orders-table thead {
  background: #2a2a2a;
}

:global([data-theme="dark"]) .orders-table th {
  border-color: #3a3a3a;
  color: #a0a0a0;
}

:global([data-theme="dark"]) .orders-table td {
  border-color: #3a3a3a;
  color: #e0e0e0;
}

:global([data-theme="dark"]) .order-row:hover {
  background: #2a2a2a;
}

:global([data-theme="dark"]) .order-item-row {
  background: #2a2a2a;
}

:global([data-theme="dark"]) .item-image {
  background: #333;
}

:global([data-theme="dark"]) .stat-icon--total { background: #2a2a2a; color: #a0a0a0; }
:global([data-theme="dark"]) .stat-icon--new { background: #1a3a5c; color: #409EFF; }
:global([data-theme="dark"]) .stat-icon--processing { background: #3d3020; color: #e6a23c; }
:global([data-theme="dark"]) .stat-icon--completed { background: #1e3a1e; color: #67c23a; }

:global([data-theme="dark"]) .detail-section h4 {
  border-color: #3a3a3a;
  color: #e0e0e0;
}

:global([data-theme="dark"]) .order-total-row {
  border-color: #3a3a3a;
  color: #e0e0e0;
}
</style>
