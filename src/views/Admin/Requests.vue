<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useActivityLog } from '../../lib/useActivityLog'

const { log } = useActivityLog()

interface CustomerRequest {
  id: string
  type: 'trade-in' | 'repair' | 'callback'
  name: string
  phone: string
  message: string
  status: 'new' | 'in-progress' | 'done' | 'rejected'
  isRead: boolean
  notes: string
  createdAt: string
}

const STORAGE_KEY = 'admin_requests'

const requests = ref<CustomerRequest[]>([])
const loading = ref(false)
const activeFilter = ref('all')
const selectedIds = ref<string[]>([])
const detailVisible = ref(false)
const currentRequest = ref<CustomerRequest | null>(null)
const editNotes = ref('')
const editStatus = ref<CustomerRequest['status']>('new')

// --- Persistence ---

function loadRequests(): CustomerRequest[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return data.length ? data : generateDemoRequests()
  } catch {
    return generateDemoRequests()
  }
}

function saveRequests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests.value))
}

// --- Demo data ---

function generateDemoRequests(): CustomerRequest[] {
  const now = Date.now()
  const day = 86400000

  const demos: CustomerRequest[] = [
    {
      id: 'r1', type: 'trade-in', name: 'Алексей Смирнов', phone: '+7 916 234-56-78',
      message: 'Хочу сдать iPhone 14 Pro 256GB, состояние отличное, в комплекте коробка и зарядка.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 0.2).toISOString()
    },
    {
      id: 'r2', type: 'repair', name: 'Мария Козлова', phone: '+7 925 111-22-33',
      message: 'Разбит экран iPhone 15, упал с высоты. Сенсор работает частично.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 0.5).toISOString()
    },
    {
      id: 'r3', type: 'callback', name: 'Дмитрий Волков', phone: '+7 903 987-65-43',
      message: 'Интересует наличие MacBook Air M3 и условия рассрочки.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 1).toISOString()
    },
    {
      id: 'r4', type: 'trade-in', name: 'Ольга Петрова', phone: '+7 977 555-44-33',
      message: 'Хочу обменять iPhone 13 128GB на iPhone 16. Какая доплата?',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 1.5).toISOString()
    },
    {
      id: 'r5', type: 'repair', name: 'Иван Сидоров', phone: '+7 909 321-00-11',
      message: 'iPhone 14 не заряжается, разъем Lightning повреждён.',
      status: 'in-progress', isRead: true, notes: 'Записан на диагностику 15.04', createdAt: new Date(now - day * 2).toISOString()
    },
    {
      id: 'r6', type: 'callback', name: 'Анна Белова', phone: '+7 926 777-88-99',
      message: 'Подскажите стоимость AirPods Pro 2 и есть ли гравировка.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 2.5).toISOString()
    },
    {
      id: 'r7', type: 'trade-in', name: 'Сергей Новиков', phone: '+7 915 444-33-22',
      message: 'Сдаю Samsung Galaxy S23 Ultra, хочу перейти на iPhone 16 Pro Max.',
      status: 'done', isRead: true, notes: 'Оценили в 45 000₽, клиент согласен', createdAt: new Date(now - day * 3).toISOString()
    },
    {
      id: 'r8', type: 'repair', name: 'Екатерина Морозова', phone: '+7 964 222-11-00',
      message: 'iPad Pro 11 — не работает Face ID после падения.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 3.5).toISOString()
    },
    {
      id: 'r9', type: 'callback', name: 'Павел Кузнецов', phone: '+7 985 666-55-44',
      message: 'Когда поступит iPhone 16e? Хочу предзаказ.',
      status: 'in-progress', isRead: true, notes: 'Перезвонить когда появится в наличии', createdAt: new Date(now - day * 4).toISOString()
    },
    {
      id: 'r10', type: 'trade-in', name: 'Наталья Фёдорова', phone: '+7 916 888-77-66',
      message: 'iPhone 12 Mini 64GB, батарея 82%, мелкие царапины на корпусе.',
      status: 'rejected', isRead: true, notes: 'Слишком низкая ёмкость батареи, клиент отказался от условий', createdAt: new Date(now - day * 5).toISOString()
    },
    {
      id: 'r11', type: 'repair', name: 'Артём Лебедев', phone: '+7 903 123-45-67',
      message: 'MacBook Pro 14 — залитая клавиатура, несколько клавиш не работают.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 6).toISOString()
    },
    {
      id: 'r12', type: 'callback', name: 'Виктория Соколова', phone: '+7 925 999-88-77',
      message: 'Хочу узнать про Apple Watch Ultra 2 — есть ли в наличии?',
      status: 'done', isRead: true, notes: 'Перезвонили, оформили заказ', createdAt: new Date(now - day * 7).toISOString()
    },
    {
      id: 'r13', type: 'trade-in', name: 'Максим Орлов', phone: '+7 977 333-22-11',
      message: 'Хочу сдать iPhone 14 128GB, покупал у вас год назад. Есть чек.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 8).toISOString()
    },
    {
      id: 'r14', type: 'repair', name: 'Елена Попова', phone: '+7 909 555-66-77',
      message: 'AirPods Pro 2 — левый наушник перестал работать, гарантия ещё действует.',
      status: 'in-progress', isRead: true, notes: 'Проверяем гарантийный случай', createdAt: new Date(now - day * 10).toISOString()
    },
    {
      id: 'r15', type: 'callback', name: 'Роман Егоров', phone: '+7 964 111-22-33',
      message: 'Есть ли кредит на iPhone 16 Pro? Какие банки?',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 12).toISOString()
    },
    {
      id: 'r16', type: 'repair', name: 'Татьяна Васильева', phone: '+7 916 444-55-66',
      message: 'iPhone 15 Pro Max — камера мутная, возможно попала влага.',
      status: 'new', isRead: false, notes: '', createdAt: new Date(now - day * 0.1).toISOString()
    }
  ]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demos))
  return demos
}

// --- Computed ---

const typeLabel = (type: CustomerRequest['type']) => {
  const map = { 'trade-in': 'Trade-In', 'repair': 'Ремонт', 'callback': 'Звонок' }
  return map[type]
}

const typeTagType = (type: CustomerRequest['type']) => {
  const map = { 'trade-in': 'warning', 'repair': 'danger', 'callback': 'primary' }
  return map[type] as 'warning' | 'danger' | 'primary'
}

const statusLabel = (status: CustomerRequest['status']) => {
  const map = { 'new': 'Новая', 'in-progress': 'В работе', 'done': 'Обработана', 'rejected': 'Отклонена' }
  return map[status]
}

const statusTagType = (status: CustomerRequest['status']) => {
  const map = { 'new': 'danger', 'in-progress': 'warning', 'done': 'success', 'rejected': 'info' }
  return map[status] as 'danger' | 'warning' | 'success' | 'info'
}

const totalCount = computed(() => requests.value.length)
const newCount = computed(() => requests.value.filter(r => !r.isRead || r.status === 'new').length)
const doneCount = computed(() => requests.value.filter(r => r.status === 'done').length)

const tradeInCount = computed(() => requests.value.filter(r => r.type === 'trade-in').length)
const repairCount = computed(() => requests.value.filter(r => r.type === 'repair').length)
const callbackCount = computed(() => requests.value.filter(r => r.type === 'callback').length)

const filteredRequests = computed(() => {
  let list = [...requests.value]
  if (activeFilter.value === 'trade-in') list = list.filter(r => r.type === 'trade-in')
  else if (activeFilter.value === 'repair') list = list.filter(r => r.type === 'repair')
  else if (activeFilter.value === 'callback') list = list.filter(r => r.type === 'callback')
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return list
})

// --- Actions ---

function openDetail(row: CustomerRequest) {
  if (!row.isRead) {
    row.isRead = true
    saveRequests()
  }
  currentRequest.value = row
  editNotes.value = row.notes
  editStatus.value = row.status
  detailVisible.value = true
}

function saveDetail() {
  if (!currentRequest.value) return
  const prev = currentRequest.value.status
  currentRequest.value.status = editStatus.value
  currentRequest.value.notes = editNotes.value
  saveRequests()
  ElMessage.success('Заявка обновлена')
  if (prev !== editStatus.value) {
    log('status-change', 'Заявка', `${currentRequest.value.name} → ${statusLabel(editStatus.value)}`)
  }
  detailVisible.value = false
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatPhone(phone: string) {
  return phone.replace(/[\s\-()]/g, '')
}

// Selection & bulk
function handleSelectionChange(rows: CustomerRequest[]) {
  selectedIds.value = rows.map(r => r.id)
}

async function bulkMarkDone() {
  if (!selectedIds.value.length) return
  requests.value.forEach(r => {
    if (selectedIds.value.includes(r.id)) {
      r.status = 'done'
      r.isRead = true
    }
  })
  saveRequests()
  selectedIds.value = []
  ElMessage.success('Выбранные заявки обработаны')
  log('bulk-update', 'Заявки', `Обработано: ${selectedIds.value.length}`)
}

async function bulkDelete() {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(`Удалить ${selectedIds.value.length} заявок?`, 'Подтверждение', { type: 'warning' })
    const count = selectedIds.value.length
    requests.value = requests.value.filter(r => !selectedIds.value.includes(r.id))
    saveRequests()
    selectedIds.value = []
    ElMessage.success(`Удалено: ${count}`)
    log('delete', 'Заявки', `Удалено заявок: ${count}`)
  } catch {
    // cancelled
  }
}

function deleteRequest(row: CustomerRequest) {
  ElMessageBox.confirm(`Удалить заявку от "${row.name}"?`, 'Подтверждение', { type: 'warning' })
    .then(() => {
      requests.value = requests.value.filter(r => r.id !== row.id)
      saveRequests()
      ElMessage.success('Заявка удалена')
      log('delete', 'Заявка', row.name)
    })
    .catch(() => {})
}

onMounted(() => {
  requests.value = loadRequests()
})
</script>

<template>
  <div class="requests-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>Заявки</h2>
        <span class="subtitle">Входящие обращения клиентов</span>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ totalCount }}</div>
        <div class="stat-label">Всего заявок</div>
      </div>
      <div class="stat-card stat-new">
        <div class="stat-value">
          {{ newCount }}
          <el-badge v-if="newCount > 0" :value="newCount" class="stat-badge" />
        </div>
        <div class="stat-label">Новых</div>
      </div>
      <div class="stat-card stat-done">
        <div class="stat-value">{{ doneCount }}</div>
        <div class="stat-label">Обработано</div>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button :class="['tab-btn', { active: activeFilter === 'all' }]" @click="activeFilter = 'all'">
        Все <span class="tab-count">{{ totalCount }}</span>
      </button>
      <button :class="['tab-btn', { active: activeFilter === 'trade-in' }]" @click="activeFilter = 'trade-in'">
        Trade-In <span class="tab-count">{{ tradeInCount }}</span>
      </button>
      <button :class="['tab-btn', { active: activeFilter === 'repair' }]" @click="activeFilter = 'repair'">
        Ремонт <span class="tab-count">{{ repairCount }}</span>
      </button>
      <button :class="['tab-btn', { active: activeFilter === 'callback' }]" @click="activeFilter = 'callback'">
        Обратный звонок <span class="tab-count">{{ callbackCount }}</span>
      </button>
    </div>

    <!-- Bulk actions -->
    <div v-if="selectedIds.length" class="bulk-bar">
      <span>Выбрано: {{ selectedIds.length }}</span>
      <el-button size="small" type="success" @click="bulkMarkDone">Обработать</el-button>
      <el-button size="small" type="danger" @click="bulkDelete">Удалить</el-button>
    </div>

    <!-- Table -->
    <el-table
      :data="filteredRequests"
      style="width: 100%"
      :row-class-name="(data: any) => (!data.row.isRead ? 'row-unread' : '')"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      empty-text="Нет заявок"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column label="Дата" width="150">
        <template #default="{ row }">
          <span class="cell-date">{{ formatDate(row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Тип" width="120">
        <template #default="{ row }">
          <el-tag :type="typeTagType(row.type)" size="small" effect="dark">
            {{ typeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Клиент" min-width="160">
        <template #default="{ row }">
          <span :class="{ 'text-bold': !row.isRead }">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Телефон" width="170">
        <template #default="{ row }">
          <a :href="'tel:' + formatPhone(row.phone)" class="phone-link">{{ row.phone }}</a>
        </template>
      </el-table-column>
      <el-table-column label="Статус" width="130">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDetail(row)">Открыть</el-button>
          <el-button size="small" type="danger" :icon="'Delete'" circle @click="deleteRequest(row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- Detail dialog -->
    <el-dialog v-model="detailVisible" title="Детали заявки" width="600px" :close-on-click-modal="false">
      <template v-if="currentRequest">
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">Клиент:</span>
            <span class="detail-value">{{ currentRequest.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Телефон:</span>
            <a :href="'tel:' + formatPhone(currentRequest.phone)" class="detail-value phone-link">{{ currentRequest.phone }}</a>
          </div>
          <div class="detail-row">
            <span class="detail-label">Тип заявки:</span>
            <el-tag :type="typeTagType(currentRequest.type)" size="small" effect="dark">
              {{ typeLabel(currentRequest.type) }}
            </el-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">Дата:</span>
            <span class="detail-value">{{ formatDate(currentRequest.createdAt) }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="currentRequest.message">
          <div class="detail-label" style="margin-bottom: 8px;">Сообщение:</div>
          <div class="detail-message">{{ currentRequest.message }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label" style="margin-bottom: 8px;">Статус:</div>
          <el-select v-model="editStatus" style="width: 100%;">
            <el-option value="new" label="Новая" />
            <el-option value="in-progress" label="В работе" />
            <el-option value="done" label="Обработана" />
            <el-option value="rejected" label="Отклонена" />
          </el-select>
        </div>

        <div class="detail-section">
          <div class="detail-label" style="margin-bottom: 8px;">Заметки (внутренние):</div>
          <el-input
            v-model="editNotes"
            type="textarea"
            :rows="3"
            placeholder="Комментарий для сотрудников..."
          />
        </div>

        <div class="detail-actions">
          <a :href="'tel:' + formatPhone(currentRequest.phone)" class="action-btn action-call">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/></svg>
            Позвонить
          </a>
          <a :href="'https://wa.me/' + formatPhone(currentRequest.phone).replace('+', '')" target="_blank" class="action-btn action-wa">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57a1.1 1.1 0 00-.8.37A3.36 3.36 0 007 9.5c0 1.97 1.44 3.87 1.64 4.14.2.27 2.83 4.32 6.86 6.06.96.41 1.71.66 2.29.84.96.31 1.84.26 2.53.16.77-.11 2.38-.97 2.72-1.91.34-.94.34-1.75.24-1.91-.1-.17-.37-.27-.78-.45zM12.05 21.5a9.5 9.5 0 01-4.84-1.32l-.35-.21-3.61.95.96-3.52-.23-.36A9.5 9.5 0 1112.05 21.5zM12.05 2A10 10 0 002 12.05a10 10 0 001.5 5.25L2 22l4.84-1.27A10 10 0 1012.05 2z"/></svg>
            WhatsApp
          </a>
          <a :href="'https://t.me/' + formatPhone(currentRequest.phone).replace('+', '')" target="_blank" class="action-btn action-tg">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
            Telegram
          </a>
        </div>
      </template>

      <template #footer>
        <el-button @click="detailVisible = false">Закрыть</el-button>
        <el-button type="primary" @click="saveDetail">Сохранить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.requests-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }

/* Stats */
.stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;
}
.stat-card {
  background: var(--card-bg, #ffffff); border-radius: 10px; padding: 20px 24px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06));
  text-align: center;
}
.stat-card.stat-new { border-left: 4px solid #F56C6C; }
.stat-card.stat-done { border-left: 4px solid #67C23A; }
.stat-value {
  font-size: 28px; font-weight: 700; color: var(--text-primary, #303133);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.stat-label { font-size: 13px; color: var(--text-muted, #909399); margin-top: 4px; }
.stat-badge :deep(.el-badge__content) { position: static; transform: none; }

/* Filter tabs */
.filter-tabs {
  display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;
}
.tab-btn {
  padding: 8px 18px; border: 1px solid var(--border, #dcdfe6); border-radius: 20px;
  background: var(--card-bg, #ffffff); color: var(--text-primary, #606266);
  cursor: pointer; font-size: 13px; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
}
.tab-btn:hover { border-color: #409EFF; color: #409EFF; }
.tab-btn.active { background: #409EFF; color: #fff; border-color: #409EFF; }
.tab-count {
  background: rgba(0,0,0,0.1); border-radius: 10px; padding: 1px 7px; font-size: 11px;
}
.tab-btn.active .tab-count { background: rgba(255,255,255,0.25); }

/* Bulk bar */
.bulk-bar {
  display: flex; align-items: center; gap: 12px; padding: 10px 16px; margin-bottom: 12px;
  background: #ecf5ff; border-radius: 8px; font-size: 13px; color: #409EFF;
}

/* Table tweaks */
:deep(.row-unread) {
  background-color: #fef0f0 !important;
  font-weight: 600;
}
:deep(.row-unread:hover > td) {
  background-color: #fde2e2 !important;
}
.text-bold { font-weight: 700; }
.cell-date { font-size: 12px; color: var(--text-muted, #909399); white-space: nowrap; }
.phone-link { color: #409EFF; text-decoration: none; }
.phone-link:hover { text-decoration: underline; }

:deep(.el-table) {
  border-radius: 10px; overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06));
}

/* Detail dialog */
.detail-section {
  margin-bottom: 20px; padding-bottom: 16px;
  border-bottom: 1px solid var(--border, #ebeef5);
}
.detail-section:last-of-type { border-bottom: none; }
.detail-row {
  display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
}
.detail-label { font-size: 13px; color: var(--text-muted, #909399); min-width: 100px; }
.detail-value { font-size: 14px; color: var(--text-primary, #303133); }
.detail-message {
  background: var(--bg-secondary, #f5f7fa); padding: 12px 16px; border-radius: 8px;
  font-size: 14px; line-height: 1.6; color: var(--text-primary, #303133);
}

.detail-actions {
  display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;
}
.action-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; font-size: 13px;
  text-decoration: none; color: #fff; transition: opacity 0.2s;
}
.action-btn:hover { opacity: 0.85; }
.action-call { background: #409EFF; }
.action-wa { background: #25d366; }
.action-tg { background: #0088cc; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
  .filter-tabs { overflow-x: auto; flex-wrap: nowrap; }
}
</style>
