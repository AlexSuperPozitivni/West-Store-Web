<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, ensureCsrf } from '../../lib/api'

interface Review {
  id: number
  product_id: number
  author_name: string
  rating: number
  body: string
  is_approved: boolean
  created_at: string
  product?: { id: number; name: string; slug: string }
}

const router = useRouter()
const reviews = ref<Review[]>([])
const loading = ref(false)
const filterTab = ref<'pending' | 'approved' | 'all'>('pending')

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

const fetchReviews = async () => {
  loading.value = true
  try {
    await ensureCsrf()
    const res = await api.get('/admin/reviews')
    reviews.value = res.data || []
  } catch (e: any) {
    if (!handleAuthError(e)) ElMessage.error('Ошибка загрузки отзывов')
  } finally {
    loading.value = false
  }
}

const filteredReviews = computed(() => {
  if (filterTab.value === 'pending') return reviews.value.filter(r => !r.is_approved)
  if (filterTab.value === 'approved') return reviews.value.filter(r => r.is_approved)
  return reviews.value
})

const approveReview = async (id: number) => {
  try {
    await ensureCsrf()
    await api.put(`/admin/reviews/${id}/approve`)
    const review = reviews.value.find(r => r.id === id)
    if (review) review.is_approved = true
    ElMessage.success('Отзыв одобрен')
  } catch (e: any) {
    if (!handleAuthError(e)) ElMessage.error('Ошибка')
  }
}

const deleteReview = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить отзыв?', 'Подтверждение', { type: 'warning' })
    await ensureCsrf()
    await api.delete(`/admin/reviews/${id}`)
    reviews.value = reviews.value.filter(r => r.id !== id)
    ElMessage.success('Удалено')
  } catch (e: any) {
    if (e !== 'cancel' && !handleAuthError(e)) ElMessage.error('Ошибка')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

onMounted(fetchReviews)
</script>

<template>
  <div class="reviews-admin">
    <div class="page-header">
      <h1>Отзывы</h1>
      <span class="pending-count" v-if="reviews.filter(r => !r.is_approved).length">
        {{ reviews.filter(r => !r.is_approved).length }} на модерации
      </span>
    </div>

    <div class="tabs">
      <button :class="['tab', { active: filterTab === 'pending' }]" @click="filterTab = 'pending'">
        На модерации
      </button>
      <button :class="['tab', { active: filterTab === 'approved' }]" @click="filterTab = 'approved'">
        Одобренные
      </button>
      <button :class="['tab', { active: filterTab === 'all' }]" @click="filterTab = 'all'">
        Все
      </button>
    </div>

    <div v-loading="loading" class="review-list">
      <div v-for="review in filteredReviews" :key="review.id" class="review-card">
        <div class="review-top">
          <div>
            <strong>{{ review.author_name }}</strong>
            <span class="review-stars">{{ stars(review.rating) }}</span>
          </div>
          <span class="review-date">{{ formatDate(review.created_at) }}</span>
        </div>
        <div class="review-product" v-if="review.product">
          Товар: <RouterLink :to="`/product/${review.product.slug}`">{{ review.product.name }}</RouterLink>
        </div>
        <p class="review-body">{{ review.body }}</p>
        <div class="review-actions">
          <button v-if="!review.is_approved" class="btn-approve" @click="approveReview(review.id)">
            Одобрить
          </button>
          <span v-else class="status-approved">Одобрен</span>
          <button class="btn-delete" @click="deleteReview(review.id)">Удалить</button>
        </div>
      </div>

      <div v-if="!loading && filteredReviews.length === 0" class="empty">
        Нет отзывов
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-admin {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.pending-count {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #111827;
  color: #ffffff;
  border-color: #111827;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-stars {
  color: #f59e0b;
  margin-left: 10px;
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: #9ca3af;
}

.review-product {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.review-product a {
  color: #3b82f6;
  text-decoration: none;
}

.review-body {
  color: #374151;
  line-height: 1.5;
  margin: 0 0 12px;
}

.review-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-approve {
  padding: 6px 18px;
  border-radius: 999px;
  border: none;
  background: #22c55e;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-approve:hover {
  background: #16a34a;
}

.status-approved {
  font-size: 13px;
  color: #22c55e;
  font-weight: 600;
}

.btn-delete {
  padding: 6px 18px;
  border-radius: 999px;
  border: 1px solid #fca5a5;
  background: #ffffff;
  color: #ef4444;
  font-size: 13px;
  cursor: pointer;
}

.btn-delete:hover {
  background: #fef2f2;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}
</style>
