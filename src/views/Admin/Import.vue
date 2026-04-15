<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'
import { useActivityLog } from '../../lib/useActivityLog'

const router = useRouter()
const { log } = useActivityLog()

/* ── Data ── */
const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)

/* ── Export ── */
const exportScope = ref<'all' | 'category' | 'active'>('all')
const exportCategory = ref<number | null>(null)

/* ── Import ── */
const importMode = ref<'add' | 'update' | 'both'>('both')
const csvFile = ref<File | null>(null)
const csvPreview = ref<any[]>([])
const csvHeaders = ref<string[]>([])
const csvAllRows = ref<any[]>([])
const csvErrors = ref<{ row: number; message: string }[]>([])
const importStep = ref<'upload' | 'preview' | 'progress' | 'done'>('upload')
const importProgress = ref(0)
const importTotal = ref(0)
const importResults = ref({ added: 0, updated: 0, errors: 0 })
const isDragOver = ref(false)

/* ── Mass Update ── */
const priceMode = ref<'percent' | 'fixed'>('percent')
const priceDirection = ref<'increase' | 'decrease'>('increase')
const priceValue = ref<number>(0)
const statusCategory = ref<number | null>(null)
const statusTarget = ref<boolean>(true)

/* ── Auth ── */
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

/* ── Fetch ── */
const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/products')
    products.value = res.data
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки товаров')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await api.get('/admin/categories')
    categories.value = res.data
  } catch (e: any) {
    if (handleAuthError(e)) return
  }
}

/* ── CSV Helpers ── */
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current.trim())
  return fields
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

/* ── Export ── */
const exportProducts = () => {
  let data = [...products.value]

  if (exportScope.value === 'category' && exportCategory.value) {
    data = data.filter(p => p.category_id === exportCategory.value)
  } else if (exportScope.value === 'active') {
    data = data.filter(p => p.is_active)
  }

  if (data.length === 0) {
    ElMessage.warning('Нет товаров для выгрузки')
    return
  }

  const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Status', 'Description', 'ImageURL']
  const categoryMap = new Map(categories.value.map(c => [c.id, c.name]))

  const lines = [headers.join(',')]
  for (const p of data) {
    const row = [
      String(p.id),
      escapeCsvField(p.name || ''),
      escapeCsvField(p.sku || ''),
      escapeCsvField(categoryMap.get(p.category_id) || p.category?.name || ''),
      String(Number(p.price) || 0),
      p.is_active ? 'active' : 'inactive',
      escapeCsvField(p.description || ''),
      escapeCsvField(p.image_main || '')
    ]
    lines.push(row.join(','))
  }

  const csv = '\uFEFF' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success(`Выгружено ${data.length} товаров`)
  log('export', 'Импорт/Экспорт', `Выгружено ${data.length} товаров`)
}

/* ── Template Download ── */
const downloadTemplate = () => {
  const headers = ['Name', 'SKU', 'Category', 'Price', 'Status', 'Description', 'ImageURL']
  const example = ['iPhone 16 Pro', 'IP16PRO-256', 'iPhone', '129990', 'active', 'Описание товара', '']
  const csv = '\uFEFF' + headers.join(',') + '\n' + example.map(escapeCsvField).join(',')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ── File Handling ── */
const onFileDrop = (e: DragEvent) => {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processFile(file)
  input.value = ''
}

const processFile = (file: File) => {
  if (!file.name.endsWith('.csv')) {
    ElMessage.error('Поддерживаются только CSV файлы')
    return
  }
  csvFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = (e.target?.result as string) || ''
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    if (lines.length < 2) {
      ElMessage.error('Файл пуст или содержит только заголовки')
      return
    }
    csvHeaders.value = parseCsvLine(lines[0])
    const rows: any[] = []
    const errors: { row: number; message: string }[] = []

    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i])
      const obj: Record<string, string> = {}
      csvHeaders.value.forEach((h, idx) => {
        obj[h] = fields[idx] || ''
      })
      rows.push(obj)

      // Validate required fields
      if (!obj['Name']?.trim()) {
        errors.push({ row: i + 1, message: 'Отсутствует название (Name)' })
      }
      const price = Number(obj['Price'])
      if (!obj['Price']?.trim() || isNaN(price) || price <= 0) {
        errors.push({ row: i + 1, message: 'Некорректная цена (Price)' })
      }
    }

    csvAllRows.value = rows
    csvPreview.value = rows.slice(0, 10)
    csvErrors.value = errors
    importStep.value = 'preview'
  }
  reader.readAsText(file, 'UTF-8')
}

const resetImport = () => {
  csvFile.value = null
  csvPreview.value = []
  csvHeaders.value = []
  csvAllRows.value = []
  csvErrors.value = []
  importStep.value = 'upload'
  importProgress.value = 0
  importTotal.value = 0
  importResults.value = { added: 0, updated: 0, errors: 0 }
}

/* ── Run Import ── */
const runImport = async () => {
  if (csvErrors.value.length > 0) {
    try {
      await ElMessageBox.confirm(
        `Обнаружено ${csvErrors.value.length} ошибок. Строки с ошибками будут пропущены. Продолжить?`,
        'Внимание'
      )
    } catch {
      return
    }
  }

  importStep.value = 'progress'
  const rows = csvAllRows.value
  const errorRowNumbers = new Set(csvErrors.value.map(e => e.row))
  const validRows = rows.filter((_, i) => !errorRowNumbers.has(i + 2))

  importTotal.value = validRows.length
  importProgress.value = 0
  importResults.value = { added: 0, updated: 0, errors: 0 }

  const categoryMap = new Map(categories.value.map(c => [c.name.toLowerCase(), c.id]))

  await ensureCsrf()

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i]
    try {
      const catName = (row['Category'] || '').toLowerCase()
      const categoryId = categoryMap.get(catName) || null

      const payload: Record<string, any> = {
        name: row['Name'],
        sku: row['SKU'] || null,
        category_id: categoryId,
        price: Number(row['Price']),
        is_active: (row['Status'] || 'active').toLowerCase() !== 'inactive',
        description: row['Description'] || null,
        image_main: row['ImageURL'] || null,
        slug: row['Name'].toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      }

      // Determine if product exists by SKU
      const existingBySku = payload.sku
        ? products.value.find(p => p.sku && p.sku.toLowerCase() === payload.sku.toLowerCase())
        : null

      if (existingBySku && (importMode.value === 'update' || importMode.value === 'both')) {
        await api.put(`/products/${existingBySku.id}`, { ...existingBySku, ...payload })
        importResults.value.updated++
      } else if (!existingBySku && (importMode.value === 'add' || importMode.value === 'both')) {
        await api.post('/products', payload)
        importResults.value.added++
      }
    } catch {
      importResults.value.errors++
    }
    importProgress.value = i + 1
  }

  importStep.value = 'done'
  log('import', 'Импорт/Экспорт', `Добавлено: ${importResults.value.added}, Обновлено: ${importResults.value.updated}, Ошибок: ${importResults.value.errors}`)
  fetchProducts()
}

const importProgressPercent = computed(() => {
  if (importTotal.value === 0) return 0
  return Math.round((importProgress.value / importTotal.value) * 100)
})

/* ── Mass Price Update ── */
const applyPriceUpdate = async () => {
  if (!priceValue.value || priceValue.value <= 0) {
    ElMessage.warning('Укажите значение больше 0')
    return
  }

  const label = priceMode.value === 'percent'
    ? `${priceDirection.value === 'increase' ? '+' : '-'}${priceValue.value}%`
    : `${priceDirection.value === 'increase' ? '+' : '-'}${priceValue.value} ₽`

  try {
    await ElMessageBox.confirm(
      `Изменить цены всех товаров на ${label}? Это действие нельзя отменить.`,
      'Подтверждение'
    )
  } catch {
    return
  }

  loading.value = true
  await ensureCsrf()
  let updated = 0
  let errors = 0

  for (const product of products.value) {
    try {
      let newPrice = Number(product.price)
      if (priceMode.value === 'percent') {
        const delta = newPrice * (priceValue.value / 100)
        newPrice = priceDirection.value === 'increase' ? newPrice + delta : newPrice - delta
      } else {
        newPrice = priceDirection.value === 'increase'
          ? newPrice + priceValue.value
          : newPrice - priceValue.value
      }
      newPrice = Math.max(0, Math.round(newPrice))

      await api.put(`/products/${product.id}`, { ...product, price: newPrice })
      updated++
    } catch {
      errors++
    }
  }

  loading.value = false
  ElMessage.success(`Цены обновлены: ${updated}, ошибок: ${errors}`)
  log('mass-price', 'Импорт/Экспорт', `Массовое изменение цен: ${label}, обновлено ${updated}`)
  fetchProducts()
}

/* ── Mass Status Update ── */
const applyStatusUpdate = async () => {
  if (!statusCategory.value) {
    ElMessage.warning('Выберите категорию')
    return
  }

  const catName = categories.value.find(c => c.id === statusCategory.value)?.name || ''
  const action = statusTarget.value ? 'Активировать' : 'Деактивировать'

  try {
    await ElMessageBox.confirm(
      `${action} все товары в категории "${catName}"?`,
      'Подтверждение'
    )
  } catch {
    return
  }

  loading.value = true
  await ensureCsrf()
  const targets = products.value.filter(p => p.category_id === statusCategory.value)
  let updated = 0

  for (const product of targets) {
    try {
      await api.put(`/products/${product.id}`, { ...product, is_active: statusTarget.value })
      updated++
    } catch { /* skip */ }
  }

  loading.value = false
  ElMessage.success(`${action}: ${updated} товаров`)
  log('mass-status', 'Импорт/Экспорт', `${action} ${updated} товаров в "${catName}"`)
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<template>
  <div class="import-page">
    <div class="page-header">
      <div class="header-content">
        <h2>Импорт / Экспорт</h2>
        <span class="subtitle">Массовая загрузка и выгрузка товаров</span>
      </div>
    </div>

    <!-- ═══════ EXPORT ═══════ -->
    <div class="section-card">
      <h3 class="section-title">Выгрузка каталога</h3>
      <p class="section-desc">Скачайте текущий каталог товаров в формате CSV</p>

      <div class="export-options">
        <el-radio-group v-model="exportScope" class="export-radio">
          <el-radio value="all">Все товары</el-radio>
          <el-radio value="category">По категории</el-radio>
          <el-radio value="active">Только активные</el-radio>
        </el-radio-group>

        <el-select
          v-if="exportScope === 'category'"
          v-model="exportCategory"
          placeholder="Выберите категорию"
          style="width: 240px; margin-top: 12px"
        >
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </div>

      <el-button type="primary" class="btn-export" @click="exportProducts" :loading="loading">
        Выгрузить каталог
      </el-button>
    </div>

    <!-- ═══════ IMPORT ═══════ -->
    <div class="section-card">
      <h3 class="section-title">Загрузка товаров</h3>
      <p class="section-desc">Загрузите CSV файл для массового добавления или обновления товаров</p>

      <!-- Step: Upload -->
      <div v-if="importStep === 'upload'">
        <div class="import-mode">
          <span class="mode-label">Режим импорта:</span>
          <el-radio-group v-model="importMode">
            <el-radio value="add">Добавить новые</el-radio>
            <el-radio value="update">Обновить существующие</el-radio>
            <el-radio value="both">Добавить и обновить</el-radio>
          </el-radio-group>
        </div>

        <div
          class="upload-zone"
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="onFileDrop"
        >
          <div class="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p class="upload-text">Перетащите CSV файл сюда</p>
          <p class="upload-hint">или</p>
          <label class="upload-btn">
            Выбрать файл
            <input type="file" accept=".csv" @change="onFileSelect" hidden />
          </label>
        </div>

        <div class="template-row">
          <el-button text type="primary" @click="downloadTemplate">
            Скачать шаблон CSV
          </el-button>
        </div>
      </div>

      <!-- Step: Preview -->
      <div v-if="importStep === 'preview'">
        <div class="preview-header">
          <span class="file-name">{{ csvFile?.name }}</span>
          <span class="row-count">{{ csvAllRows.length }} строк</span>
          <el-button size="small" @click="resetImport">Отмена</el-button>
        </div>

        <!-- Errors -->
        <div v-if="csvErrors.length > 0" class="errors-block">
          <h4>Ошибки ({{ csvErrors.length }})</h4>
          <ul>
            <li v-for="err in csvErrors.slice(0, 10)" :key="err.row + err.message">
              Строка {{ err.row }}: {{ err.message }}
            </li>
            <li v-if="csvErrors.length > 10">...и ещё {{ csvErrors.length - 10 }}</li>
          </ul>
        </div>

        <!-- Preview Table -->
        <div class="preview-table-wrap">
          <el-table :data="csvPreview" size="small" class="preview-table" max-height="320">
            <el-table-column v-for="h in csvHeaders" :key="h" :prop="h" :label="h" min-width="120" show-overflow-tooltip />
          </el-table>
          <p v-if="csvAllRows.length > 10" class="preview-note">
            Показаны первые 10 из {{ csvAllRows.length }} строк
          </p>
        </div>

        <div class="import-mode" style="margin-top: 16px">
          <span class="mode-label">Режим:</span>
          <el-radio-group v-model="importMode">
            <el-radio value="add">Добавить новые</el-radio>
            <el-radio value="update">Обновить существующие</el-radio>
            <el-radio value="both">Добавить и обновить</el-radio>
          </el-radio-group>
        </div>

        <el-button type="primary" @click="runImport" style="margin-top: 16px">
          Начать импорт
        </el-button>
      </div>

      <!-- Step: Progress -->
      <div v-if="importStep === 'progress'" class="progress-block">
        <p class="progress-label">Импорт: {{ importProgress }} / {{ importTotal }}</p>
        <el-progress :percentage="importProgressPercent" :stroke-width="18" />
      </div>

      <!-- Step: Done -->
      <div v-if="importStep === 'done'" class="results-block">
        <h4>Импорт завершён</h4>
        <div class="results-grid">
          <div class="result-item result-added">
            <span class="result-number">{{ importResults.added }}</span>
            <span class="result-label">Добавлено</span>
          </div>
          <div class="result-item result-updated">
            <span class="result-number">{{ importResults.updated }}</span>
            <span class="result-label">Обновлено</span>
          </div>
          <div class="result-item result-errors">
            <span class="result-number">{{ importResults.errors }}</span>
            <span class="result-label">Ошибок</span>
          </div>
        </div>
        <el-button @click="resetImport" style="margin-top: 20px">Загрузить ещё</el-button>
      </div>
    </div>

    <!-- ═══════ MASS UPDATE ═══════ -->
    <div class="section-card">
      <h3 class="section-title">Массовые операции</h3>

      <!-- Price Update -->
      <div class="mass-block">
        <h4 class="mass-label">Изменение цен</h4>
        <div class="mass-row">
          <el-radio-group v-model="priceDirection" style="margin-right: 16px">
            <el-radio value="increase">Увеличить</el-radio>
            <el-radio value="decrease">Уменьшить</el-radio>
          </el-radio-group>

          <span class="mass-hint">на</span>

          <el-input-number v-model="priceValue" :min="0" :controls="false" style="width: 120px" />

          <el-radio-group v-model="priceMode">
            <el-radio value="percent">%</el-radio>
            <el-radio value="fixed">₽</el-radio>
          </el-radio-group>

          <el-button type="warning" @click="applyPriceUpdate" :loading="loading">
            Применить
          </el-button>
        </div>
      </div>

      <!-- Status Toggle -->
      <div class="mass-block">
        <h4 class="mass-label">Изменение статуса по категории</h4>
        <div class="mass-row">
          <el-select v-model="statusCategory" placeholder="Категория" style="width: 220px">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>

          <el-radio-group v-model="statusTarget">
            <el-radio :value="true">Активировать</el-radio>
            <el-radio :value="false">Деактивировать</el-radio>
          </el-radio-group>

          <el-button type="warning" @click="applyStatusUpdate" :loading="loading">
            Применить
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-page {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  letter-spacing: 1px;
  margin: 0;
}
.subtitle {
  font-size: 12px;
  color: var(--text-muted, #909399);
  letter-spacing: 0.5px;
  margin-top: 5px;
  display: block;
}

/* Section cards */
.section-card {
  background: var(--card-bg, #ffffff);
  border-radius: 8px;
  padding: 24px 30px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0, 0, 0, 0.08));
}
.section-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  margin: 0 0 4px;
}
.section-desc {
  font-size: 13px;
  color: var(--text-muted, #909399);
  margin: 0 0 20px;
}

/* Export */
.export-options {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}
.export-radio {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.btn-export {
  padding: 10px 28px;
  font-size: 14px;
}

/* Upload zone */
.upload-zone {
  border: 2px dashed var(--border, #dcdfe6);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary, #fafafa);
}
.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #409EFF;
  background: #ecf5ff;
}
.upload-icon {
  color: var(--text-muted, #c0c4cc);
  margin-bottom: 12px;
}
.upload-zone:hover .upload-icon,
.upload-zone.drag-over .upload-icon {
  color: #409EFF;
}
.upload-text {
  font-size: 15px;
  color: var(--text-secondary, #606266);
  margin: 0 0 4px;
}
.upload-hint {
  font-size: 13px;
  color: var(--text-muted, #909399);
  margin: 0 0 12px;
}
.upload-btn {
  display: inline-block;
  padding: 8px 24px;
  background: #409EFF;
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-btn:hover {
  background: #66b1ff;
}

.template-row {
  margin-top: 12px;
  text-align: center;
}

/* Import mode */
.import-mode {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.mode-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #606266);
}

/* Preview */
.preview-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #ecf5ff;
  border-radius: 8px;
}
.file-name {
  font-weight: 500;
  color: #409EFF;
}
.row-count {
  font-size: 13px;
  color: var(--text-muted, #909399);
}
.preview-table-wrap {
  margin-bottom: 12px;
  border: 1px solid var(--border, #ebeef5);
  border-radius: 8px;
  overflow: hidden;
}
.preview-note {
  font-size: 12px;
  color: var(--text-muted, #909399);
  text-align: center;
  padding: 8px;
  margin: 0;
  background: var(--bg-secondary, #f5f7fa);
}

/* Errors */
.errors-block {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 16px;
}
.errors-block h4 {
  color: #f56c6c;
  margin: 0 0 8px;
  font-size: 14px;
}
.errors-block ul {
  margin: 0;
  padding-left: 20px;
}
.errors-block li {
  font-size: 13px;
  color: #f56c6c;
  line-height: 1.6;
}

/* Progress */
.progress-block {
  padding: 30px 0;
  text-align: center;
}
.progress-label {
  font-size: 15px;
  color: var(--text-secondary, #606266);
  margin-bottom: 16px;
}

/* Results */
.results-block {
  text-align: center;
  padding: 20px 0;
}
.results-block h4 {
  font-size: 18px;
  color: var(--text-primary, #303133);
  margin: 0 0 20px;
}
.results-grid {
  display: flex;
  justify-content: center;
  gap: 32px;
}
.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  border-radius: 8px;
  min-width: 100px;
}
.result-number {
  font-size: 28px;
  font-weight: 600;
}
.result-label {
  font-size: 13px;
  margin-top: 4px;
}
.result-added {
  background: rgba(103, 194, 58, 0.1);
}
.result-added .result-number {
  color: #67c23a;
}
.result-added .result-label {
  color: #67c23a;
}
.result-updated {
  background: rgba(64, 158, 255, 0.1);
}
.result-updated .result-number {
  color: #409EFF;
}
.result-updated .result-label {
  color: #409EFF;
}
.result-errors {
  background: rgba(245, 108, 108, 0.1);
}
.result-errors .result-number {
  color: #f56c6c;
}
.result-errors .result-label {
  color: #f56c6c;
}

/* Mass operations */
.mass-block {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border, #ebeef5);
}
.mass-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.mass-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  margin: 0 0 12px;
}
.mass-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.mass-hint {
  font-size: 14px;
  color: var(--text-muted, #909399);
}

/* Responsive */
@media (max-width: 768px) {
  .section-card {
    padding: 16px;
  }
  .mass-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .results-grid {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .import-mode {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
