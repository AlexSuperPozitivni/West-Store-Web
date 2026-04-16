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

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(false)
const specsOpen = ref(true)
const selectedAttributes = ref<Record<string, string>>({})
const selectedImage = ref<string | null>(null)

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

const chooseAttribute = (name: string, value: string) => {
  selectedAttributes.value[name] = value
  const variationImage = resolvedState.value.variation?.image
  if (variationImage) {
    selectedImage.value = variationImage
  }
}

const selectImage = (path: string | null) => {
  selectedImage.value = path
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
        description: `${product.value.name} — купить в ONLYPHONES за ${Number(product.value.price).toLocaleString('ru-RU')} ₽. Доставка по Москве.`,
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
  } catch (e) {
    console.error('Failed to load product:', e)
  } finally {
    loading.value = false
  }
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
          <div v-if="product.images && product.images.length > 0" class="thumbs">
            <button
              v-for="img in [product.image_main, ...(product.images || [])].filter(Boolean)"
              :key="img"
              :class="['thumb', { active: selectedImage === img }]"
              @click="selectImage(img)"
              type="button"
            >
              <img :src="getImageUrl(img)" :alt="product.name" />
            </button>
          </div>
        </div>

        <div class="details">
          <div class="title-row">
            <span :class="['stock-dot', { 'in-stock': resolvedState.inStock }]" :title="resolvedState.inStock ? 'В наличии' : 'Нет в наличии'">
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <h1 class="title">{{ product.name }}</h1>
          </div>
          <p v-if="product.description" class="description">
            {{ product.description }}
          </p>

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
  background: #f7f4f1;
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
  background: #f7f4f1;
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

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
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

.title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.description {
  color: #4b5563;
  line-height: 1.6;
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







