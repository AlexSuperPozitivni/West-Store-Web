<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'

const router = useRouter()

const media = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const selectedImage = ref<any | null>(null)
const selectedPaths = ref<string[]>([])
const deletingBulk = ref(false)

const selectedCount = computed(() => selectedPaths.value.length)
const hasSelection = computed(() => selectedCount.value > 0)

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : '/api')
const APP_URL = import.meta.env.VITE_APP_URL || API_URL.replace(/\/api\/?$/, '')
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')

const getFileUrl = (item: any) => {
  const source = item?.url || item?.path || ''
  if (!source) return ''
  if (source.startsWith('http://') || source.startsWith('https://')) return source
  if (source.startsWith('/storage/')) return `${APP_URL}${source}`
  const cleanPath = source.replace(/^\/?storage\//, '')
  return `${STORAGE_URL.replace(/\/$/, '')}/${cleanPath}`
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

const isSelected = (path: string) => selectedPaths.value.includes(path)

const clearSelection = () => {
  selectedPaths.value = []
}

const fetchMedia = async () => {
  loading.value = true
  try {
    const res = await api.get('/media')
    media.value = res.data
    selectedPaths.value = selectedPaths.value.filter((path) => media.value.some((item: any) => item.path === path))
  } catch (e: any) {
    if (handleAuthError(e)) return
    console.error('Media error:', e)
    ElMessage.error('Ошибка загрузки медиа')
  } finally {
    loading.value = false
  }
}

const handleUploadSuccess = (res: any) => {
  ElMessage.success('Файл загружен')
  media.value.unshift(res)
  dialogVisible.value = false
}

const handleUploadError = (e: any) => {
  if (handleAuthError(e)) return
  const message = e?.response?.data?.message || 'Ошибка загрузки файла'
  ElMessage.error(message)
}

const openUploadDialog = async () => {
  try {
    await ensureCsrf()
    dialogVisible.value = true
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Не удалось подготовить загрузку файла')
  }
}

const uploadViaApi = async (options: any) => {
  await ensureCsrf()

  const formData = new FormData()
  const fieldName = options?.filename || 'file'
  formData.append(fieldName, options.file)

  if (options?.data && typeof options.data === 'object') {
    Object.entries(options.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
  }

  try {
    const response = await api.post('/media/upload', formData, {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      onUploadProgress: (event) => {
        if (!options?.onProgress || !event.total) return
        const percent = Math.round((event.loaded * 100) / event.total)
        options.onProgress({ percent })
      }
    })

    options?.onSuccess?.(response.data)
    return response
  } catch (e: any) {
    options?.onError?.(e)
    throw e
  }
}

const toggleSelect = (item: any) => {
  selectedImage.value = item
  if (isSelected(item.path)) {
    selectedPaths.value = selectedPaths.value.filter((p) => p !== item.path)
    return
  }
  selectedPaths.value = [...selectedPaths.value, item.path]
}

const openFileLink = (item: any, event?: Event) => {
  event?.stopPropagation()
  const url = getFileUrl(item)
  if (!url) return
  window.open(url, '_blank', 'noopener')
}

const deleteImage = async (item: any, event: Event) => {
  event.stopPropagation()

  try {
    await ElMessageBox.confirm('Удалить этот файл?', 'Предупреждение', { type: 'warning' })
    await ensureCsrf()
    await api.delete(`/media/${encodeURIComponent(item.path)}`)

    media.value = media.value.filter((m) => m.path !== item.path)
    selectedPaths.value = selectedPaths.value.filter((p) => p !== item.path)
    if (selectedImage.value?.path === item.path) {
      selectedImage.value = null
    }

    ElMessage.success('Файл удалён')
  } catch (e: any) {
    if (handleAuthError(e)) return
    if (e !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

const deleteSelected = async () => {
  if (!selectedPaths.value.length) return

  try {
    await ElMessageBox.confirm(
      `Удалить выбранные файлы (${selectedPaths.value.length})?`,
      'Подтверждение',
      { type: 'warning' }
    )

    deletingBulk.value = true
    await ensureCsrf()

    const paths = [...selectedPaths.value]
    const results = await Promise.allSettled(
      paths.map((path) => api.delete(`/media/${encodeURIComponent(path)}`))
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failedCount = results.length - successCount

    if (successCount > 0) {
      media.value = media.value.filter((item) => !paths.includes(item.path))
    }

    if (selectedImage.value?.path && paths.includes(selectedImage.value.path)) {
      selectedImage.value = null
    }

    selectedPaths.value = []

    if (failedCount === 0) {
      ElMessage.success(`Удалено файлов: ${successCount}`)
    } else {
      ElMessage.warning(`Удалено: ${successCount}, ошибок: ${failedCount}`)
    }
  } catch (e: any) {
    if (handleAuthError(e)) return
    if (e !== 'cancel') ElMessage.error('Ошибка массового удаления')
  } finally {
    deletingBulk.value = false
  }
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(async () => {
  await ensureCsrf()
  fetchMedia()
})

defineExpose({ selectedImage })
</script>

<template>
  <div class="media-page">
    <div class="page-header">
      <div class="header-content">
        <h2><el-icon><Folder /></el-icon> Медиа-библиотека</h2>
        <span class="subtitle">Все загруженные файлы</span>
      </div>

      <div class="header-actions">
        <el-button v-if="hasSelection" type="danger" :loading="deletingBulk" @click="deleteSelected">
          Удалить выбранные ({{ selectedCount }})
        </el-button>
        <el-button v-if="hasSelection" @click="clearSelection">Снять выделение</el-button>
        <el-button class="btn-upload" @click="openUploadDialog">Загрузить файл</el-button>
      </div>
    </div>

    <div class="media-grid" v-loading="loading">
      <div
        v-for="item in media"
        :key="item.id"
        :class="['media-item', { 'is-selected': isSelected(item.path) }]"
        @click="toggleSelect(item)"
      >
        <div class="media-preview">
          <el-image :src="getFileUrl(item)" fit="cover" class="media-image">
            <template #error>
              <div class="image-error"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>

          <div class="media-overlay">
            <el-button class="btn-open-overlay" size="small" @click.stop="openFileLink(item, $event)">
              Открыть
            </el-button>
            <el-button class="btn-delete-overlay" type="danger" size="small" @click.stop="deleteImage(item, $event)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="media-info">
          <div class="media-name">{{ item.name }}</div>
          <div class="media-meta">{{ item.mime_type || 'file' }} • {{ formatSize(item.size) }}</div>
          <a :href="getFileUrl(item)" target="_blank" rel="noopener" class="media-link" @click.stop>
            Открыть ссылку
          </a>
        </div>

        <div class="media-check" v-if="isSelected(item.path)">
          <el-icon><CircleCheck /></el-icon>
        </div>
      </div>

      <div v-if="media.length === 0 && !loading" class="empty-state">
        <el-icon :size="60"><Picture /></el-icon>
        <p>Медиа-библиотека пуста</p>
        <el-button type="primary" @click="openUploadDialog">Загрузить файлы</el-button>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="Загрузка файла" width="500px">
      <el-upload
        :http-request="uploadViaApi"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :show-file-list="false"
        drag
        multiple
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          Перетащите файл сюда или <em>кликните для загрузки</em>
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<style scoped>
.media-page {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px 30px;
  background: #ffffff;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.media-item {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.media-item.is-selected {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

.media-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.media-preview {
  position: relative;
  width: 100%;
  height: 160px;
  background: #f5f7fa;
}

.media-image {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #c0c4cc;
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  gap: 6px;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-info {
  padding: 12px;
}

.media-name {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.media-meta {
  font-size: 11px;
  color: #909399;
}

.media-link {
  display: inline-flex;
  margin-top: 6px;
  font-size: 12px;
  color: #409eff;
  text-decoration: none;
}

.media-link:hover {
  text-decoration: underline;
}

.media-check {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>