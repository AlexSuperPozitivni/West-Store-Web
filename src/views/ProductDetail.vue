<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { useDynamicSeo } from '../lib/useSeo'

const { setSeo } = useDynamicSeo()
import { toColorToken, resolveColorStyle } from '../lib/color'
import { resolveProductState, type ProductVariation } from '../lib/variation'
import iPhoneSection from '../components/iPhoneSection.vue'

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
  sku?: string | null
  price: number
  price_max?: number | string | null
  description: string | null
  specs: Record<string, any> | null
  image_main: string | null
  images: string[] | null
  in_stock?: boolean
  is_preorder?: boolean
  variations?: ProductVariation[]
  is_active: boolean
  category?: { id: number; name: string; slug?: string }
  attributes?: ProductAttribute[]
}

interface AttributeGroup {
  name: string
  type: string
  values: string[]
}

interface Review {
  id: number
  author_name: string
  rating: number
  body: string
  created_at: string
}

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(false)
const specsOpen = ref(false)
const descOpen = ref(false)
const reviewsOpen = ref(true)
const selectedAttributes = ref<Record<string, string>>({})
const selectedImage = ref<string | null>(null)

const reviews = ref<Review[]>([])
const reviewFormOpen = ref(false)
const reviewSubmitting = ref(false)
const reviewSuccess = ref(false)
const reviewForm = ref({ author_name: '', rating: 5, body: '' })

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')

const { addItem, loadCart } = useCart()

const getImageUrl = (path: string | null) => {
  if (!path) return '/placeholder.png'
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}/${path.replace(/^\/storage\//, '')}`
}

const formatSpecValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''

  if (Array.isArray(value)) {
    return value
      .map((item) => formatSpecValue(item))
      .filter(Boolean)
      .join('\n')
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([nestedKey, nestedValue]) => `${nestedKey}: ${formatSpecValue(nestedValue)}`)
      .filter(Boolean)
      .join('\n')
  }

  return String(value)
}

const specEntries = computed(() => {
  if (!product.value?.specs || typeof product.value.specs !== 'object') return []

  return Object.entries(product.value.specs)
    .map(([key, value]) => ({
      key,
      value: formatSpecValue(value).trim()
    }))
    .filter((entry) => entry.value.length > 0)
})

const isColorGroup = (name: string) => {
  const n = name.toLowerCase()
  return n.includes('цвет') || n.includes('color')
}

const attributeGroups = computed<AttributeGroup[]>(() => {
  if (!product.value?.attributes) return []
  const map = new Map<string, AttributeGroup>()

  product.value.attributes.forEach((attr) => {
    const value = attr.pivot?.value
    if (!value) return

    if (!map.has(attr.name)) {
      map.set(attr.name, {
        name: attr.name,
        type: attr.type || 'text',
        values: [value]
      })
      return
    }

    const group = map.get(attr.name)!
    if (!group.values.includes(value)) {
      group.values.push(value)
    }
  })

  return Array.from(map.values())
})

const resolvedState = computed(() => resolveProductState(product.value, selectedAttributes.value))

const colorGroupName = computed(() => {
  return attributeGroups.value.find(g => isColorGroup(g.name))?.name || null
})

const colorThumbs = computed(() => {
  if (!product.value?.variations || !colorGroupName.value) return []
  const seen = new Map<string, string>()
  for (const v of product.value.variations) {
    const colorVal = v.attributes?.[colorGroupName.value]
    if (colorVal && v.image && !seen.has(colorVal)) {
      seen.set(colorVal, v.image)
    }
  }
  return Array.from(seen.entries()).map(([color, image]) => ({ color, image }))
})

const chooseAttribute = (name: string, value: string) => {
  selectedAttributes.value[name] = value
  const variationImage = resolvedState.value.variation?.image
  if (variationImage) {
    selectedImage.value = variationImage
  }
}

const selectColorThumb = (color: string, image: string) => {
  if (colorGroupName.value) {
    selectedAttributes.value[colorGroupName.value] = color
  }
  selectedImage.value = image
}

const handleAddToCart = () => {
  if (!product.value) return
  if (!resolvedState.value.canBuy) return

  const attrs = Object.values(selectedAttributes.value).filter(Boolean)
  const imageForCart = resolvedState.value.variation?.image || selectedImage.value || product.value.image_main || ''

  addItem({
    id: product.value.id,
    slug: product.value.slug,
    name: product.value.name,
    price: Number(resolvedState.value.price),
    qty: 1,
    image: imageForCart,
    attrs
  })

  ElMessage.success(resolvedState.value.isPreorder && !resolvedState.value.inStock ? 'Предзаказ оформлен' : 'Добавлено в корзину')
}

const fetchProduct = async () => {
  loading.value = true
  try {
    const slug = route.params.slug as string
    const res = await api.get(`/products/${slug}`)
    product.value = res.data
    if (product.value) {
      setSeo({
        title: product.value.name,
        description: `${product.value.name} — купить в WEST-STORE за ${Number(product.value.price).toLocaleString('ru-RU')} ₽. Доставка по Москве.`,
      })
    }
    selectedAttributes.value = {}

    const first = product.value?.image_main || product.value?.images?.[0] || null
    selectedImage.value = first

    const groups = attributeGroups.value
    groups.forEach((group) => {
      if (!selectedAttributes.value[group.name]) {
        selectedAttributes.value[group.name] = group.values[0]
      }
    })

    fetchReviews()
  } catch (e) {
    console.error('Failed to load product:', e)
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  if (!product.value) return
  try {
    const res = await api.get(`/reviews/${product.value.id}`)
    reviews.value = res.data || []
  } catch (e) {
    console.error('Failed to load reviews:', e)
  }
}

const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / reviews.value.length) * 10) / 10
})

const submitReview = async () => {
  if (!product.value || reviewSubmitting.value) return
  const { author_name, rating, body } = reviewForm.value
  if (!author_name.trim() || !body.trim()) return

  reviewSubmitting.value = true
  try {
    await api.post('/reviews', {
      product_id: product.value.id,
      author_name: author_name.trim(),
      rating,
      body: body.trim()
    })
    reviewSuccess.value = true
    reviewForm.value = { author_name: '', rating: 5, body: '' }
    reviewFormOpen.value = false
    setTimeout(() => { reviewSuccess.value = false }, 5000)
  } catch (e) {
    console.error('Failed to submit review:', e)
    ElMessage.error('Не удалось отправить отзыв')
  } finally {
    reviewSubmitting.value = false
  }
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
  loadCart()
  fetchProduct()
})

watch(() => route.params.slug, () => {
  fetchProduct()
})
</script>

<template>
  <div class="product-page" v-loading="loading">
    <div v-if="product" class="container">
      <div class="breadcrumb">
        <RouterLink to="/">Главная</RouterLink>
        <span>›</span>
        <RouterLink to="/catalog">Каталог</RouterLink>
        <span>›</span>
        <span>{{ product.name }}</span>
      </div>

      <div class="product-card">
        <div class="gallery">
          <div class="main-image">
            <img :src="getImageUrl(selectedImage || product.image_main)" :alt="product.name" />
          </div>
          <div v-if="colorThumbs.length > 1" class="thumbs">
            <button
              v-for="thumb in colorThumbs"
              :key="thumb.color"
              :class="['thumb', { active: selectedAttributes[colorGroupName!] === thumb.color }]"
              @click="selectColorThumb(thumb.color, thumb.image)"
              type="button"
              :title="thumb.color"
            >
              <img :src="getImageUrl(thumb.image)" :alt="thumb.color" />
            </button>
          </div>
        </div>

        <div class="details">
          <h1 class="title">{{ product.name }}</h1>
          <div v-for="group in attributeGroups" :key="group.name" class="attribute-row">
            <div class="attribute-label">{{ group.name }}</div>

            <div v-if="isColorGroup(group.name)" class="color-options" :data-op-palette="product?.slug ? product.slug.replace(/-/g, '_') : ''">
              <div class="variable-items-wrapper" data-attribute_name="attribute_pa_color">
                <button
                  v-for="value in group.values"
                  :key="value"
                  :class="['variable-item', { selected: selectedAttributes[group.name] === value }]"
                  :data-value="toColorToken(value)"
                  @click="chooseAttribute(group.name, value)"
                  type="button"
                  :title="value"
                >
                  <span class="variable-item-contents" :style="resolveColorStyle(value)"></span>
                </button>
              </div>
            </div>

            <div v-else class="pill-options">
              <button
                v-for="value in group.values"
                :key="value"
                :class="['pill', { active: selectedAttributes[group.name] === value }]"
                @click="chooseAttribute(group.name, value)"
                type="button"
              >
                {{ value }}
              </button>
            </div>
          </div>

          <div class="stock-row">
            <span :class="['stock-dot', { 'in-stock': resolvedState.inStock }]">
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <span class="stock-label">{{ resolvedState.inStock ? 'В наличии' : (resolvedState.isPreorder ? 'Предзаказ' : 'Нет в наличии') }}</span>
          </div>

          <button class="add-cart-btn" :disabled="!resolvedState.canBuy" @click="handleAddToCart">
            <span class="btn-price">{{ Number(resolvedState.price).toLocaleString('ru-RU') }} ₽</span>
            <span class="btn-text">{{ resolvedState.isPreorder && !resolvedState.inStock ? 'Оформить предзаказ' : (resolvedState.canBuy ? 'В корзину' : 'Нет в наличии') }}</span>
          </button>

          <div class="sku">Артикул: <span>{{ product.sku || product.slug || product.id }}</span></div>
        </div>
      </div>

      <div class="specs-card">
        <button
          class="specs-header"
          type="button"
          :aria-expanded="specsOpen"
          @click="specsOpen = !specsOpen"
        >
          <span class="specs-title">Характеристики</span>
          <span :class="['chevron', { open: specsOpen }]" aria-hidden="true"></span>
        </button>
        <div :class="['specs-body', { open: specsOpen }]">
          <div v-if="specEntries.length > 0" class="specs-table">
            <div v-for="entry in specEntries" :key="entry.key" class="spec-row">
              <span class="spec-key">{{ entry.key }}</span>
              <span class="spec-value">{{ entry.value }}</span>
            </div>
          </div>
          <div v-else class="specs-empty">Характеристики не указаны</div>
        </div>
      </div>

      <div v-if="product.description" class="specs-card">
        <button
          class="specs-header"
          type="button"
          :aria-expanded="descOpen"
          @click="descOpen = !descOpen"
        >
          <span class="specs-title">Описание</span>
          <span :class="['chevron', { open: descOpen }]" aria-hidden="true"></span>
        </button>
        <div :class="['specs-body', { open: descOpen }]">
          <p class="desc-text">{{ product.description }}</p>
        </div>
      </div>

      <div class="reviews-card">
        <button
          class="specs-header"
          type="button"
          :aria-expanded="reviewsOpen"
          @click="reviewsOpen = !reviewsOpen"
        >
          <span class="specs-title">
            Отзывы
            <span v-if="reviews.length" class="review-count">({{ reviews.length }})</span>
          </span>
          <span :class="['chevron', { open: reviewsOpen }]" aria-hidden="true"></span>
        </button>

        <div :class="['specs-body', { open: reviewsOpen }]">
          <div class="reviews-summary" v-if="reviews.length">
            <div class="avg-rating">
              <span class="avg-number">{{ avgRating }}</span>
              <div class="avg-stars">
                <span v-for="i in 5" :key="i" :class="['star', { filled: i <= Math.round(avgRating) }]">★</span>
              </div>
              <span class="avg-label">{{ reviews.length }} {{ reviews.length === 1 ? 'отзыв' : (reviews.length < 5 ? 'отзыва' : 'отзывов') }}</span>
            </div>
          </div>

          <div v-if="reviewSuccess" class="review-success-msg">
            Спасибо за отзыв! Он появится после модерации.
          </div>

          <button v-if="!reviewFormOpen" class="write-review-btn" @click="reviewFormOpen = true">
            Написать отзыв
          </button>

          <div v-if="reviewFormOpen" class="review-form">
            <div class="form-row">
              <input
                v-model="reviewForm.author_name"
                type="text"
                placeholder="Ваше имя"
                class="review-input"
                maxlength="100"
              />
            </div>
            <div class="form-row">
              <span class="form-label">Оценка</span>
              <div class="star-picker">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  :class="['star-btn', { active: i <= reviewForm.rating }]"
                  @click="reviewForm.rating = i"
                >★</button>
              </div>
            </div>
            <div class="form-row">
              <textarea
                v-model="reviewForm.body"
                placeholder="Ваш отзыв..."
                class="review-textarea"
                maxlength="2000"
                rows="4"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                class="submit-review-btn"
                :disabled="!reviewForm.author_name.trim() || !reviewForm.body.trim() || reviewSubmitting"
                @click="submitReview"
              >
                {{ reviewSubmitting ? 'Отправка...' : 'Отправить' }}
              </button>
              <button class="cancel-review-btn" @click="reviewFormOpen = false">Отмена</button>
            </div>
          </div>

          <div v-if="reviews.length" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="review-author">{{ review.author_name }}</span>
                <div class="review-stars">
                  <span v-for="i in 5" :key="i" :class="['star', { filled: i <= review.rating }]">★</span>
                </div>
                <span class="review-date">{{ formatDate(review.created_at) }}</span>
              </div>
              <p class="review-body">{{ review.body }}</p>
            </div>
          </div>

          <div v-else-if="!reviewFormOpen" class="reviews-empty">
            Отзывов пока нет. Будьте первым!
          </div>
        </div>
      </div>

      <div class="recommendations">
        <iPhoneSection :showInfoCards="false" title="Вас может заинтересовать" />
      </div>
    </div>

    <div v-else-if="!loading" class="not-found">
      <h2>Товар не найден</h2>
      <RouterLink to="/catalog" class="btn-primary">Вернуться в каталог</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  min-height: 100vh;
  padding: 40px 20px 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  color: #909399;
}

.breadcrumb a {
  color: var(--accent-blue);
  text-decoration: none;
}

.product-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  background: transparent;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumb {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: transparent;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
}

.thumb.active {
  border-color: var(--text-dark);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stock-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-dot {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #d1d5db;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-dot.in-stock {
  background: #22c55e;
}

.stock-label {
  font-size: 14px;
  font-weight: 500;
  color: #22c55e;
}

.desc-text {
  color: #4b5563;
  line-height: 1.7;
  padding: 0 50px 10px;
  margin: 0;
}

.attribute-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 16px;
}

.attribute-label {
  color: #9ca3af;
  font-size: 14px;
}

.color-options {
  display: flex;
}

.variable-items-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.variable-item {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: transparent;
  cursor: pointer;
  padding: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.variable-item.selected {
  border-color: var(--text-dark);
  box-shadow: 0 0 0 2px rgba(26, 26, 26, 0.12);
}

.variable-item.selected::after {
  content: "";
  position: absolute;
  left: 50%;
  top: -9px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid var(--text-dark);
}

.variable-item-contents {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #e5e7eb;
}
.pill-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pill {
  padding: 10px 18px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
  font-weight: 500;
  color: #111827;
  transition: all 0.2s;
}

.pill.active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}

.add-cart-btn {
  background: linear-gradient(90deg, #43e0f0 0%, #a855f7 100%);
  color: #fff;
  border: none;
  padding: 18px 28px;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, filter 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-top: 10px;
}

.add-cart-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-price { font-weight: 700; font-size: 22px; }
.btn-text { font-weight: 600; font-size: 16px; }

.sku {
  font-size: 13px;
  color: #9ca3af;
}

.sku span {
  color: #111827;
  font-weight: 600;
}

.specs-card {
  margin-top: 32px;
  background: #fafafa;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.specs-header {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 30px 50px;
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 1.1;
  font-weight: 700;
  color: #0f172a;
}

.specs-title {
  font-size: clamp(30px, 2.8vw, 44px);
  letter-spacing: -0.02em;
}

.chevron {
  width: 24px;
  height: 24px;
  position: relative;
  flex-shrink: 0;
}

.chevron::before,
.chevron::after {
  content: "";
  position: absolute;
  top: 11px;
  width: 12px;
  height: 2px;
  background: #111827;
  transition: transform 0.2s ease;
}

.chevron::before {
  left: 1px;
  transform: rotate(45deg);
}

.chevron::after {
  right: 1px;
  transform: rotate(-45deg);
}

.chevron.open {
  transform: rotate(180deg);
}

.specs-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease-out;
  background: #fafafa;
  border-radius: 0 0 30px 30px;
  clip-path: inset(0 -10px -10px -10px);
}

.specs-body.open {
  max-height: 4000px;
  padding: 0 50px 28px;
}

.specs-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.spec-row {
  display: grid;
  grid-template-columns: minmax(180px, 34%) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  padding: 18px 0;
  border-top: 1px solid #e1e1e1;
}

.spec-key {
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 400;
}

.spec-value {
  color: #111827;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 600;
  white-space: pre-line;
}

.specs-empty {
  color: #9ca3af;
  font-size: 14px;
  padding: 14px 0 6px;
}

.reviews-card {
  margin-top: 32px;
  background: #fafafa;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.review-count {
  font-size: 0.6em;
  color: #9ca3af;
  font-weight: 400;
}

.reviews-summary {
  margin-bottom: 24px;
}

.avg-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avg-number {
  font-size: 36px;
  font-weight: 700;
  color: #111827;
}

.avg-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 20px;
  color: #d1d5db;
}

.star.filled {
  color: #f59e0b;
}

.avg-label {
  font-size: 14px;
  color: #9ca3af;
}

.review-success-msg {
  background: #ecfdf5;
  color: #059669;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}

.write-review-btn {
  padding: 12px 28px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.write-review-btn:hover {
  border-color: #a855f7;
  color: #a855f7;
}

.review-form {
  background: #ffffff;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.review-input {
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  font-size: 15px;
  color: #111827;
  background: #fafafa;
  transition: border-color 0.2s;
}

.review-input:focus {
  outline: none;
  border-color: #a855f7;
}

.review-textarea {
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  font-size: 15px;
  color: #111827;
  background: #fafafa;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.review-textarea:focus {
  outline: none;
  border-color: #a855f7;
}

.star-picker {
  display: flex;
  gap: 4px;
}

.star-btn {
  font-size: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: #d1d5db;
  padding: 0 2px;
  transition: color 0.15s, transform 0.15s;
}

.star-btn.active {
  color: #f59e0b;
}

.star-btn:hover {
  transform: scale(1.2);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.submit-review-btn {
  padding: 12px 28px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(90deg, #43e0f0 0%, #a855f7 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s;
}

.submit-review-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.submit-review-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-review-btn {
  padding: 12px 28px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-review-btn:hover {
  border-color: #111827;
  color: #111827;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 18px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.review-author {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}

.review-stars {
  display: flex;
  gap: 1px;
}

.review-stars .star {
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: #9ca3af;
  margin-left: auto;
}

.review-body {
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
  margin: 0;
}

.reviews-empty {
  color: #9ca3af;
  font-size: 14px;
  padding: 10px 0;
}

.recommendations {
  margin-top: 60px;
}

.not-found {
  text-align: center;
  padding: 100px 20px;
}

.not-found h2 {
  font-size: 24px;
  color: #909399;
  margin-bottom: 30px;
}

.btn-primary {
  display: inline-block;
  padding: 14px 40px;
  background: var(--accent);
  color: #ffffff;
  border-radius: 9999px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

@media (max-width: 900px) {
  .product-card {
    grid-template-columns: 1fr;
  }

  .desc-text {
    padding: 0 16px 10px;
  }

  .specs-header {
    padding: 24px 28px;
  }

  .spec-key {
    font-size: 14px;
  }

  .spec-value {
    font-size: 14px;
  }

  .specs-body.open {
    padding: 0 28px 24px;
  }
}

@media (max-width: 600px) {
  .product-card {
    padding: 24px;
  }

  .attribute-row {
    grid-template-columns: 1fr;
  }

  .add-cart-btn {
    padding: 14px 20px;
  }
  .btn-price { font-size: 18px; }
  .btn-text { font-size: 14px; }

  .reviews-card {
    border-radius: 22px;
  }

  .review-form {
    padding: 16px;
    border-radius: 16px;
  }

  .review-item {
    padding: 16px;
    border-radius: 14px;
  }

  .avg-number {
    font-size: 28px;
  }

  .review-date {
    margin-left: 0;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-review-btn,
  .submit-review-btn {
    width: 100%;
    text-align: center;
  }

  .specs-card {
    border-radius: 22px;
  }

  .specs-header {
    padding: 18px 16px;
  }

  .spec-row {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 12px 0;
  }

  .specs-body.open {
    border-radius: 0 0 22px 22px;
    padding: 0 16px 16px;
    clip-path: none;
    max-height: 6000px;
  }

  .specs-title {
    font-size: 18px;
  }

  .chevron {
    width: 20px;
    height: 20px;
  }

  .chevron::before,
  .chevron::after {
    top: 9px;
    width: 10px;
  }

  .spec-key {
    font-size: 13px;
  }

  .spec-value {
    font-size: 14px;
  }
}
</style>







