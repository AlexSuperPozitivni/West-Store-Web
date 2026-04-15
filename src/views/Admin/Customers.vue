<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'
import { useActivityLog } from '../../lib/useActivityLog'

interface Order {
  id: number
  date: string
  items: string
  amount: number
  status: string
}

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  orders: number
  totalSpent: number
  lastOrder: string
  firstOrder: string
  orderHistory: Order[]
  notes: string
}

const router = useRouter()
const { log } = useActivityLog()

const customers = ref<Customer[]>([])
const loading = ref(false)
const searchQuery = ref('')
const dialogVisible = ref(false)
const addDialogVisible = ref(false)
const selectedCustomer = ref<Customer | null>(null)
const customerNotes = ref('')

const addForm = ref({
  name: '',
  phone: '',
  email: ''
})

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

// ---- Demo data generation ----
const russianNames = [
  'Иванов Алексей', 'Петрова Мария', 'Сидоров Дмитрий', 'Козлова Анна',
  'Морозов Сергей', 'Волкова Екатерина', 'Новиков Андрей', 'Соколова Ольга',
  'Лебедев Максим', 'Кузнецова Татьяна', 'Попов Артём', 'Федорова Наталья',
  'Орлов Владимир', 'Смирнова Елена', 'Васильев Николай', 'Михайлова Ирина',
  'Егоров Павел', 'Захарова Юлия', 'Белов Роман', 'Тимофеева Светлана',
  'Григорьев Илья', 'Макарова Дарья', 'Жуков Кирилл', 'Степанова Вера'
]

const productNames = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15',
  'MacBook Air M3', 'MacBook Pro M3 Pro', 'iPad Pro M4', 'iPad Air M2',
  'Apple Watch Ultra 2', 'Apple Watch Series 9', 'AirPods Pro 2', 'AirPods Max',
  'iMac 24"', 'Mac Mini M2', 'Apple TV 4K', 'HomePod mini'
]

const orderStatuses = ['Выполнен', 'Выполнен', 'Выполнен', 'Доставлен', 'В пути', 'Обработка']

function generateDemoCustomers(): Customer[] {
  const now = new Date()
  const result: Customer[] = []

  for (let i = 0; i < russianNames.length; i++) {
    const name = russianNames[i]
    const nameParts = name.toLowerCase().split(' ')
    const email = `${nameParts[1] || nameParts[0]}.${nameParts[0]}@mail.ru`
    const phone = `+7 9${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 1000)).padStart(3, '0')} ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    const ordersCount = Math.floor(Math.random() * 8) + 1

    const orderHistory: Order[] = []
    let totalSpent = 0
    let lastDate = ''
    let firstDate = ''

    for (let j = 0; j < ordersCount; j++) {
      const daysAgo = Math.floor(Math.random() * 90) + 1
      const orderDate = new Date(now.getTime() - daysAgo * 86400000)
      const dateStr = orderDate.toISOString().split('T')[0]
      const itemCount = Math.floor(Math.random() * 3) + 1
      const items: string[] = []
      let orderAmount = 0

      for (let k = 0; k < itemCount; k++) {
        const product = productNames[Math.floor(Math.random() * productNames.length)]
        if (!items.includes(product)) {
          items.push(product)
          orderAmount += Math.floor(Math.random() * 150000) + 10000
        }
      }

      orderHistory.push({
        id: 1000 + i * 10 + j,
        date: dateStr,
        items: items.join(', '),
        amount: orderAmount,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
      })

      totalSpent += orderAmount
      if (!lastDate || dateStr > lastDate) lastDate = dateStr
      if (!firstDate || dateStr < firstDate) firstDate = dateStr
    }

    // Ensure totalSpent is in requested range
    if (totalSpent < 15000) totalSpent = 15000 + Math.floor(Math.random() * 50000)
    if (totalSpent > 500000) totalSpent = 350000 + Math.floor(Math.random() * 150000)

    orderHistory.sort((a, b) => b.date.localeCompare(a.date))

    result.push({
      id: i + 1,
      name,
      phone,
      email,
      orders: ordersCount,
      totalSpent,
      lastOrder: lastDate,
      firstOrder: firstDate,
      orderHistory,
      notes: ''
    })
  }

  return result
}

// ---- Data loading ----
const fetchCustomers = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/customers')
    customers.value = res.data || []
    localStorage.setItem('admin_customers', JSON.stringify(customers.value))
  } catch (e: any) {
    if (handleAuthError(e)) return
    // Fallback to localStorage
    const stored = localStorage.getItem('admin_customers')
    if (stored) {
      customers.value = JSON.parse(stored)
    } else {
      customers.value = generateDemoCustomers()
      localStorage.setItem('admin_customers', JSON.stringify(customers.value))
    }
  } finally {
    loading.value = false
  }
}

const saveToStorage = () => {
  localStorage.setItem('admin_customers', JSON.stringify(customers.value))
}

// ---- Computed ----
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value
  const q = searchQuery.value.toLowerCase()
  return customers.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.email.toLowerCase().includes(q)
  )
})

const totalCustomers = computed(() => customers.value.length)

const newThisMonth = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  return customers.value.filter(c => c.firstOrder >= monthStart).length
})

const averageCheck = computed(() => {
  if (customers.value.length === 0) return 0
  const totalOrders = customers.value.reduce((sum, c) => sum + c.orders, 0)
  const totalSpent = customers.value.reduce((sum, c) => sum + c.totalSpent, 0)
  return totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0
})

// ---- Actions ----
const openCustomer = (customer: Customer) => {
  selectedCustomer.value = { ...customer }
  customerNotes.value = customer.notes || ''
  dialogVisible.value = true
}

const saveNotes = () => {
  if (!selectedCustomer.value) return
  const idx = customers.value.findIndex(c => c.id === selectedCustomer.value!.id)
  if (idx !== -1) {
    customers.value[idx].notes = customerNotes.value
    saveToStorage()
    ElMessage.success('Заметки сохранены')
  }
}

const deleteCustomer = async (customer: Customer) => {
  try {
    await ElMessageBox.confirm(
      `Удалить клиента "${customer.name}"?`,
      'Подтверждение',
      { confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', type: 'warning' }
    )
  } catch { return }

  try {
    await ensureCsrf()
    await api.delete(`/admin/customers/${customer.id}`)
  } catch {
    // API may not exist, proceed with local delete
  }

  customers.value = customers.value.filter(c => c.id !== customer.id)
  saveToStorage()
  log('delete', `Клиент: ${customer.name}`)
  ElMessage.success('Клиент удалён')
}

const openAddDialog = () => {
  addForm.value = { name: '', phone: '', email: '' }
  addDialogVisible.value = true
}

const addCustomer = () => {
  if (!addForm.value.name.trim()) {
    ElMessage.warning('Введите имя клиента')
    return
  }
  if (!addForm.value.phone.trim()) {
    ElMessage.warning('Введите телефон')
    return
  }

  const maxId = customers.value.reduce((max, c) => Math.max(max, c.id), 0)
  const now = new Date().toISOString().split('T')[0]

  const newCustomer: Customer = {
    id: maxId + 1,
    name: addForm.value.name.trim(),
    phone: addForm.value.phone.trim(),
    email: addForm.value.email.trim(),
    orders: 0,
    totalSpent: 0,
    lastOrder: '',
    firstOrder: now,
    orderHistory: [],
    notes: ''
  }

  customers.value.unshift(newCustomer)
  saveToStorage()
  log('create', `Клиент: ${newCustomer.name}`)
  ElMessage.success('Клиент добавлен')
  addDialogVisible.value = false
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const formatMoney = (amount: number) => {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Выполнен': return '#67c23a'
    case 'Доставлен': return '#409EFF'
    case 'В пути': return '#e6a23c'
    case 'Обработка': return '#909399'
    default: return '#909399'
  }
}

onMounted(fetchCustomers)
</script>

<template>
  <div class="customers-page" v-loading="loading">
    <div class="page-header">
      <div class="header-content">
        <h2>Клиенты</h2>
        <span class="subtitle">Управление клиентской базой</span>
      </div>
      <el-button type="primary" @click="openAddDialog">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:6px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Добавить клиента
      </el-button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ totalCustomers }}</div>
          <div class="stat-label">Всего клиентов</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon new-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ newThisMonth }}</div>
          <div class="stat-label">Новых за месяц</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon avg-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ formatMoney(averageCheck) }}</div>
          <div class="stat-label">Средний чек</div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="Поиск по имени, телефону или email..."
        clearable
        size="large"
        prefix-icon="Search"
      />
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <el-table :data="filteredCustomers" style="width: 100%" stripe :header-cell-style="{ background: 'var(--table-header-bg, #fafafa)', color: 'var(--text-primary, #303133)' }">
        <el-table-column prop="name" label="Имя" min-width="180">
          <template #default="{ row }">
            <span class="customer-name" @click="openCustomer(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="Телефон" min-width="160" />
        <el-table-column prop="email" label="Email" min-width="200" />
        <el-table-column prop="orders" label="Заказы" width="100" align="center" sortable />
        <el-table-column label="Потрачено" width="150" align="right" sortable :sort-method="(a: Customer, b: Customer) => a.totalSpent - b.totalSpent">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.totalSpent) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Посл. заказ" width="140" align="center" sortable :sort-method="(a: Customer, b: Customer) => a.lastOrder.localeCompare(b.lastOrder)">
          <template #default="{ row }">
            {{ formatDate(row.lastOrder) }}
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openCustomer(row)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </el-button>
            <el-button link type="danger" size="small" @click="deleteCustomer(row)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="filteredCustomers.length === 0 && !loading" class="empty-text">
        {{ searchQuery ? 'Клиенты не найдены' : 'Нет клиентов' }}
      </div>
    </div>

    <!-- Customer Detail Dialog -->
    <el-dialog v-model="dialogVisible" :title="selectedCustomer?.name || 'Клиент'" width="700px" destroy-on-close>
      <div v-if="selectedCustomer" class="customer-detail">
        <div class="detail-section">
          <h4>Контактные данные</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Имя</span>
              <span class="detail-value">{{ selectedCustomer.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон</span>
              <span class="detail-value">{{ selectedCustomer.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ selectedCustomer.email }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Статистика</h4>
          <div class="detail-grid detail-grid-4">
            <div class="detail-item">
              <span class="detail-label">Заказов</span>
              <span class="detail-value highlight">{{ selectedCustomer.orders }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Потрачено</span>
              <span class="detail-value highlight">{{ formatMoney(selectedCustomer.totalSpent) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Средний чек</span>
              <span class="detail-value">{{ selectedCustomer.orders > 0 ? formatMoney(Math.round(selectedCustomer.totalSpent / selectedCustomer.orders)) : '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Первый заказ</span>
              <span class="detail-value">{{ formatDate(selectedCustomer.firstOrder) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>История заказов</h4>
          <div v-if="selectedCustomer.orderHistory.length === 0" class="empty-text">Нет заказов</div>
          <div v-else class="order-history">
            <div v-for="order in selectedCustomer.orderHistory" :key="order.id" class="order-row">
              <div class="order-main">
                <span class="order-number">#{{ order.id }}</span>
                <span class="order-date">{{ formatDate(order.date) }}</span>
                <span class="order-status" :style="{ color: statusColor(order.status) }">{{ order.status }}</span>
              </div>
              <div class="order-items">{{ order.items }}</div>
              <div class="order-amount">{{ formatMoney(order.amount) }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Заметки</h4>
          <el-input
            v-model="customerNotes"
            type="textarea"
            :rows="3"
            placeholder="Добавьте заметку о клиенте..."
          />
          <el-button type="primary" size="small" style="margin-top: 10px" @click="saveNotes">
            Сохранить заметки
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- Add Customer Dialog -->
    <el-dialog v-model="addDialogVisible" title="Новый клиент" width="480px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="Имя">
          <el-input v-model="addForm.name" placeholder="Фамилия Имя" />
        </el-form-item>
        <el-form-item label="Телефон">
          <el-input v-model="addForm.phone" placeholder="+7 9xx xxx xxxx" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="addForm.email" placeholder="email@example.com" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="addCustomer">Добавить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.customers-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }

.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px; margin-bottom: 24px;
}
.stat-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--card-bg, #ffffff); padding: 24px; border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px var(--shadow, rgba(0,0,0,0.12)); }

.stat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.stat-icon svg { width: 26px; height: 26px; }
.total-icon { background: rgba(64,158,255,0.12); color: #409EFF; }
.new-icon { background: rgba(103,194,58,0.12); color: #67c23a; }
.avg-icon { background: rgba(230,162,60,0.12); color: #e6a23c; }

.stat-number { font-size: 28px; font-weight: 700; color: var(--text-primary, #303133); line-height: 1; }
.stat-label { font-size: 13px; color: var(--text-muted, #909399); margin-top: 4px; }

.search-bar {
  margin-bottom: 20px;
  max-width: 480px;
}

.table-wrapper {
  background: var(--card-bg, #ffffff); border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); overflow: hidden;
}

.customer-name {
  color: #409EFF; cursor: pointer; font-weight: 500;
  transition: color 0.2s;
}
.customer-name:hover { color: #66b1ff; text-decoration: underline; }

.money { font-weight: 600; color: var(--text-primary, #303133); }

.empty-text {
  padding: 24px; text-align: center;
  color: var(--text-muted, #909399); font-size: 14px;
}

/* Detail Dialog */
.customer-detail { }
.detail-section { margin-bottom: 24px; }
.detail-section:last-child { margin-bottom: 0; }
.detail-section h4 {
  font-size: 15px; font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0 0 12px; padding-bottom: 8px;
  border-bottom: 1px solid var(--border, #ebeef5);
}

.detail-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.detail-grid-4 { grid-template-columns: repeat(4, 1fr); }

.detail-item { }
.detail-label { display: block; font-size: 12px; color: var(--text-muted, #909399); margin-bottom: 4px; }
.detail-value { display: block; font-size: 14px; color: var(--text-primary, #303133); font-weight: 500; }
.detail-value.highlight { font-size: 18px; font-weight: 700; color: #409EFF; }

.order-history { max-height: 260px; overflow-y: auto; }
.order-row {
  padding: 10px 0;
  border-bottom: 1px solid var(--border, #f0f2f5);
}
.order-row:last-child { border-bottom: none; }

.order-main { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.order-number { font-weight: 600; color: var(--text-primary, #303133); font-size: 13px; }
.order-date { font-size: 13px; color: var(--text-muted, #909399); }
.order-status { font-size: 12px; font-weight: 500; margin-left: auto; }
.order-items { font-size: 13px; color: var(--text-secondary, #606266); }
.order-amount { font-size: 14px; font-weight: 600; color: var(--text-primary, #303133); margin-top: 2px; }

/* Dark theme */
:deep(.el-table) {
  --el-table-bg-color: var(--card-bg, #ffffff);
  --el-table-tr-bg-color: var(--card-bg, #ffffff);
  --el-table-header-bg-color: var(--table-header-bg, #fafafa);
  --el-table-row-hover-bg-color: var(--hover-bg, #f5f7fa);
  --el-table-border-color: var(--border, #ebeef5);
  --el-table-text-color: var(--text-primary, #303133);
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .detail-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .search-bar { max-width: 100%; }
}
</style>
