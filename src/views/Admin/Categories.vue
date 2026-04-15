<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'

const router = useRouter()
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')

const categories = ref<any[]>([])
const mediaItems = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const mediaDialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', slug: '', icon: '', parent_id: null as number | null, is_active: true })

const parentOptions = computed(() => {
  const opts = categories.value.filter(c => !c.parent_id && c.id !== editingId.value)
  return [{ id: null, name: '-- Без родителя --' }, ...opts]
})

const getImageUrl = (path: string | null) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}/${path.replace(/^\/storage\//, '')}`
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

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/categories')
    categories.value = res.data
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки категорий')
  } finally {
    loading.value = false
  }
}

const fetchMedia = async () => {
  try {
    const res = await api.get('/media')
    mediaItems.value = (res.data || []).filter((m: any) => m.is_image)
  } catch { /* ignore */ }
}

const openCreate = () => {
  editingId.value = null
  form.value = { name: '', slug: '', icon: '', parent_id: null, is_active: true }
  dialogVisible.value = true
}

const openEdit = (row: any) => {
  editingId.value = row.id
  form.value = {
    name: row.name,
    slug: row.slug,
    icon: row.icon || '',
    parent_id: row.parent_id || null,
    is_active: row.is_active
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    await ensureCsrf()
    if (editingId.value) {
      await api.put(`/admin/categories/${editingId.value}`, form.value)
      ElMessage.success('Категория обновлена')
    } else {
      await api.post('/admin/categories', form.value)
      ElMessage.success('Категория добавлена')
    }
    dialogVisible.value = false
    fetchCategories()
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка при сохранении')
  }
}

const deleteCategory = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить категорию?', 'Предупреждение')
    await ensureCsrf()
    await api.delete(`/admin/categories/${id}`)
    ElMessage.success('Удалено')
    fetchCategories()
  } catch (e: any) {
    if (handleAuthError(e)) return
    if (e !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

const openMediaPicker = () => {
  fetchMedia()
  mediaDialogVisible.value = true
}

const selectMedia = (item: any) => {
  form.value.icon = item.path
  mediaDialogVisible.value = false
}

const clearIcon = () => {
  form.value.icon = ''
}

const getParentName = (parentId: number | null) => {
  if (!parentId) return '—'
  const parent = categories.value.find(c => c.id === parentId)
  return parent ? parent.name : '—'
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h2>Категории</h2>
      <el-button type="primary" @click="openCreate">Добавить категорию</el-button>
    </div>

    <el-table :data="categories" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="Иконка" width="80">
        <template #default="scope">
          <img v-if="scope.row.icon" :src="getImageUrl(scope.row.icon)" style="width: 40px; height: 40px; object-fit: contain;" />
          <span v-else style="color: #ccc;">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Название" />
      <el-table-column prop="slug" label="Slug" />
      <el-table-column label="Родитель" width="150">
        <template #default="scope">
          {{ getParentName(scope.row.parent_id) }}
        </template>
      </el-table-column>
      <el-table-column label="Статус" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
            {{ scope.row.is_active ? 'Активна' : 'Скрыта' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="180">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">Изменить</el-button>
          <el-button size="small" type="danger" @click="deleteCategory(scope.row.id)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? 'Редактировать категорию' : 'Новая категория'" width="500px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Название">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Slug (URL)">
          <el-input v-model="form.slug" />
        </el-form-item>
        <el-form-item label="Родитель">
          <el-select v-model="form.parent_id" placeholder="Без родителя" clearable style="width: 100%;">
            <el-option
              v-for="opt in parentOptions"
              :key="opt.id ?? 'none'"
              :label="opt.name"
              :value="opt.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Иконка">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img v-if="form.icon" :src="getImageUrl(form.icon)" style="width: 48px; height: 48px; object-fit: contain; border: 1px solid #eee; border-radius: 8px; padding: 4px;" />
            <el-button @click="openMediaPicker">{{ form.icon ? 'Заменить' : 'Выбрать из медиа' }}</el-button>
            <el-button v-if="form.icon" type="danger" plain @click="clearIcon">Убрать</el-button>
          </div>
        </el-form-item>
        <el-form-item label="Статус">
          <el-switch v-model="form.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="submitForm">Сохранить</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="mediaDialogVisible" title="Выбрать иконку" width="700px">
      <div v-if="mediaItems.length === 0" style="text-align: center; padding: 40px; color: #999;">
        Нет загруженных изображений. Загрузите иконки через раздел "Медиа".
      </div>
      <div v-else class="media-grid">
        <div
          v-for="item in mediaItems"
          :key="item.path"
          class="media-item"
          @click="selectMedia(item)"
        >
          <img :src="getImageUrl(item.path)" :alt="item.name" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.media-item {
  aspect-ratio: 1;
  border: 2px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.media-item:hover {
  border-color: #409eff;
}

.media-item img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
