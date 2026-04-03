<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'

interface ProductAttribute {
  id: number
  name: string
  type: string
  pivot?: {
    value: string
  }
}

interface Product {
  id: number
  name: string
  slug: string
  sku: string | null
  category_id: number | null
  price: number
  description: string | null
  specs: Record<string, any> | null
  image_main: string | null
  images: string[] | null
  is_active: boolean
  category?: { id: number; name: string }
  attributes?: ProductAttribute[]
}

interface ProductForm {
  name: string
  slug: string
  sku: string
  category_id: number | null
  price: number
  description: string
  image_main: string
  images: string[]
  is_active: boolean
  colors: string[]
}

interface SpecRow {
  key: string
  value: string
}

const router = useRouter()

const products = ref<Product[]>([])
const categories = ref<any[]>([])
const media = ref<any[]>([])
const loading = ref(false)
const loadingCategories = ref(false)
const loadingMedia = ref(false)
const dialogVisible = ref(false)
const mediaDialogVisible = ref(false)
const mediaMode = ref<'main' | 'gallery'>('main')
const isEditMode = ref(false)
const currentProductId = ref<number | null>(null)
const specsRows = ref<SpecRow[]>([{ key: '', value: '' }])

const presetColors = [
  'Черный',
  'Белый',
  'Красный',
  'Зеленый',
  'Синий',
  'Серебристый',
  'Золотой',
  'Розовый',
  'Фиолетовый',
  'Оранжевый',
  'Натуральный титан'
]

const form = ref<ProductForm>({
  name: '',
  slug: '',
  sku: '',
  category_id: null,
  price: 0,
  description: '',
  image_main: '',
  images: [],
  is_active: true,
  colors: []
})

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
    ElMessage.error('Требуется вход в админ-панель')
    router.push('/login')
    return true
  }
  return false
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/products')
    products.value = res.data
    return
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки товаров')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const res = await api.get('/admin/categories')
    categories.value = res.data
    return
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Не удалось загрузить категории')
    console.error(e)
  } finally {
    loadingCategories.value = false
  }
}

const fetchMedia = async () => {
  loadingMedia.value = true
  try {
    const res = await api.get('/media')
    media.value = res.data || []
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Не удалось загрузить медиа-библиотеку')
    media.value = []
  } finally {
    loadingMedia.value = false
  }
}

const specsToRows = (specs: Record<string, any> | null | undefined): SpecRow[] => {
  if (!specs || typeof specs !== 'object') {
    return [{ key: '', value: '' }]
  }

  const rows = Object.entries(specs)
    .map(([key, value]) => ({
      key: String(key).trim(),
      value: String(value ?? '').trim()
    }))
    .filter((row) => row.key && row.value)

  return rows.length > 0 ? rows : [{ key: '', value: '' }]
}

const rowsToSpecs = (): Record<string, string> => {
  const payload: Record<string, string> = {}

  specsRows.value.forEach((row) => {
    const key = row.key.trim()
    const value = row.value.trim()
    if (key && value) {
      payload[key] = value
    }
  })

  return payload
}

const extractColors = (attributes?: ProductAttribute[]): string[] => {
  if (!Array.isArray(attributes)) return []

  return attributes
    .filter((attr) => {
      const name = (attr.name || '').toLowerCase()
      return name.includes('цвет') || name.includes('color')
    })
    .map((attr) => (attr.pivot?.value || '').trim())
    .filter((value, index, arr) => !!value && arr.indexOf(value) === index)
}

const openCreateDialog = () => {
  isEditMode.value = false
  currentProductId.value = null
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = async (product: Product) => {
  isEditMode.value = true
  currentProductId.value = product.id

  form.value = {
    name: product.name || '',
    slug: product.slug || '',
    sku: product.sku || '',
    category_id: product.category_id || null,
    price: Number(product.price) || 0,
    description: product.description || '',
    image_main: product.image_main || '',
    images: Array.isArray(product.images) ? product.images : [],
    is_active: product.is_active ?? true,
    colors: extractColors(product.attributes)
  }

  specsRows.value = specsToRows(product.specs)
  dialogVisible.value = true
}

const openMediaLibrary = (mode: 'main' | 'gallery') => {
  mediaMode.value = mode
  mediaDialogVisible.value = true
  fetchMedia()
}

const selectFromMedia = (item: any) => {
  if (mediaMode.value === 'main') {
    form.value.image_main = item.path
    ElMessage.success('Главное изображение выбрано')
  } else {
    if (!form.value.images.includes(item.path)) {
      form.value.images = [...form.value.images, item.path]
      ElMessage.success('Изображение добавлено в галерею')
    } else {
      ElMessage.warning('Это изображение уже в галерее')
    }
  }
  mediaDialogVisible.value = false
}

const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}

const addSpecRow = () => {
  specsRows.value.push({ key: '', value: '' })
}

const removeSpecRow = (index: number) => {
  specsRows.value.splice(index, 1)
  if (specsRows.value.length === 0) {
    specsRows.value.push({ key: '', value: '' })
  }
}

const submitForm = async () => {
  if (!form.value.name.trim()) {
    ElMessage.error('Название обязательно')
    return
  }
  if (!form.value.slug.trim()) {
    ElMessage.error('Slug обязателен')
    return
  }
  if (!form.value.category_id) {
    ElMessage.error('Выберите категорию')
    return
  }
  if (form.value.price <= 0) {
    ElMessage.error('Цена должна быть больше 0')
    return
  }

  try {
    await ensureCsrf()

    const specsPayload = rowsToSpecs()
    const colorsPayload = form.value.colors
      .map((value) => value.trim())
      .filter((value, index, arr) => !!value && arr.indexOf(value) === index)

    const payload = {
      ...form.value,
      specs: Object.keys(specsPayload).length > 0 ? specsPayload : null,
      colors: colorsPayload,
      sku: form.value.sku.trim() || null,
      description: form.value.description.trim() || null
    }

    if (isEditMode.value && currentProductId.value) {
      await api.put(`/products/${currentProductId.value}`, payload)
      ElMessage.success('Товар обновлён')
    } else {
      await api.post('/products', payload)
      ElMessage.success('Товар добавлен')
    }

    dialogVisible.value = false
    resetForm()
    fetchProducts()
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error(e.response?.data?.message || 'Ошибка при сохранении')
  }
}

const deleteProduct = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить товар?', 'Предупреждение')
    await ensureCsrf()
    await api.delete(`/products/${id}`)
    ElMessage.success('Удалено')
    fetchProducts()
  } catch (e: any) {
    if (handleAuthError(e)) return
    if (e !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    slug: '',
    sku: '',
    category_id: null,
    price: 0,
    description: '',
    image_main: '',
    images: [],
    is_active: true,
    colors: []
  }
  specsRows.value = [{ key: '', value: '' }]
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-content">
        <h2>Товары</h2>
        <span class="subtitle">Управление каталогом</span>
      </div>
      <el-button class="btn-add" @click="openCreateDialog">
        <el-icon><Plus /></el-icon> Добавить товар
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="products" v-loading="loading" class="sherlock-table">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="Название" />
        <el-table-column label="Артикул" width="150">
          <template #default="scope">
            <span class="category-text">{{ scope.row.sku || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Категория" width="180">
          <template #default="scope">
            <span class="category-text">{{ scope.row.category?.name || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="Цена" width="120">
          <template #default="scope">
            <span class="price-text">{{ Number(scope.row.price).toLocaleString() }} ?</span>
          </template>
        </el-table-column>
        <el-table-column label="Статус" width="100">
          <template #default="scope">
            <span :class="['status-indicator', scope.row.is_active ? 'active' : 'inactive']">
              {{ scope.row.is_active ? 'Активен' : 'Скрыт' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="200">
          <template #default="scope">
            <el-button class="btn-edit" size="small" @click="openEditDialog(scope.row)">
              Редактировать
            </el-button>
            <el-button class="btn-delete" size="small" type="danger" @click="deleteProduct(scope.row.id)">
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? 'Редактирование товара' : 'Новый товар'"
      width="760px"
    >
      <el-form :model="form" label-position="top" class="product-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Название">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Slug (URL)">
              <el-input v-model="form.slug" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Артикул (SKU)">
              <el-input v-model="form.sku" placeholder="Например: MFXH4" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Цена">
              <el-input-number v-model="form.price" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Категория">
          <el-select v-model="form.category_id" placeholder="Выберите категорию" style="width: 100%" v-loading="loadingCategories">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Описание">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="Цвета товара">
          <el-select
            v-model="form.colors"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Выберите или введите цвета"
            style="width: 100%"
          >
            <el-option
              v-for="color in presetColors"
              :key="color"
              :label="color"
              :value="color"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Характеристики">
          <div class="specs-editor">
            <div v-for="(row, idx) in specsRows" :key="idx" class="spec-row">
              <el-input v-model="row.key" placeholder="Название (например, Память)" />
              <el-input v-model="row.value" placeholder="Значение (например, 256 ГБ)" />
              <el-button type="danger" plain @click="removeSpecRow(idx)">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-button class="btn-add-spec" plain @click="addSpecRow">
              <el-icon><Plus /></el-icon> Добавить характеристику
            </el-button>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Главное изображение">
              <div class="image-upload-area">
                <div v-if="form.image_main" class="image-preview">
                  <el-image :src="getImageUrl(form.image_main)" fit="cover">
                    <template #error>
                      <div class="image-error"><el-icon><Picture /></el-icon></div>
                    </template>
                  </el-image>
                  <el-button class="btn-change" size="small" @click="openMediaLibrary('main')">
                    Изменить
                  </el-button>
                </div>
                <el-button v-else @click="openMediaLibrary('main')">
                  <el-icon><Picture /></el-icon> Выбрать из медиа
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Статус">
              <el-switch v-model="form.is_active" />
              <span class="switch-label">{{ form.is_active ? 'Активен' : 'Скрыт' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Галерея">
          <div class="gallery-area">
            <div class="gallery-grid">
              <div v-for="(img, idx) in form.images" :key="img" class="gallery-item">
                <el-image :src="getImageUrl(img)" fit="cover">
                  <template #error>
                    <div class="image-error"><el-icon><Picture /></el-icon></div>
                  </template>
                </el-image>
                <el-button class="btn-remove" size="small" type="danger" @click="removeImage(idx)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <el-button class="btn-add-gallery" @click="openMediaLibrary('gallery')">
                <el-icon><Plus /></el-icon> Добавить
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Отмена</el-button>
          <el-button type="primary" @click="submitForm">
            {{ isEditMode ? 'Сохранить изменения' : 'Создать' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="mediaDialogVisible" title="Медиа-библиотека" width="900px">
      <div class="media-library-grid" v-loading="loadingMedia">
        <div v-for="item in media" :key="item.id" class="media-item" @click="selectFromMedia(item)">
          <div class="media-preview">
            <el-image :src="getImageUrl(item.path)" fit="cover">
              <template #error>
                <div class="image-error"><el-icon><Picture /></el-icon></div>
              </template>
            </el-image>
          </div>
          <div class="media-name">{{ item.name }}</div>
        </div>
        <div v-if="media.length === 0" class="empty-media">
          <el-empty description="Медиа-библиотека пуста" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.products-page { padding: 20px 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 25px 30px; background: #ffffff; border-left: 4px solid #409EFF; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); border-radius: 8px; }
.header-content h2 { font-size: 24px; color: #303133; font-weight: 500; letter-spacing: 1px; margin: 0; }
.subtitle { font-size: 12px; color: #909399; letter-spacing: 0.5px; margin-top: 5px; display: block; }
.btn-add { background: #409EFF; border: 1px solid #409EFF; color: #ffffff; padding: 10px 24px; font-size: 13px; transition: all 0.3s ease; border-radius: 6px; }
.btn-add:hover { background: #66b1ff; border-color: #66b1ff; }
.table-container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.sherlock-table { background: #ffffff; }
.sherlock-table :deep(.el-table__header th) { background: #f5f7fa; color: #606266; font-size: 12px; font-weight: 500; }
.sherlock-table :deep(.el-table__row:hover) { background: #f5f7fa; }
.category-text { color: #909399; }
.price-text { color: #303133; font-weight: 500; }
.status-indicator { font-size: 12px; padding: 4px 12px; border-radius: 4px; }
.status-indicator.active { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
.status-indicator.inactive { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }
.btn-edit { background: #ffffff; border: 1px solid #409EFF; color: #409EFF; padding: 6px 16px; font-size: 12px; margin-right: 5px; }
.btn-edit:hover { background: #409EFF; color: #ffffff; }
.btn-delete { background: #ffffff; border: 1px solid #f56c6c; color: #f56c6c; padding: 6px 16px; font-size: 12px; }
.btn-delete:hover { background: #f56c6c; color: #ffffff; }
.specs-editor { display: grid; gap: 10px; }
.spec-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; }
.btn-add-spec { width: fit-content; }
.image-upload-area { min-height: 100px; border: 1px dashed #dcdfe6; border-radius: 4px; padding: 15px; display: flex; align-items: center; justify-content: center; }
.image-preview { position: relative; width: 100%; max-width: 200px; }
.image-preview :deep(.el-image) { width: 100%; height: 150px; border-radius: 4px; }
.image-error { display: flex; align-items: center; justify-content: center; height: 150px; color: #c0c4cc; background: #f5f7fa; border-radius: 4px; }
.btn-change { margin-top: 10px; width: 100%; }
.switch-label { margin-left: 12px; font-size: 13px; color: #606266; }
.gallery-area { min-height: 100px; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; }
.gallery-item { position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; border: 1px solid #e4e7ed; }
.gallery-item :deep(.el-image) { width: 100%; height: 100%; }
.btn-remove { position: absolute; top: 4px; right: 4px; padding: 4px; border-radius: 50%; width: 24px; height: 24px; }
.btn-add-gallery { aspect-ratio: 1; border: 2px dashed #dcdfe6; background: #f5f7fa; color: #909399; }
.btn-add-gallery:hover { border-color: #409EFF; color: #409EFF; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
.media-library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; max-height: 500px; overflow-y: auto; }
.empty-media { grid-column: 1 / -1; display: flex; justify-content: center; padding: 40px; }
.media-item { cursor: pointer; border-radius: 4px; overflow: hidden; border: 2px solid transparent; transition: all 0.3s ease; }
.media-item:hover { border-color: #409EFF; transform: translateY(-2px); }
.media-preview { aspect-ratio: 1; background: #f5f7fa; }
.media-preview :deep(.el-image) { width: 100%; height: 100%; }
.media-name { font-size: 12px; color: #606266; padding: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }

@media (max-width: 768px) {
  .spec-row { grid-template-columns: 1fr; }
}
</style>

