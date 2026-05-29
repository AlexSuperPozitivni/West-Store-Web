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

const sortOption = ref('default')
const filterInStock = ref(false)
const filterPriceMin = ref<number | null>(null)
const filterPriceMax = ref<number | null>(null)
const filtersOpen = ref(false)

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

const isSizeGroup = (name: string) => {
  const n = name.toLowerCase()
  return n.includes('размер') || n.includes('size') || n.includes('диагональ')
}

const getProductSubtitle = (product: Product): string | null => {
  if (!product.attributes) return null
  for (const attr of product.attributes) {
    if (isSizeGroup(attr.name) && attr.pivot?.value) {
      return attr.pivot.value
    }
  }
  return null
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

const getProductImage = (product: Product) => {
  const state = getProductState(product)
  if (state.variation?.image) return state.variation.image
  return product.image_main
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

  if (filterInStock.value) {
    list = list.filter(p => p.in_stock)
  }

  if (filterPriceMin.value != null && !isNaN(filterPriceMin.value) && filterPriceMin.value > 0) {
    list = list.filter(p => p.price >= filterPriceMin.value!)
  }

  if (filterPriceMax.value != null && !isNaN(filterPriceMax.value) && filterPriceMax.value > 0) {
    list = list.filter(p => p.price <= filterPriceMax.value!)
  }

  if (sortOption.value === 'price-asc') {
    list = [...list].sort((a, b) => a.price - b.price)
  } else if (sortOption.value === 'price-desc') {
    list = [...list].sort((a, b) => b.price - a.price)
  } else if (sortOption.value === 'name') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  } else if (sortOption.value === 'in-stock') {
    list = [...list].sort((a, b) => (b.in_stock ? 1 : 0) - (a.in_stock ? 1 : 0))
  }

  return list
})

const resetFilters = () => {
  sortOption.value = 'default'
  filterInStock.value = false
  filterPriceMin.value = null
  filterPriceMax.value = null
}

const hasActiveFilters = computed(() =>
  filterInStock.value ||
  (filterPriceMin.value !== null && filterPriceMin.value > 0) ||
  (filterPriceMax.value !== null && filterPriceMax.value > 0) ||
  sortOption.value !== 'default'
)

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
    description: `Купить ${name} в WEST-STORE. Лучшие цены в Москве, доставка, гарантия.`
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
            <span>West-Store</span>
          </h1>
        </div>
        <div class="hero-right">
          <p class="hero-title">Чтобы купить {{ currentCategoryName }}, обращайтесь в магазин West-Store!</p>
          <p class="hero-text">
            Мы предлагаем только лучшие условия и выгодные цены.
            Для клиентов West-Store — профессиональные консультации, фирменная гарантия, быстрая доставка.
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

      <div class="filter-bar">
        <button class="filter-toggle" @click="filtersOpen = !filtersOpen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14h6M9 8h6M17 16h6" stroke-linecap="round"/></svg>
          Фильтры
          <span v-if="hasActiveFilters" class="filter-badge"></span>
        </button>

        <div class="sort-wrap">
          <select v-model="sortOption" class="sort-select">
            <option value="default">По умолчанию</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="name">По названию</option>
            <option value="in-stock">По наличию</option>
          </select>
        </div>

        <span class="results-count">{{ visibleProducts.length }} товаров</span>
      </div>

      <Transition name="filters-slide">
        <div v-if="filtersOpen" class="filters-panel">
          <div class="filter-group">
            <span class="filter-label">Цена, ₽</span>
            <div class="price-inputs">
              <input
                v-model.number="filterPriceMin"
                type="number"
                placeholder="От"
                min="0"
                class="price-input"
              />
              <span class="price-dash">—</span>
              <input
                v-model.number="filterPriceMax"
                type="number"
                placeholder="До"
                min="0"
                class="price-input"
              />
            </div>
          </div>

          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filterInStock" class="filter-checkbox" />
              <span class="checkbox-custom"></span>
              Только в наличии
            </label>
          </div>

          <button v-if="hasActiveFilters" class="reset-btn" @click="resetFilters">
            Сбросить фильтры
          </button>
        </div>
      </Transition>

      <div v-loading="loading" class="catalog-list">
        <div v-for="product in visibleProducts" :key="product.id" class="catalog-card">
          <div class="card-media">
            <img :src="getImageUrl(getProductImage(product))" :alt="product.name" loading="lazy" />
          </div>

          <div class="card-info">
            <h2 class="card-title">{{ product.name }}</h2>
            <p v-if="getProductSubtitle(product)" class="product-subtitle">{{ getProductSubtitle(product) }}</p>

            <template v-for="group in getAttributeGroups(product)" :key="group.name">
              <div class="attr-row" v-if="!isSizeGroup(group.name)">
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

            <div class="stock-buy-row">
              <span class="stock-label-inline">{{ getProductState(product).inStock ? 'В наличии' : (getProductState(product).isPreorder ? 'Предзаказ' : 'Нет в наличии') }}</span>
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

            <RouterLink :to="`/product/${product.slug}`" class="card-more">Подробнее</RouterLink>
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
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 28px;
}

.hero-left h1 {
  font-size: 28px;
  line-height: 1.25;
  font-weight: 700;
  color: #111827;
}

.hero-left span {
  color: var(--accent-blue);
}

.hero-right {
  background: #ffffff;
  padding: 18px 22px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  flex: 1;
  max-width: 500px;
}

.hero-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #111827;
  font-size: 14px;
}

.hero-text {
  color: #6b7280;
  line-height: 1.55;
  font-size: 13px;
}

.category-tabs {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #b6bfcb transparent;
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  background: #ececee;
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
  background: #f0f0f2;
  border-radius: 28px;
  padding: 40px;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 40px;
  transition: box-shadow 0.2s;
}

.catalog-card:hover {
  box-shadow: var(--shadow-lg);
}

.card-media {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-media img {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1;
  object-fit: contain;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.card-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #111827;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.stock-buy-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.stock-label-inline {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.add-cart-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 14px 28px;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex: 1;
  max-width: 400px;
}

.add-cart-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-price { font-weight: 700; font-size: 16px; }
.btn-text { font-weight: 600; font-size: 14px; }

.card-more {
  color: var(--accent-blue);
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  width: fit-content;
}

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

.product-subtitle {
  font-size: 13px;
  color: #888;
  margin: 2px 0 6px;
}

.pill-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: #ececee;
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


.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.filter-toggle:hover {
  border-color: #111827;
}

.filter-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a855f7;
  position: absolute;
  top: 8px;
  right: 10px;
}

.sort-wrap {
  position: relative;
}

.sort-select {
  padding: 10px 36px 10px 16px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  transition: border-color 0.2s;
}

.sort-select:hover {
  border-color: #111827;
}

.results-count {
  font-size: 13px;
  color: #9ca3af;
  margin-left: auto;
}

.filters-slide-enter-active,
.filters-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.filters-slide-enter-from,
.filters-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
}

.filters-slide-enter-to,
.filters-slide-leave-from {
  opacity: 1;
  max-height: 200px;
}

.filters-panel {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 110px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  color: #111827;
  background: #fafafa;
  transition: border-color 0.2s;
}

.price-input:focus {
  outline: none;
  border-color: #a855f7;
}

.price-input::placeholder {
  color: #c0c0c0;
}

.price-dash {
  color: #d1d5db;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  user-select: none;
}

.filter-checkbox {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #d1d5db;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.filter-checkbox:checked + .checkbox-custom {
  background: #a855f7;
  border-color: #a855f7;
}

.filter-checkbox:checked + .checkbox-custom::after {
  content: '';
  width: 6px;
  height: 10px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg) translateY(-1px);
}

.reset-btn {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.reset-btn:hover {
  background: #e5e7eb;
  color: #111827;
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
    padding: 28px;
    gap: 24px;
  }

  .card-media img {
    max-width: 240px;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 10px;
  }

  .catalog-page {
    padding: 12px 0 60px;
  }

  .breadcrumb {
    margin-bottom: 16px;
  }

  .hero-left h1 {
    font-size: 22px;
  }

  .catalog-hero {
    margin-bottom: 20px;
  }

  .hero-right {
    padding: 16px 18px;
    border-radius: 16px;
  }

  .filter-bar {
    gap: 8px;
  }

  .filters-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
    border-radius: 16px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .price-input {
    width: 100%;
    flex: 1;
  }

  .price-inputs {
    width: 100%;
  }

  .reset-btn {
    margin-left: 0;
    width: 100%;
  }

  .results-count {
    display: none;
  }

  .category-tabs {
    overflow-x: auto;
    scrollbar-width: none;
    border-radius: 16px;
    margin-bottom: 20px;
    padding: 6px;
  }

  .tab-pill {
    padding: 8px 14px;
    font-size: 13px;
  }

  .tab-icon {
    width: 24px;
    height: 24px;
  }

  .catalog-list {
    gap: 12px;
  }

  .catalog-card {
    padding: 20px;
    border-radius: 20px;
    gap: 16px;
    background: #f0f0f2;
  }

  .card-media {
    display: flex;
    justify-content: center;
  }

  .card-media img {
    max-width: 200px;
  }

  .card-info {
    gap: 10px;
  }

  .card-title {
    font-size: 20px;
    text-align: center;
  }

  .product-subtitle {
    text-align: center;
  }

  .stock-buy-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .stock-label-inline {
    text-align: center;
  }

  .add-cart-btn {
    width: 100%;
    max-width: none;
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 15px;
  }

  .attr-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .attr-label {
    text-align: center;
  }

  .variable-item {
    width: 26px;
    height: 26px;
  }

  .variable-item-contents {
    width: 16px;
    height: 16px;
  }

  .variable-items-wrapper {
    justify-content: center;
  }

  .pill-options {
    background: #ececee;
    padding: 4px;
    gap: 0;
    border-radius: 12px;
    justify-content: center;
  }

  .pill {
    padding: 8px 14px;
    font-size: 13px;
    border-radius: 10px;
    flex: 1;
    text-align: center;
  }

  .pill.active {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }

  .card-more {
    text-align: center;
    display: block;
  }
}
</style>