<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { useDynamicSeo } from '../lib/useSeo'

const { setSeo } = useDynamicSeo()
import { toColorToken, resolveColorStyle } from '../lib/color'
import { resolveProductState, type ProductVariation } from '../lib/variation'

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
  price: number
  price_max?: number | string | null
  image_main: string | null
  images?: string[] | null
  in_stock?: boolean
  is_preorder?: boolean
  variations?: ProductVariation[]
  is_active: boolean
  category_id?: number
  category?: { id: number; name: string; slug?: string }
  attributes?: ProductAttribute[]
}

interface Category {
  id: number
  name: string
  slug: string
  icon?: string | null
  parent_id?: number | null
  is_active?: boolean
}

interface AttributeGroup {
  name: string
  type: string
  values: string[]
}

const route = useRoute()
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const selectedAttributes = ref<Record<number, Record<string, string>>>({})

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')

const { addItem, loadCart } = useCart()

const currentCategorySlug = computed(() => route.params.slug as string | undefined)

const activeCategory = computed(() => {
  if (!currentCategorySlug.value) return null
  return categories.value.find(c => c.slug === currentCategorySlug.value) || null
})

const parentCategory = computed(() => {
  if (!activeCategory.value) return null
  if (activeCategory.value.parent_id) {
    return categories.value.find(c => c.id === activeCategory.value?.parent_id) || activeCategory.value
  }
  return activeCategory.value
})

const childCategories = computed(() => {
  if (!parentCategory.value) return [] as Category[]
  return categories.value.filter(c => c.parent_id === parentCategory.value?.id)
})

const topCategories = computed(() => categories.value.filter(c => !c.parent_id))

const tabCategories = computed(() => {
  if (parentCategory.value && childCategories.value.length > 0) {
    return childCategories.value
  }
  return topCategories.value
})

const showParentAllTab = computed(() => parentCategory.value && childCategories.value.length > 0)

const allTabLabel = computed(() => {
  if (showParentAllTab.value && parentCategory.value) {
    return `Все ${parentCategory.value.name}`
  }
  return 'Все категории'
})

const allTabLink = computed(() => {
  if (showParentAllTab.value && parentCategory.value) {
    return `/catalog/${parentCategory.value.slug}`
  }
  return '/catalog'
})

const isAllTabActive = computed(() => {
  if (showParentAllTab.value && parentCategory.value) {
    return !currentCategorySlug.value || currentCategorySlug.value === parentCategory.value.slug
  }
  return !currentCategorySlug.value
})

const currentCategoryName = computed(() => {
  if (activeCategory.value) return activeCategory.value.name
  return 'гаджет'
})

const breadcrumbLabel = computed(() => {
  return activeCategory.value?.name || 'Каталог'
})

const getImageUrl = (path: string | null) => {
  if (!path) return '/placeholder.png'
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}/${path.replace(/^\/storage\//, '')}`
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
  const chosen = selectedAttributes.value[product.id] || {}
  const attrs = Object.values(chosen).filter(Boolean)
  const state = getProductState(product)
  if (!state.canBuy) return

  addItem({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(state.price),
    qty: 1,
    image: state.variation?.image || product.image_main || '',
    attrs
  })
}

const visibleProducts = computed(() => {
  let list = products.value.filter((p) => p.is_active)

  if (activeCategory.value) {
    const active = activeCategory.value

    if (!active.parent_id && childCategories.value.length > 0) {
      const ids = new Set(childCategories.value.map(c => c.id))
      ids.add(active.id)
      list = list.filter(p => p.category_id && ids.has(p.category_id))
    } else {
      list = list.filter(p => p.category_id === active.id)
    }
  }

  return list
})

const ensureDefaults = (items: Product[]) => {
  items.forEach((product) => {
    const groups = getAttributeGroups(product)
    if (!selectedAttributes.value[product.id]) {
      selectedAttributes.value[product.id] = {}
    }
    groups.forEach((group) => {
      if (!selectedAttributes.value[product.id][group.name]) {
        selectedAttributes.value[product.id][group.name] = group.values[0]
      }
    })
  })
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await api.get('/products')
    products.value = res.data
  } catch (e) {
    console.error('Failed to load products:', e)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res.data.filter((c: Category) => c.is_active !== false)
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

watch(products, (items) => {
  ensureDefaults(items)
}, { immediate: true })

watch(currentCategoryName, (name) => {
  setSeo({
    title: name !== 'гаджет' ? name : 'Каталог',
    description: `Купить ${name} в ONLYPHONES. Лучшие цены в Москве, доставка, гарантия.`
  })
}, { immediate: true })

onMounted(() => {
  loadCart()
  fetchCategories()
  fetchProducts()
})
</script>

<template>
  <div class="catalog-page">
    <div class="container">
      <div class="breadcrumb">
        <RouterLink to="/">Главная</RouterLink>
        <span>›</span>
        <span>{{ breadcrumbLabel }}</span>
      </div>

      <div class="catalog-hero">
        <div class="hero-left">
          <h1>
            Купи свой {{ currentCategoryName }}
            <br />
            в интернет-магазине
            <br />
            <span>Onlyphones</span>
          </h1>
        </div>
        <div class="hero-right">
          <p class="hero-title">Чтобы купить новый Айфон, обращайтесь в магазин Onlyphones!</p>
          <p class="hero-text">
            Мы специализируемся на устройствах Apple и предлагаем только лучшие условия.
            У нас можно купить Айфон Pro или последний Айфон, и цена будет выгодной!
            Для клиентов Onlyphones — профессиональные консультации, фирменная гарантия, быстрая доставка.
          </p>
        </div>
      </div>

      <div class="category-tabs">
        <RouterLink
          :to="allTabLink"
          :class="['tab-pill', { active: isAllTabActive }]"
        >
          {{ allTabLabel }}
        </RouterLink>
        <RouterLink
          v-for="cat in tabCategories"
          :key="cat.id"
          :to="`/catalog/${cat.slug}`"
          :class="['tab-pill', { active: currentCategorySlug === cat.slug }]"
        >
          <img v-if="cat.icon" :src="getImageUrl(cat.icon)" :alt="cat.name" class="tab-icon" />
          {{ cat.name }}
        </RouterLink>
      </div>

      <div v-loading="loading" class="catalog-list">
        <div v-for="product in visibleProducts" :key="product.id" class="catalog-card">
          <div class="card-media">
            <img :src="getImageUrl(product.image_main)" :alt="product.name" />
            <RouterLink :to="`/product/${product.slug}`" class="card-more">Подробнее</RouterLink>
          </div>

          <div class="card-info">
            <div class="card-head">
              <span :class="['stock-dot', { 'in-stock': getProductState(product).inStock }]" :title="getProductState(product).inStock ? 'В наличии' : 'Нет в наличии'">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <h2 class="card-title">{{ product.name }}</h2>
            </div>

            <template v-for="group in getAttributeGroups(product).slice(0, 2)" :key="group.name">
              <div class="attr-row">
                <div class="attr-label">{{ group.name }}</div>

                <div v-if="isColorGroup(group.name)" class="color-options" :data-op-palette="product.slug ? product.slug.replace(/-/g, '_') : ''">
                  <div class="variable-items-wrapper" data-attribute_name="attribute_pa_color">
                    <button
                      v-for="value in group.values"
                      :key="value"
                      :class="['variable-item', { selected: selectedAttributes[product.id]?.[group.name] === value }]"
                      :data-value="toColorToken(value)"
                      @click="selectAttribute(product.id, group.name, value)"
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
                    :class="['pill', { active: selectedAttributes[product.id]?.[group.name] === value }]"
                    @click="selectAttribute(product.id, group.name, value)"
                    type="button"
                  >
                    {{ value }}
                  </button>
                </div>
              </div>
            </template>

            <button
              class="add-cart-btn"
              type="button"
              :disabled="!getProductState(product).canBuy"
              @click="addToCart(product)"
            >
              <span class="btn-price">{{ Number(getProductState(product).price).toLocaleString('ru-RU') }} ₽</span>
              <span class="btn-text">{{
                getProductState(product).isPreorder && !getProductState(product).inStock
                  ? 'Предзаказ'
                  : (getProductState(product).canBuy ? 'В корзину' : 'Нет в наличии')
              }}</span>
            </button>
          </div>
        </div>

        <div v-if="visibleProducts.length === 0 && !loading" class="empty-state">
          Товары не найдены
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-page {
  min-height: 100vh;
  padding: 20px 0 80px;
  background: var(--bg-main);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.breadcrumb {
  display: flex;
  gap: 10px;
  color: #9ca3af;
  font-size: 13px;
  margin-bottom: 24px;
}

.breadcrumb a {
  color: #111827;
  text-decoration: none;
}

.catalog-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  align-items: start;
  margin-bottom: 32px;
}

.hero-left h1 {
  font-size: 32px;
  line-height: 1.25;
  font-weight: 700;
  color: #111827;
}

.hero-left span {
  color: var(--accent-blue);
}

.hero-right {
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.hero-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #111827;
}

.hero-text {
  color: #4b5563;
  line-height: 1.6;
}

.category-tabs {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #b6bfcb transparent;
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  background: #e8e4e0;
  padding: 10px 10px 14px;
  border-radius: 999px;
  margin-bottom: 32px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.tab-pill {
  flex: 0 0 auto;
  white-space: nowrap;
  padding: 10px 18px;
  border-radius: 999px;
  text-decoration: none;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-pill.active {
  background: #ffffff;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

.tab-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.tab-pill {
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-tabs::-webkit-scrollbar {
  height: 7px;
}

.category-tabs::-webkit-scrollbar-thumb {
  background: #b6bfcb;
  border-radius: 999px;
}

.category-tabs::-webkit-scrollbar-track {
  background: transparent;
}


.catalog-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.catalog-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 28px 32px;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.catalog-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.card-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.card-media img {
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1;
  object-fit: contain;
}

.card-more {
  color: var(--accent-blue);
  font-size: 13px;
  text-decoration: none;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stock-dot {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
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

.card-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.add-cart-btn {
  background: linear-gradient(90deg, #43e0f0 0%, #a855f7 100%);
  color: #fff;
  border: none;
  padding: 16px 24px;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s, filter 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.add-cart-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-price { font-weight: 700; font-size: 16px; }
.btn-text { font-weight: 600; font-size: 14px; }

.attr-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 16px;
}

.attr-label {
  font-size: 13px;
  color: #9ca3af;
}

.color-options {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
}

.variable-items-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  width: max-content;
}

.variable-item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: transparent;
  cursor: pointer;
  padding: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #e5e7eb;
}

.pill-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: #f0ece8;
  padding: 6px;
  border-radius: 16px;
}

.pill {
  padding: 10px 18px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.pill.active {
  border-color: var(--text-dark);
  color: var(--text-dark);
  font-weight: 600;
}


.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

@media (max-width: 1024px) {
  .catalog-hero {
    grid-template-columns: 1fr;
  }

  .catalog-card {
    grid-template-columns: 1fr;
  }

  .card-head {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 12px;
  }

  .hero-left h1 {
    font-size: 24px;
  }

  .category-tabs {
    overflow-x: auto;
    scrollbar-width: none;
    border-radius: 20px;
  }

  .catalog-list {
    gap: 16px;
  }

  .catalog-card {
    padding: 16px;
    border-radius: 18px;
    gap: 16px;
  }

  .card-media img {
    max-width: 180px;
  }

  .card-info {
    gap: 12px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-price {
    font-size: 16px;
  }

  .attr-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .variable-item {
    width: 24px;
    height: 24px;
  }

  .variable-item-contents {
    width: 14px;
    height: 14px;
  }

  .pill-options {
    background: transparent;
    padding: 0;
    gap: 8px;
  }

  .pill {
    padding: 8px 12px;
    font-size: 12px;
  }

  .add-cart-btn {
    padding: 14px 18px;
  }
}
</style>