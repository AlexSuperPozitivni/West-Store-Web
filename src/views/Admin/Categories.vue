<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'

const router = useRouter()

const categories = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ name: '', slug: '', parent_id: null, is_active: true })

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
    return
  } catch (e: any) {
    if (handleAuthError(e)) return
    ElMessage.error('Ошибка загрузки категорий')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  try {
    await ensureCsrf()
    await api.post('/admin/categories', form.value)
    ElMessage.success('Категория добавлена')
    dialogVisible.value = false
    form.value = { name: '', slug: '', parent_id: null, is_active: true }
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

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h2>Категории</h2>
      <el-button type="primary" @click="dialogVisible = true">Добавить категорию</el-button>
    </div>

    <el-table :data="categories" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Название" />
      <el-table-column prop="slug" label="Slug" />
      <el-table-column label="Статус" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
            {{ scope.row.is_active ? 'Активна' : 'Скрыта' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="150">
        <template #default="scope">
          <el-button size="small" type="danger" @click="deleteCategory(scope.row.id)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="Новая категория" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="Название">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Slug (URL)">
          <el-input v-model="form.slug" />
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
  </div>
</template>
<style scoped>
.categories-page {
  padding: 10px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

.page-header h2 {
  font-size: 28px;
  color: #303133;
  font-weight: 700;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.el-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.el-button {
  border-radius: 6px;
  font-weight: 500;
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.el-dialog__header {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  padding: 20px;
}

.el-dialog__title {
  color: white;
  font-weight: 600;
}

.el-dialog__headerbtn .el-dialog__close {
  color: white;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>

