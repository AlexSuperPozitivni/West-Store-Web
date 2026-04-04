<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCart } from '../lib/cart'
import { resolveProductState, type ProductVariation } from '../lib/variation'
import { toColorToken, resolveColorStyle } from '../lib/color'

interface ProductAttribute {
  id: number
  name: string
  type: string
  pivot?: { value: string }
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  price_max?: number | string | null
  image_main: string | null
  images?: string[] | null
  in_stock?: boolean
  is_preorder?: boolean
  variations?: ProductVariation[]
  is_active?: boolean
  attributes?: ProductAttribute[]
  category_id?: number
}

interface ChildCategory {
  id: number
  name: string
  slug: string
  parent_id?: number | null
}

interface AttributeGroup {
  name: string
  type: string
  values: string[]
}

const props = withDefaults(defineProps<{
  title: string
  viewAllText: string
  viewAllLink: string
  products: Product[]
  childCategories?: ChildCategory[]
  limit?: number
}>(), {
  limit: 14,
  childCategories: () => []
})

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')
const { addItem } = useCart()

const activeSubSlug = ref<string | null>(null)

const shortName = (cat: ChildCategory) => {
  let name = cat.name
  const prefixes = [props.title + ' ', 'Apple ' + props.title + ' ']
  for (const p of prefixes) {
    if (name.toLowerCase().startsWith(p.toLowerCase())) {
      name = name.slice(p.length)
      break
    }
  }
  return name
}

const visibleProducts = computed(() => {
  if (!activeSubSlug.value || !props.childCategories.length) return props.products
  const sub = props.childCategories.find(c => c.slug === activeSubSlug.value)
  if (!sub) return props.products
  return props.products.filter(p => p.category_id === sub.id)
})

const selectSub = (slug: string | null) => {
  activeSubSlug.value = slug
  nextTick(() => {
    if (trackRef.value) trackRef.value.scrollTo({ left: 0, behavior: 'smooth' })
    checkScroll()
  })
}

const trackRef = ref<HTMLElement | null>(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(true)

const selectedAttributes = ref<Record<number, Record<string, string>>>({})

const checkScroll = () => {
  if (!trackRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = trackRef.value
  canScrollPrev.value = scrollLeft > 0
  canScrollNext.value = scrollLeft < scrollWidth - clientWidth - 10
}

const scrollNext = () => {
  if (!trackRef.value) return
  const itemWidth = trackRef.value.children[0]?.clientWidth || 300
  trackRef.value.scrollBy({ left: itemWidth * 2, behavior: 'smooth' })
}

const scrollPrev = () => {
  if (!trackRef.value) return
  const itemWidth = trackRef.value.children[0]?.clientWidth || 300
  trackRef.value.scrollBy({ left: -(itemWidth * 2), behavior: 'smooth' })
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}/${cleanPath}`
}

const isColorGroup = (name: string) => {
  const n = name.toLowerCase()
  return n.includes('цвет') || n.includes('color')
}

const getAttributeGroups = (product: Product): AttributeGroup[] => {
  if (!product.attributes) return []
  const map = new Map<string, AttributeGroup>()
  product.attributes.forEach((attr) => {
    const value = attr.pivot?.value
    if (!value) return
    if (!map.has(attr.name)) {
      map.set(attr.name, { name: attr.name, type: attr.type || 'text', values: [value] })
    } else {
      const group = map.get(attr.name)!
      if (!group.values.includes(value)) group.values.push(value)
    }
  })
  return Array.from(map.values())
}

const selectAttribute = (productId: number, name: string, value: string) => {
  if (!selectedAttributes.value[productId]) {
    selectedAttributes.value[productId] = {}
  }
  selectedAttributes.value[productId][name] = value
}

const getProductState = (product: Product) => {
  const selected = selectedAttributes.value[product.id] || {}
  return resolveProductState(product, selected)
}

const addToCart = (product: Product) => {
  const state = getProductState(product)
  if (!state.canBuy) return
  const chosen = selectedAttributes.value[product.id] || {}
  const attrs = Object.values(chosen).filter(Boolean)
  
  addItem({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(state.price),
    qty: 1,
    image: state.variation?.image || product.image_main || '',
    attrs
  })
  ElMessage.success('Добавлено в корзину')
}

watch(() => props.products, (items) => {
  items.forEach(product => {
    const groups = getAttributeGroups(product)
    if (!selectedAttributes.value[product.id]) selectedAttributes.value[product.id] = {}
    groups.forEach(group => {
      if (!selectedAttributes.value[product.id][group.name]) {
        selectedAttributes.value[product.id][group.name] = group.values[0]
      }
    })
  })
  nextTick(checkScroll)
}, { immediate: true })

onMounted(() => {
  if (trackRef.value) {
    trackRef.value.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    checkScroll()
  }
})

onUnmounted(() => {
  if (trackRef.value) {
    trackRef.value.removeEventListener('scroll', checkScroll)
  }
  window.removeEventListener('resize', checkScroll)
})
</script>

<template>
  <section class="carousel-section" v-if="products.length > 0">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <div class="header-right">
        <RouterLink :to="viewAllLink" class="view-all-link desktop-only">
          {{ viewAllText }}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </RouterLink>
        <div class="nav-buttons">
          <button class="nav-btn prev" @click="scrollPrev" :disabled="!canScrollPrev">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="nav-btn next" @click="scrollNext" :disabled="!canScrollNext">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="childCategories.length > 1" class="sub-tabs">
      <button
        :class="['sub-tab', { active: !activeSubSlug }]"
        @click="selectSub(null)"
      >
        <svg class="sub-tab-icon" width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="1" y="2" width="11" height="8" rx="1.5" />
          <rect x="16" y="2" width="11" height="8" rx="1.5" />
          <rect x="1" y="13" width="11" height="5" rx="1.5" />
          <rect x="16" y="13" width="11" height="5" rx="1.5" />
        </svg>
        <span>Все</span>
      </button>
      <button
        v-for="sub in childCategories"
        :key="sub.slug"
        :class="['sub-tab', { active: activeSubSlug === sub.slug }]"
        @click="selectSub(sub.slug)"
      >
        <svg class="sub-tab-icon" width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="2" y="1" width="24" height="15" rx="2" />
          <line x1="8" y1="19" x2="20" y2="19" stroke-linecap="round" />
        </svg>
        <span>{{ shortName(sub) }}</span>
      </button>
    </div>

    <div class="carousel-track" ref="trackRef">
      <div class="product-card" v-for="product in visibleProducts.slice(0, limit)" :key="product.id">
        <RouterLink :to="`/product/${product.slug}`" class="product-name" :title="product.name">
          {{ product.name }}
        </RouterLink>

        <RouterLink :to="`/product/${product.slug}`" class="card-image-wrap">
          <img :src="getImageUrl(getProductState(product).variation?.image || product.image_main)" :alt="product.name" class="card-image" loading="lazy">
        </RouterLink>

        <div class="attributes-wrapper">
          <template v-for="group in getAttributeGroups(product)" :key="group.name">
            <div v-if="isColorGroup(group.name)" class="color-options">
              <button
                v-for="val in group.values" :key="val"
                :class="['color-dot', { active: selectedAttributes[product.id]?.[group.name] === val }]"
                @click="selectAttribute(product.id, group.name, val)"
              >
                <span :style="resolveColorStyle(val)"></span>
              </button>
            </div>
            <div v-else class="pill-options">
              <button
                v-for="val in group.values" :key="val"
                :class="['attr-pill', { active: selectedAttributes[product.id]?.[group.name] === val }]"
                @click="selectAttribute(product.id, group.name, val)"
              >
                {{ val }}
              </button>
            </div>
          </template>
        </div>

        <button
          class="add-cart-btn"
          :disabled="!getProductState(product).canBuy"
          @click="addToCart(product)"
        >
          <span class="btn-price">{{ Number(getProductState(product).price).toLocaleString('ru-RU') }} ₽</span>
          <span class="btn-text">{{ getProductState(product).isPreorder && !getProductState(product).inStock ? 'Предзаказ' : (getProductState(product).canBuy ? 'В корзину' : 'Нет в наличии') }}</span>
        </button>
      </div>
    </div>

    <RouterLink :to="viewAllLink" class="view-all-link mobile-only">
      {{ viewAllText }}
    </RouterLink>
  </section>
</template>

<style scoped>
.carousel-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ===== Subcategory tabs ===== */
.sub-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
  background: #f0ece8;
  border-radius: 16px;
  padding: 6px;
  width: fit-content;
  max-width: 100%;
}

.sub-tabs::-webkit-scrollbar {
  display: none;
}

.sub-tab {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.sub-tab:hover {
  color: var(--text-dark);
}

.sub-tab.active {
  background: #fff;
  color: var(--text-dark);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.sub-tab-icon {
  opacity: 0.4;
  transition: opacity 0.15s;
}

.sub-tab.active .sub-tab-icon {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .sub-tabs {
    border-radius: 12px;
    padding: 4px;
  }

  .sub-tab {
    padding: 8px 14px;
    font-size: 11px;
  }

  .sub-tab-icon {
    width: 22px;
    height: 16px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #111;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-blue);
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  border-color: var(--text-dark);
  color: var(--text-dark);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 20px;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.product-card {
  flex: 0 0 300px;
  background: #fff;
  border-radius: 20px;
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  scroll-snap-align: start;
  transition: box-shadow 0.2s;
  overflow: hidden;
}

.product-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.1);
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  text-decoration: none;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
  margin-bottom: 8px;
}

.card-image-wrap {
  aspect-ratio: 1;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.attributes-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  flex: 1;
}

.pill-options {
  display: flex;
  gap: 0;
  flex-wrap: nowrap;
  background: #f0ece8;
  border-radius: 10px;
  padding: 3px;
  overflow-x: auto;
  scrollbar-width: none;
}

.pill-options::-webkit-scrollbar {
  display: none;
}

.attr-pill {
  background: transparent;
  border: 1px solid transparent;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  text-align: center;
  transition: all 0.15s;
}

.attr-pill.active {
  background: #fff;
  border-color: var(--border-color);
  color: var(--text-dark);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.color-options {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.color-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 2px;
  background: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.color-dot span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
}

.color-dot.active {
  border-color: var(--accent-blue);
}

.add-cart-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  width: calc(100% + 40px);
  margin: auto -20px 0;
  padding: 14px 20px;
  border-radius: 0 0 20px 20px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-cart-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-price {
  font-weight: 700;
  font-size: 15px;
}

.btn-text {
  font-weight: 600;
  font-size: 14px;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only {
    display: flex;
    justify-content: center;
    margin-top: 16px;
    background: #ede9e5;
    padding: 12px;
    border-radius: 12px;
  }
  .product-card {
    flex: 0 0 240px;
    padding: 16px 16px 0;
  }

  .add-cart-btn {
    width: calc(100% + 32px);
    margin: auto -16px 0;
    padding: 12px 16px;
    border-radius: 0 0 20px 20px;
  }
}
</style>