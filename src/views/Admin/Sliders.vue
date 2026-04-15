<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'
import { useActivityLog } from '../../lib/useActivityLog'

interface Slider {
  id: number
  title: string
  subtitle: string
  image: string
  link: string
  sort_order: number
  is_active: boolean
}

interface SliderForm {
  title: string
  subtitle: string
  image: string
  link: string
  sort_order: number
  is_active: boolean
}

const router = useRouter()
const { log } = useActivityLog()

const sliders = ref<Slider[]>([])
const media = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const mediaDialogVisible = ref(false)
const isEditMode = ref(false)
const currentSliderId = ref<number | null>(null)
const dragIndex = ref<number | null>(null)

const form = ref<SliderForm>({
  title: '',
  subtitle: '',
  image: '',
  link: '',
  sort_order: 0,
  is_active: true
})

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
    ElMessage.error('Требуется вход в админ-панель')
    router.push('/login')
    return true
  }
  return false
}

const fetchSliders = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/sliders')
    sliders.value = (res.data || []).sort((a: Slider, b: Slider) => a.sort_order - b.sort_order)
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки слайдеров')
  } finally {
    loading.value = false
  }
}

const fetchMedia = async () => {
  try {
    const res = await api.get('/media')
    media.value = res.data || []
  } catch (e: any) {
    if (handleAuthError(e)) return
  }
}

const openCreate = () => {
  isEditMode.value = false
  currentSliderId.value = null
  form.value = { title: '', subtitle: '', image: '', link: '', sort_order: sliders.value.length, is_active: true }
  dialogVisible.value = true
}

const openEdit = (slider: Slider) => {
  isEditMode.value = true
  currentSliderId.value = slider.id
  form.value = {
    title: slider.title || '',
    subtitle: slider.subtitle || '',
    image: slider.image || '',
    link: slider.link || '',
    sort_order: slider.sort_order ?? 0,
    is_active: slider.is_active ?? true
  }
  dialogVisible.value = true
}

const openMediaPicker = () => {
  mediaDialogVisible.value = true
  fetchMedia()
}

const selectImage = (item: any) => {
  form.value.image = item.path
  mediaDialogVisible.value = false
  ElMessage.success('Изображение выбрано')
}

const submitForm = async () => {
  if (!form.value.title.trim()) {
    ElMessage.error('Заголовок обязателен')
    return
  }

  try {
    await ensureCsrf()
    if (isEditMode.value && currentSliderId.value) {
      await api.put(`/admin/sliders/${currentSliderId.value}`, form.value)
      ElMessage.success('Слайдер обновлён')
      log('update', 'Слайдер', form.value.title)
    } else {
      await api.post('/admin/sliders', form.value)
      ElMessage.success('Слайдер добавлен')
      log('create', 'Слайдер', form.value.title)
    }
    dialogVisible.value = false
    fetchSliders()
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error(e.response?.data?.message || 'Ошибка при сохранении')
  }
}

const deleteSlider = async (slider: Slider) => {
  try {
    await ElMessageBox.confirm(`Удалить слайдер "${slider.title}"?`, 'Предупреждение')
    await ensureCsrf()
    await api.delete(`/admin/sliders/${slider.id}`)
    ElMessage.success('Слайдер удалён')
    log('delete', 'Слайдер', slider.title)
    fetchSliders()
  } catch (e: any) {
    if (handleAuthError(e)) return
    if (e !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

const toggleActive = async (slider: Slider) => {
  try {
    await ensureCsrf()
    await api.put(`/admin/sliders/${slider.id}`, { ...slider, is_active: !slider.is_active })
    slider.is_active = !slider.is_active
    ElMessage.success(slider.is_active ? 'Слайдер включён' : 'Слайдер выключен')
    log('status-change', 'Слайдер', `${slider.title} → ${slider.is_active ? 'Вкл' : 'Выкл'}`)
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка смены статуса')
  }
}

// Drag & Drop
const onDragStart = (index: number) => {
  dragIndex.value = index
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onDrop = async (targetIndex: number) => {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return

  const items = [...sliders.value]
  const [moved] = items.splice(dragIndex.value, 1)
  items.splice(targetIndex, 0, moved)

  items.forEach((item, i) => { item.sort_order = i })
  sliders.value = items
  dragIndex.value = null

  try {
    await ensureCsrf()
    const order = items.map((s, i) => ({ id: s.id, sort_order: i }))
    await api.post('/admin/sliders/reorder', { order })
    ElMessage.success('Порядок сохранён')
    log('reorder', 'Слайдеры', `Новый порядок: ${items.map(s => s.title).join(', ')}`)
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.warning('Порядок изменён локально, но не сохранён на сервере')
  }
}

const onDragEnd = () => {
  dragIndex.value = null
}

onMounted(fetchSliders)
</script>

<template>
  <div class="sliders-page">
    <div class="page-header">
      <div class="header-content">
        <h2>Слайдеры</h2>
        <span class="subtitle">Управление баннерами главной страницы</span>
      </div>
      <el-button class="btn-add" @click="openCreate">
        <el-icon><Plus /></el-icon> Добавить слайд
      </el-button>
    </div>

    <div class="sliders-list" v-loading="loading">
      <div v-if="sliders.length === 0 && !loading" class="empty-state">
        <el-icon :size="60"><PictureFilled /></el-icon>
        <p>Нет слайдеров</p>
        <el-button type="primary" @click="openCreate">Создать первый слайд</el-button>
      </div>

      <div
        v-for="(slider, index) in sliders"
        :key="slider.id"
        :class="['slider-card', { dragging: dragIndex === index, inactive: !slider.is_active }]"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover="onDragOver"
        @drop="onDrop(index)"
        @dragend="onDragEnd"
      >
        <div class="drag-handle" title="Перетащите для сортировки">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
        </div>

        <div class="slider-preview">
          <img v-if="slider.image" :src="getImageUrl(slider.image)" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
          <div v-else class="preview-placeholder">
            <el-icon :size="28"><Picture /></el-icon>
          </div>
        </div>

        <div class="slider-info">
          <div class="slider-title">{{ slider.title || 'Без заголовка' }}</div>
          <div class="slider-subtitle" v-if="slider.subtitle">{{ slider.subtitle }}</div>
          <div class="slider-link" v-if="slider.link">{{ slider.link }}</div>
        </div>

        <div class="slider-actions">
          <el-switch
            :model-value="slider.is_active"
            @change="toggleActive(slider)"
            active-text="Вкл"
            inactive-text="Выкл"
            inline-prompt
          />
          <el-button size="small" @click="openEdit(slider)">Редактировать</el-button>
          <el-button size="small" type="danger" @click="deleteSlider(slider)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Form Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? 'Редактирование слайдера' : 'Новый слайдер'" width="600px">
      <el-form :model="form" label-position="top">
        <el-form-item label="Заголовок">
          <el-input v-model="form.title" placeholder="Например: Новый iPhone 16 Pro" />
        </el-form-item>
        <el-form-item label="Подзаголовок">
          <el-input v-model="form.subtitle" placeholder="Дополнительный текст" />
        </el-form-item>
        <el-form-item label="Ссылка">
          <el-input v-model="form.link" placeholder="/catalog/iphone или https://..." />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Порядок">
              <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Статус">
              <el-switch v-model="form.is_active" active-text="Активен" inactive-text="Скрыт" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Изображение баннера">
          <div class="banner-image-area">
            <div v-if="form.image" class="banner-preview">
              <img :src="getImageUrl(form.image)" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
              <el-button size="small" @click="openMediaPicker">Изменить</el-button>
            </div>
            <el-button v-else @click="openMediaPicker">
              <el-icon><Picture /></el-icon> Выбрать из медиа
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditMode ? 'Сохранить' : 'Создать' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Media Picker -->
    <el-dialog v-model="mediaDialogVisible" title="Выберите изображение" width="800px">
      <div class="media-picker-grid">
        <div v-for="item in media" :key="item.id" class="media-pick-item" @click="selectImage(item)">
          <img :src="getImageUrl(item.path)" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
          <div class="media-pick-name">{{ item.name }}</div>
        </div>
        <div v-if="media.length === 0" class="empty-state" style="grid-column: 1/-1;">
          <p>Медиа-библиотека пуста</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.sliders-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 30px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }
.btn-add { background: #409EFF; border: 1px solid #409EFF; color: #fff; padding: 10px 24px; font-size: 13px; border-radius: 6px; }
.btn-add:hover { background: #66b1ff; border-color: #66b1ff; }

.sliders-list { display: flex; flex-direction: column; gap: 12px; }

.slider-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--card-bg, #ffffff); padding: 16px 20px; border-radius: 10px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.06));
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  border: 2px solid transparent;
}
.slider-card.dragging { opacity: 0.5; border-color: #409EFF; }
.slider-card.inactive { opacity: 0.6; }
.slider-card:hover { box-shadow: 0 4px 16px var(--shadow, rgba(0,0,0,0.1)); }

.drag-handle { cursor: grab; color: var(--text-muted, #c0c4cc); flex-shrink: 0; display: flex; align-items: center; }
.drag-handle:active { cursor: grabbing; }

.slider-preview {
  width: 120px; height: 68px; border-radius: 8px; overflow: hidden;
  background: var(--bg-secondary, #f5f7fa); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.slider-preview img { width: 100%; height: 100%; object-fit: cover; }
.preview-placeholder { color: var(--text-muted, #c0c4cc); }

.slider-info { flex: 1; min-width: 0; }
.slider-title { font-size: 15px; font-weight: 600; color: var(--text-primary, #303133); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.slider-subtitle { font-size: 13px; color: var(--text-muted, #909399); margin-top: 2px; }
.slider-link { font-size: 12px; color: #409EFF; margin-top: 2px; }

.slider-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; color: var(--text-muted, #909399);
}

.banner-image-area { min-height: 80px; }
.banner-preview { position: relative; }
.banner-preview img { max-width: 100%; max-height: 200px; border-radius: 8px; display: block; margin-bottom: 10px; }

.media-picker-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px; max-height: 400px; overflow-y: auto;
}
.media-pick-item {
  cursor: pointer; border-radius: 8px; overflow: hidden;
  border: 2px solid transparent; transition: border-color 0.2s, transform 0.2s;
  background: var(--bg-secondary, #f5f7fa);
}
.media-pick-item:hover { border-color: #409EFF; transform: translateY(-2px); }
.media-pick-item img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.media-pick-name { font-size: 11px; color: var(--text-muted, #606266); padding: 6px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
