<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'

interface Slide {
  id: number
  title: string
  subtitle?: string | null
  image_desktop: string
  image_mobile?: string | null
  text_color?: string | null
  category_id?: number | null
  link_url?: string | null
  is_active: boolean
  sort_order: number
  category?: { id: number; name: string; slug?: string }
}

const router = useRouter()

const slides = ref<Slide[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const loadingCategories = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentId = ref<number | null>(null)

const form = ref({
  title: '',
  subtitle: '',
  image_desktop: '',
  image_mobile: '',
  text_color: '',
  category_id: null,
  link_url: '',
  is_active: true,
  sort_order: 0
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

const fetchSlides = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/sliders')
    slides.value = res.data
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки слайдов')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const res = await api.get('/admin/categories')
    categories.value = res.data
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки категорий')
  } finally {
    loadingCategories.value = false
  }
}

const openCreate = () => {
  isEditMode.value = false
  currentId.value = null
  form.value = {
    title: '',
    subtitle: '',
    image_desktop: '',
    image_mobile: '',
    text_color: '',
    category_id: null,
    link_url: '',
    is_active: true,
    sort_order: 0
  }
  dialogVisible.value = true
}

const openEdit = (slide: Slide) => {
  isEditMode.value = true
  currentId.value = slide.id
  form.value = {
    title: slide.title,
    subtitle: slide.subtitle || '',
    image_desktop: slide.image_desktop,
    image_mobile: slide.image_mobile || '',
    text_color: slide.text_color || '',
    category_id: slide.category_id || null,
    link_url: slide.link_url || '',
    is_active: slide.is_active,
    sort_order: slide.sort_order || 0
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    await ensureCsrf()
    if (isEditMode.value && currentId.value) {
      await api.put(`/admin/sliders/${currentId.value}`, form.value)
      ElMessage.success('Слайд обновлён')
    } else {
      await api.post('/admin/sliders', form.value)
      ElMessage.success('Слайд добавлен')
    }
    dialogVisible.value = false
    fetchSlides()
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error(e.response?.data?.message || 'Ошибка сохранения')
  }
}

const deleteSlide = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить слайд?', 'Предупреждение')
    await ensureCsrf()
    await api.delete(`/admin/sliders/${id}`)
    ElMessage.success('Удалено')
    fetchSlides()
  } catch (e: any) {
    if (handleAuthError(e)) return
    if (e !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

onMounted(() => {
  fetchSlides()
  fetchCategories()
})
</script>

<template>
  <div class="sliders-page">
    <div class="page-header">
      <div class="header-content">
        <h2>Слайдер</h2>
        <span class="subtitle">Управление контентом главного слайдера</span>
      </div>
      <el-button class="btn-add" @click="openCreate">
        <el-icon><Plus /></el-icon> Добавить слайд
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="slides" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="Заголовок" />
        <el-table-column label="Категория" width="180">
          <template #default="scope">
            <span>{{ scope.row.category?.name || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Статус" width="100">
          <template #default="scope">
            <span :class="['status-indicator', scope.row.is_active ? 'active' : 'inactive']">
              {{ scope.row.is_active ? 'Активен' : 'Скрыт' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="Порядок" width="120" />
        <el-table-column label="Действия" width="200">
          <template #default="scope">
            <el-button class="btn-edit" size="small" @click="openEdit(scope.row)">Редактировать</el-button>
            <el-button class="btn-delete" size="small" type="danger" @click="deleteSlide(scope.row.id)">Удалить</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEditMode ? 'Редактирование слайда' : 'Новый слайд'" width="700px">
      <el-form :model="form" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Заголовок">
              <el-input v-model="form.title" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Подзаголовок">
              <el-input v-model="form.subtitle" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Изображение (desktop)">
              <el-input v-model="form.image_desktop" placeholder="/storage/..." />
              <el-image v-if="form.image_desktop" :src="getImageUrl(form.image_desktop)" fit="cover" style="margin-top: 8px; width: 100%; height: 160px; border-radius: 8px;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Изображение (mobile)">
              <el-input v-model="form.image_mobile" placeholder="/storage/..." />
              <el-image v-if="form.image_mobile" :src="getImageUrl(form.image_mobile)" fit="cover" style="margin-top: 8px; width: 100%; height: 160px; border-radius: 8px;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Категория">
              <el-select v-model="form.category_id" placeholder="Выберите категорию" style="width: 100%" v-loading="loadingCategories">
                <el-option :key="0" label="Без категории" :value="null" />
                <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Цвет текста">
              <el-input v-model="form.text_color" placeholder="#000000 или gradient" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ссылка">
              <el-input v-model="form.link_url" placeholder="/catalog/iphone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Порядок">
              <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Статус">
          <el-switch v-model="form.is_active" />
          <span class="switch-label">{{ form.is_active ? 'Активен' : 'Скрыт' }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Отмена</el-button>
          <el-button type="primary" @click="submitForm">Сохранить</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.sliders-page { padding: 20px 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 25px 30px; background: #ffffff; border-left: 4px solid #409EFF; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); border-radius: 8px; }
.header-content h2 { font-size: 24px; color: #303133; font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: #909399; margin-top: 5px; display: block; }
.btn-add { background: #409EFF; border: 1px solid #409EFF; color: #ffffff; padding: 10px 24px; font-size: 13px; border-radius: 6px; }
.table-container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.status-indicator { font-size: 12px; padding: 4px 12px; border-radius: 4px; }
.status-indicator.active { color: #67c23a; background: rgba(103, 194, 58, 0.1); }
.status-indicator.inactive { color: #f56c6c; background: rgba(245, 108, 108, 0.1); }
.btn-edit { background: #ffffff; border: 1px solid #409EFF; color: #409EFF; padding: 6px 16px; font-size: 12px; margin-right: 5px; }
.btn-delete { background: #ffffff; border: 1px solid #f56c6c; color: #f56c6c; padding: 6px 16px; font-size: 12px; }
.switch-label { margin-left: 12px; font-size: 13px; color: #606266; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
</style>
