<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'
import { useActivityLog } from '../../lib/useActivityLog'

interface Promocode {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order: number
  usage_count: number
  usage_limit: number
  valid_from: string
  valid_until: string
  categories: string[]
  is_active: boolean
}

interface PromocodeForm {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order: number
  usage_limit: number
  valid_from: string
  valid_until: string
  categories: string[]
  is_active: boolean
}

const router = useRouter()
const { log } = useActivityLog()

const promocodes = ref<Promocode[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentId = ref<string | null>(null)

const STORAGE_KEY = 'admin_promocodes'

const categoryOptions = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'mac', label: 'Mac' },
  { value: 'ipad', label: 'iPad' },
  { value: 'watch', label: 'Apple Watch' },
  { value: 'airpods', label: 'AirPods' },
  { value: 'accessories', label: 'Аксессуары' }
]

const defaultForm = (): PromocodeForm => ({
  code: '',
  discount_type: 'percent',
  discount_value: 0,
  min_order: 0,
  usage_limit: 0,
  valid_from: '',
  valid_until: '',
  categories: [],
  is_active: true
})

const form = ref<PromocodeForm>(defaultForm())

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

const demoPromocodes: Promocode[] = [
  { id: '1', code: 'WELCOME10', discount_type: 'percent', discount_value: 10, min_order: 0, usage_count: 87, usage_limit: 0, valid_from: '2026-01-01', valid_until: '2026-12-31', categories: [], is_active: true },
  { id: '2', code: 'IPHONE5000', discount_type: 'fixed', discount_value: 5000, min_order: 50000, usage_count: 23, usage_limit: 50, valid_from: '2026-03-01', valid_until: '2026-06-30', categories: ['iphone'], is_active: true },
  { id: '3', code: 'SUMMER15', discount_type: 'percent', discount_value: 15, min_order: 0, usage_count: 145, usage_limit: 200, valid_from: '2025-06-01', valid_until: '2025-08-31', categories: [], is_active: false },
  { id: '4', code: 'AIRPODS1000', discount_type: 'fixed', discount_value: 1000, min_order: 5000, usage_count: 34, usage_limit: 100, valid_from: '2026-02-01', valid_until: '2026-07-31', categories: ['airpods'], is_active: true },
  { id: '5', code: 'MACBOOK10', discount_type: 'percent', discount_value: 10, min_order: 100000, usage_count: 12, usage_limit: 30, valid_from: '2026-04-01', valid_until: '2026-05-31', categories: ['mac'], is_active: true },
  { id: '6', code: 'SPRING20', discount_type: 'percent', discount_value: 20, min_order: 30000, usage_count: 56, usage_limit: 100, valid_from: '2026-03-01', valid_until: '2026-05-31', categories: [], is_active: true },
  { id: '7', code: 'IPAD3000', discount_type: 'fixed', discount_value: 3000, min_order: 40000, usage_count: 8, usage_limit: 25, valid_from: '2026-04-01', valid_until: '2026-06-30', categories: ['ipad'], is_active: true },
  { id: '8', code: 'WATCH2000', discount_type: 'fixed', discount_value: 2000, min_order: 20000, usage_count: 19, usage_limit: 50, valid_from: '2026-01-15', valid_until: '2026-04-01', categories: ['watch'], is_active: false },
  { id: '9', code: 'VIP25', discount_type: 'percent', discount_value: 25, min_order: 100000, usage_count: 3, usage_limit: 10, valid_from: '2026-04-01', valid_until: '2026-12-31', categories: [], is_active: true },
  { id: '10', code: 'NEWYEAR5000', discount_type: 'fixed', discount_value: 5000, min_order: 50000, usage_count: 200, usage_limit: 200, valid_from: '2025-12-20', valid_until: '2026-01-10', categories: [], is_active: false }
]

const loadFromStorage = (): Promocode[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return []
}

const saveToStorage = (data: Promocode[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const fetchPromocodes = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/promocodes')
    promocodes.value = res.data || []
    saveToStorage(promocodes.value)
  } catch (e: any) {
    if (handleAuthError(e)) return
    const stored = loadFromStorage()
    if (stored.length > 0) {
      promocodes.value = stored
    } else {
      promocodes.value = demoPromocodes
      saveToStorage(demoPromocodes)
    }
  } finally {
    loading.value = false
  }
}

const getStatus = (promo: Promocode): 'active' | 'expired' | 'disabled' => {
  if (!promo.is_active) return 'disabled'
  if (promo.valid_until && new Date(promo.valid_until) < new Date()) return 'expired'
  if (promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit) return 'expired'
  return 'active'
}

const statusLabel = (promo: Promocode): string => {
  const s = getStatus(promo)
  if (s === 'active') return 'Активен'
  if (s === 'expired') return 'Истёк'
  return 'Отключён'
}

const statusType = (promo: Promocode): string => {
  const s = getStatus(promo)
  if (s === 'active') return 'success'
  if (s === 'expired') return 'info'
  return 'danger'
}

// Stats
const activeCount = computed(() => promocodes.value.filter(p => getStatus(p) === 'active').length)
const totalUsage = computed(() => promocodes.value.reduce((sum, p) => sum + p.usage_count, 0))
const avgDiscount = computed(() => {
  const percentCodes = promocodes.value.filter(p => p.discount_type === 'percent')
  if (percentCodes.length === 0) return 0
  return Math.round(percentCodes.reduce((sum, p) => sum + p.discount_value, 0) / percentCodes.length)
})

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  form.value.code = code
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const openCreate = () => {
  isEditMode.value = false
  currentId.value = null
  form.value = defaultForm()
  dialogVisible.value = true
}

const openEdit = (promo: Promocode) => {
  isEditMode.value = true
  currentId.value = promo.id
  form.value = {
    code: promo.code,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    min_order: promo.min_order,
    usage_limit: promo.usage_limit,
    valid_from: promo.valid_from,
    valid_until: promo.valid_until,
    categories: [...promo.categories],
    is_active: promo.is_active
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.value.code.trim()) {
    ElMessage.error('Код промокода обязателен')
    return
  }
  if (form.value.discount_value <= 0) {
    ElMessage.error('Укажите значение скидки')
    return
  }

  try {
    await ensureCsrf()
    if (isEditMode.value && currentId.value) {
      try {
        await api.put(`/admin/promocodes/${currentId.value}`, form.value)
      } catch { /* fallback to local */ }
      const idx = promocodes.value.findIndex(p => p.id === currentId.value)
      if (idx !== -1) {
        promocodes.value[idx] = { ...promocodes.value[idx], ...form.value }
      }
      ElMessage.success('Промокод обновлён')
      log('update', 'Промокод', form.value.code)
    } else {
      const newPromo: Promocode = {
        id: generateId(),
        ...form.value,
        usage_count: 0
      }
      try {
        const res = await api.post('/admin/promocodes', form.value)
        if (res.data?.id) newPromo.id = res.data.id
      } catch { /* fallback to local */ }
      promocodes.value.push(newPromo)
      ElMessage.success('Промокод создан')
      log('create', 'Промокод', form.value.code)
    }
    saveToStorage(promocodes.value)
    dialogVisible.value = false
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка при сохранении')
  }
}

const deletePromocode = async (promo: Promocode) => {
  try {
    await ElMessageBox.confirm(`Удалить промокод "${promo.code}"?`, 'Предупреждение', { type: 'warning' })
    try {
      await ensureCsrf()
      await api.delete(`/admin/promocodes/${promo.id}`)
    } catch { /* fallback to local */ }
    promocodes.value = promocodes.value.filter(p => p.id !== promo.id)
    saveToStorage(promocodes.value)
    ElMessage.success('Промокод удалён')
    log('delete', 'Промокод', promo.code)
  } catch (e: any) {
    if (e === 'cancel') return
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка удаления')
  }
}

const toggleActive = async (promo: Promocode) => {
  try {
    await ensureCsrf()
    try {
      await api.put(`/admin/promocodes/${promo.id}`, { ...promo, is_active: !promo.is_active })
    } catch { /* fallback to local */ }
    promo.is_active = !promo.is_active
    saveToStorage(promocodes.value)
    ElMessage.success(promo.is_active ? 'Промокод активирован' : 'Промокод отключён')
    log('status-change', 'Промокод', `${promo.code} → ${promo.is_active ? 'Активен' : 'Отключён'}`)
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка смены статуса')
  }
}

const formatDiscount = (promo: Promocode): string => {
  if (promo.discount_type === 'percent') return `${promo.discount_value}%`
  return `${promo.discount_value.toLocaleString('ru-RU')} ₽`
}

const formatUsage = (promo: Promocode): string => {
  if (promo.usage_limit === 0) return `${promo.usage_count} / ∞`
  return `${promo.usage_count} / ${promo.usage_limit}`
}

const formatDate = (date: string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}

onMounted(fetchPromocodes)
</script>

<template>
  <div class="promocodes-page">
    <div class="page-header">
      <div class="header-content">
        <h2>Промокоды</h2>
        <span class="subtitle">Управление скидочными промокодами</span>
      </div>
      <el-button class="btn-add" @click="openCreate">
        <el-icon><Plus /></el-icon> Создать промокод
      </el-button>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ activeCount }}</div>
        <div class="stat-label">Активных промокодов</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalUsage }}</div>
        <div class="stat-label">Всего использований</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ avgDiscount }}%</div>
        <div class="stat-label">Средняя скидка</div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper" v-loading="loading">
      <el-table :data="promocodes" style="width: 100%" stripe>
        <el-table-column label="Код" min-width="140">
          <template #default="{ row }">
            <span class="promo-code">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Тип" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="row.discount_type === 'percent' ? '' : 'warning'" effect="plain">
              {{ row.discount_type === 'percent' ? 'Процент' : 'Фикс. ₽' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Скидка" width="110">
          <template #default="{ row }">
            <span class="discount-value">{{ formatDiscount(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Мин. заказ" width="120">
          <template #default="{ row }">
            {{ row.min_order > 0 ? row.min_order.toLocaleString('ru-RU') + ' ₽' : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="Использований" width="140">
          <template #default="{ row }">
            {{ formatUsage(row) }}
          </template>
        </el-table-column>
        <el-table-column label="Действует до" width="130">
          <template #default="{ row }">
            {{ formatDate(row.valid_until) }}
          </template>
        </el-table-column>
        <el-table-column label="Статус" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row)" size="small" effect="dark">
              {{ statusLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="180" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button size="small" @click="openEdit(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" :type="row.is_active ? 'warning' : 'success'" @click="toggleActive(row)">
                <el-icon><component :is="row.is_active ? 'VideoPause' : 'VideoPlay'" /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="deletePromocode(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="promocodes.length === 0 && !loading" class="empty-state">
        <el-icon :size="60"><Ticket /></el-icon>
        <p>Нет промокодов</p>
        <el-button type="primary" @click="openCreate">Создать первый промокод</el-button>
      </div>
    </div>

    <!-- Create / Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? 'Редактирование промокода' : 'Новый промокод'" width="600px">
      <el-form :model="form" label-position="top">
        <el-form-item label="Код промокода">
          <div class="code-input-row">
            <el-input v-model="form.code" placeholder="Например: WELCOME10" style="flex:1" />
            <el-button @click="generateCode">Сгенерировать</el-button>
          </div>
        </el-form-item>

        <el-form-item label="Тип скидки">
          <el-radio-group v-model="form.discount_type">
            <el-radio value="percent">Процент</el-radio>
            <el-radio value="fixed">Фиксированная сумма</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="form.discount_type === 'percent' ? 'Скидка (%)' : 'Скидка (₽)'">
              <el-input-number v-model="form.discount_value" :min="0" :max="form.discount_type === 'percent' ? 100 : 999999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Мин. сумма заказа (₽)">
              <el-input-number v-model="form.min_order" :min="0" :step="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Лимит использований (0 = без ограничений)">
          <el-input-number v-model="form.usage_limit" :min="0" style="width: 100%" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Действует с">
              <el-date-picker v-model="form.valid_from" type="date" value-format="YYYY-MM-DD" placeholder="Дата начала" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Действует до">
              <el-date-picker v-model="form.valid_until" type="date" value-format="YYYY-MM-DD" placeholder="Дата окончания" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Ограничение по категориям (необязательно)">
          <el-select v-model="form.categories" multiple placeholder="Все категории" style="width: 100%">
            <el-option v-for="cat in categoryOptions" :key="cat.value" :label="cat.label" :value="cat.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Статус">
          <el-switch v-model="form.is_active" active-text="Активен" inactive-text="Отключён" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditMode ? 'Сохранить' : 'Создать' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.promocodes-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }
.btn-add { background: #409EFF; border: 1px solid #409EFF; color: #fff; padding: 10px 24px; font-size: 13px; border-radius: 6px; }
.btn-add:hover { background: #66b1ff; border-color: #66b1ff; }

/* Stats */
.stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;
}
.stat-card {
  background: var(--card-bg, #ffffff); padding: 20px 24px; border-radius: 10px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06)); text-align: center;
}
.stat-value { font-size: 28px; font-weight: 700; color: #409EFF; }
.stat-label { font-size: 13px; color: var(--text-muted, #909399); margin-top: 4px; }

/* Table */
.table-wrapper {
  background: var(--card-bg, #ffffff); border-radius: 10px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06)); padding: 16px;
}
.promo-code { font-family: 'Courier New', monospace; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; color: var(--text-primary, #303133); }
.discount-value { font-weight: 600; color: #409EFF; }
.table-actions { display: flex; gap: 6px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; color: var(--text-muted, #909399);
}

/* Dialog */
.code-input-row { display: flex; gap: 10px; width: 100%; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
}
</style>
