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
  icon?: string | null
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
  hideSize?: boolean
  sortByPriceDesc?: boolean
  showBanner?: boolean
  subtitlePrefix?: string
}>(), {
  limit: 14,
  childCategories: () => [],
  hideSize: false,
  sortByPriceDesc: false,
  showBanner: false,
  subtitlePrefix: '',
})

const dropdownOpen = ref(false)
const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth <= 768 }

const toggleDropdown = () => { dropdownOpen.value = !dropdownOpen.value }
const closeDropdown = () => { dropdownOpen.value = false }

const activeSubCategory = computed(() => {
  if (!activeSubSlug.value) return null
  return sortedChildCategories.value.find(c => c.slug === activeSubSlug.value) || null
})

const bannerProduct = computed(() => {
  if (!props.showBanner || !props.products.length) return null
  return [...props.products].sort((a, b) => b.price - a.price)[0]
})

const bannerColors = computed(() => {
  if (!bannerProduct.value?.attributes) return []
  const colorGroup = bannerProduct.value.attributes.filter(a => isColorGroup(a.name))
  const seen = new Set<string>()
  return colorGroup.filter(a => {
    const val = a.pivot?.value
    if (!val || seen.has(val)) return false
    seen.add(val)
    return true
  }).map(a => a.pivot!.value)
})

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')
const { addItem } = useCart()

const categoryIcons: Record<string, string> = {
  // iPhone
  iphone: 'M7 1h6a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V3a2 2 0 012-2zm3 15.5a.75.75 0 100 1.5.75.75 0 000-1.5z',
  // Watch
  watch: 'M7.5 3h5A2.5 2.5 0 0115 5.5v9a2.5 2.5 0 01-2.5 2.5h-5A2.5 2.5 0 015 14.5v-9A2.5 2.5 0 017.5 3zM8 1v2m4-2v2M8 17v2m4-2v2',
  // MacBook
  macbook: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v9H3V4zM1 14h18a1 1 0 010 2H1a1 1 0 010-2z',
  // iPad
  ipad: 'M5 1h10a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V3a2 2 0 012-2zm5 15.5a.75.75 0 100 1.5.75.75 0 000-1.5z',
  // AirPods
  airpods: 'M6 3a3 3 0 00-3 3v2a3 3 0 003 3h0V3zm0 8v5a1 1 0 01-2 0v-5h2zM14 3a3 3 0 013 3v2a3 3 0 01-3 3h0V3zm0 8v5a1 1 0 002 0v-5h-2z',
}

const getCategoryIcon = (slug: string): string | null => {
  const title = props.title.toLowerCase()
  if (title.includes('watch')) return categoryIcons.watch
  if (title.includes('macbook') || title.includes('mac')) return categoryIcons.macbook
  if (title.includes('ipad')) return categoryIcons.ipad
  if (title.includes('airpods')) return categoryIcons.airpods
  if (title.includes('iphone')) return categoryIcons.iphone
  return null
}

const activeSubSlug = ref<string | null>(null)
const activeSizeFilter = ref<string | null>(null)

const isSizeGroup = (name: string) => {
  const n = name.toLowerCase()
  return n.includes('размер') || n.includes('size') || n.includes('диагональ')
}

const subFilteredProducts = computed(() => {
  if (!activeSubSlug.value || !sortedChildCategories.value.length) return props.products
  const sub = sortedChildCategories.value.find(c => c.slug === activeSubSlug.value)
  if (!sub) return props.products
  return props.products.filter(p => p.category_id === sub.id)
})

const sizeFilterValues = computed(() => {
  if (!activeSubSlug.value) return []
  const sizes = new Set<string>()
  for (const product of subFilteredProducts.value) {
    if (!product.attributes) continue
    for (const attr of product.attributes) {
      const val = attr.pivot?.value
      if (val && isSizeGroup(attr.name)) {
        sizes.add(val)
      }
    }
  }
  if (sizes.size <= 1) return []
  return Array.from(sizes).sort((a, b) => {
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return a.localeCompare(b)
  })
})

const sizeGroupName = computed(() => {
  for (const product of props.products) {
    if (!product.attributes) continue
    for (const attr of product.attributes) {
      if (isSizeGroup(attr.name)) return attr.name
    }
  }
  return null
})

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

const extractModelNumber = (name: string): number => {
  const short = shortName({ id: 0, name, slug: '' })
  const match = short.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

const sortedChildCategories = computed(() => {
  if (!props.childCategories.length) return []
  return [...props.childCategories].sort((a, b) => {
    const numA = extractModelNumber(a.name)
    const numB = extractModelNumber(b.name)
    // Both have numbers — sort descending (newest first)
    if (numA && numB) {
      if (numA !== numB) return numB - numA
      // Same number — Pro before base
      const aIsPro = /pro|ultra|max/i.test(a.name)
      const bIsPro = /pro|ultra|max/i.test(b.name)
      if (aIsPro !== bIsPro) return aIsPro ? -1 : 1
      return a.name.localeCompare(b.name)
    }
    // Items without numbers (SE, Air, etc.) go to the end
    if (numA && !numB) return -1
    if (!numA && numB) return 1
    return a.name.localeCompare(b.name)
  })
})

const visibleProducts = computed(() => {
  let items = props.products
  if (activeSubSlug.value && sortedChildCategories.value.length) {
    const sub = sortedChildCategories.value.find(c => c.slug === activeSubSlug.value)
    if (sub) items = items.filter(p => p.category_id === sub.id)
  }
  if (!props.hideSize && activeSizeFilter.value && sizeGroupName.value) {
    items = items.filter(p => {
      if (!p.attributes) return false
      return p.attributes.some(attr =>
        isSizeGroup(attr.name) && attr.pivot?.value === activeSizeFilter.value
      )
    })
  }
  if (props.sortByPriceDesc) {
    return [...items].sort((a, b) => b.price - a.price)
  }
  return [...items].sort((a, b) => {
    const getModelInfo = (name: string) => {
      const match = name.match(/(\d+)/)
      const num = match ? parseInt(match[1], 10) : 0
      const lower = name.toLowerCase()
      const isProMax = /pro\s*max/i.test(name)
      const isPro = !isProMax && /\bpro\b/i.test(name)
      const isUltra = /ultra/i.test(name)
      const isPlus = /plus|\+/i.test(name)
      const isAir = /\bair\b/i.test(name)
      const isE = /\d+e\b/i.test(name)
      const isSE = /\bse\b/i.test(name)
      const isMini = /mini/i.test(name)
      // Higher variant = shown first (Pro Max > Pro > Plus > base > Air > e > mini > SE)
      let variant = 3 // base
      if (isProMax) variant = 6
      else if (isUltra) variant = 5
      else if (isPro) variant = 4
      else if (isPlus) variant = 3
      else if (isAir) variant = 2
      else if (isE) variant = 1
      else if (isMini) variant = 0
      else if (isSE) variant = -1
      return { num, variant }
    }
    const ma = getModelInfo(a.name)
    const mb = getModelInfo(b.name)
    // Descending: newest model first (17 Pro Max → 17 Pro → ... → 13)
    if (ma.num !== mb.num) return mb.num - ma.num
    if (ma.variant !== mb.variant) return mb.variant - ma.variant
    return a.name.localeCompare(b.name)
  })
})

const selectSub = (slug: string | null) => {
  activeSubSlug.value = slug
  activeSizeFilter.value = null
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

const getProductSubtitle = (product: Product): string | null => {
  if (!product.attributes) return null
  for (const attr of product.attributes) {
    if (isSizeGroup(attr.name) && attr.pivot?.value) {
      return attr.pivot.value
    }
  }
  return null
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
  checkMobile()
  window.addEventListener('resize', checkMobile)
  if (trackRef.value) {
    trackRef.value.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    checkScroll()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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

    <RouterLink v-if="bannerProduct" :to="`/product/${bannerProduct.slug}`" class="featured-banner">
      <div class="banner-image">
        <img :src="getImageUrl(bannerProduct.image_main)" :alt="bannerProduct.name" />
      </div>
      <div class="banner-info">
        <h3 class="banner-title">{{ bannerProduct.name }}</h3>
        <div v-if="bannerColors.length" class="banner-colors">
          <span v-for="color in bannerColors" :key="color" class="banner-color-dot" :style="resolveColorStyle(color)"></span>
        </div>
        <div class="banner-actions">
          <span class="banner-price">{{ Number(bannerProduct.price).toLocaleString('ru-RU') }} ₽</span>
          <span class="banner-link">Подробнее <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        </div>
      </div>
    </RouterLink>

    <!-- Desktop: tab pills -->
    <div v-if="sortedChildCategories.length > 1" class="sub-tabs-row desktop-sub">
      <div class="sub-tabs">
        <button
          v-for="sub in sortedChildCategories"
          :key="sub.slug"
          :class="['sub-tab', { active: activeSubSlug === sub.slug }]"
          @click="selectSub(sub.slug)"
        >
          <svg v-if="getCategoryIcon(sub.slug)" class="sub-tab-icon-svg" width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="getCategoryIcon(sub.slug)!" />
          </svg>
          <span>{{ shortName(sub) }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile: dropdown selector -->
    <div v-if="sortedChildCategories.length > 1" class="mobile-dropdown-wrap mobile-sub">
      <button class="mobile-dropdown-btn" @click="toggleDropdown">
        <svg v-if="getCategoryIcon('')" class="dropdown-icon-svg" width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path :d="getCategoryIcon('')!" />
        </svg>
        <span class="dropdown-label">{{ activeSubCategory ? shortName(activeSubCategory) : sortedChildCategories[0] ? shortName(sortedChildCategories[0]) : title }}</span>
        <svg class="dropdown-chevron" :class="{ open: dropdownOpen }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <Transition name="sheet-fade">
        <div v-if="dropdownOpen" class="sheet-overlay" @click="closeDropdown"></div>
      </Transition>
      <Transition name="sheet-slide">
        <div v-if="dropdownOpen" class="sheet-panel">
          <button
            v-for="sub in sortedChildCategories"
            :key="sub.slug"
            :class="['sheet-item', { active: activeSubSlug === sub.slug }]"
            @click="selectSub(sub.slug); closeDropdown()"
          >
            <svg v-if="getCategoryIcon(sub.slug)" class="sheet-item-icon" width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="getCategoryIcon(sub.slug)!" />
            </svg>
            <span>{{ shortName(sub) }}</span>
            <svg v-if="activeSubSlug === sub.slug" class="sheet-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </Transition>
    </div>

    <div v-if="!hideSize && sizeFilterValues.length > 0" class="size-filters-row">
      <div class="size-filters">
        <button
          v-for="size in sizeFilterValues"
          :key="size"
          :class="['size-pill', { active: activeSizeFilter === size }]"
          @click="activeSizeFilter = size; nextTick(() => { if (trackRef) trackRef.scrollTo({ left: 0, behavior: 'smooth' }); checkScroll() })"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <div class="carousel-wrapper">
      <div class="carousel-track" ref="trackRef">
        <div class="product-card" v-for="product in visibleProducts.slice(0, limit)" :key="product.id">
          <RouterLink :to="`/product/${product.slug}`" class="card-top-link">
            <h3 class="product-name">{{ product.name }}</h3>
            <p v-if="!hideSize && getProductSubtitle(product)" class="product-subtitle">
              {{ subtitlePrefix ? subtitlePrefix + ' / ' + getProductSubtitle(product) : getProductSubtitle(product) }}
            </p>
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
              <div v-else-if="!isSizeGroup(group.name)" class="pill-options">
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

      <button v-if="canScrollNext" class="carousel-next-float" @click="scrollNext" aria-label="Следующий">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <RouterLink :to="viewAllLink" class="view-all-bottom">
      {{ viewAllText }}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </RouterLink>
  </section>
</template>

<style scoped>
.carousel-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ===== Subcategory tabs (desktop) ===== */
.sub-tabs-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-tabs-row::-webkit-scrollbar { display: none; }

.sub-tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  background: #ececee;
  border-radius: 16px;
  padding: 6px;
  flex-shrink: 0;
}

.sub-tabs::-webkit-scrollbar { display: none; }

.sub-tab {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 18px;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.sub-tab:hover { color: var(--text-dark); }

.sub-tab.active {
  background: #fff;
  color: var(--text-dark);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.sub-tab-icon-svg {
  opacity: 0.4;
  transition: opacity 0.15s;
  display: block;
  flex-shrink: 0;
}

.sub-tab.active .sub-tab-icon-svg {
  opacity: 0.85;
  color: var(--accent-blue, #007aff);
}

/* ===== Size filters ===== */
.size-filters-row { margin-bottom: 20px; }

.size-filters {
  display: inline-flex;
  gap: 0;
  background: #ececee;
  border-radius: 16px;
  padding: 6px;
  flex-shrink: 0;
}

.size-pill {
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.size-pill:hover { color: var(--text-dark); }

.size-pill.active {
  background: #fff;
  color: var(--text-dark);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* ===== Mobile dropdown + bottom sheet ===== */
.mobile-dropdown-wrap { display: none; }

.mobile-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 18px;
  background: #f0f0f2;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
  transition: background 0.15s;
}

.mobile-dropdown-btn:active { background: #eae7e3; }

.dropdown-icon-svg {
  opacity: 0.5;
  flex-shrink: 0;
}

.dropdown-label { flex: 1; text-align: left; }

.dropdown-chevron {
  flex-shrink: 0;
  color: #999;
  transition: transform 0.2s;
}

.dropdown-chevron.open { transform: rotate(180deg); }

.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.sheet-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 12px 8px calc(12px + env(safe-area-inset-bottom));
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 16px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 400;
  color: #333;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.12s;
}

.sheet-item:active { background: #f5f5f5; }

.sheet-item.active {
  color: var(--accent-blue, #2563eb);
  font-weight: 600;
}

.sheet-item-icon {
  opacity: 0.4;
  flex-shrink: 0;
}

.sheet-item.active .sheet-item-icon {
  opacity: 0.85;
  color: var(--accent-blue, #2563eb);
}

.sheet-check {
  margin-left: auto;
  color: var(--accent-blue, #2563eb);
  transform: rotate(180deg);
}

.sheet-fade-enter-active,
.sheet-fade-leave-active { transition: opacity 0.2s ease; }
.sheet-fade-enter-from,
.sheet-fade-leave-to { opacity: 0; }

.sheet-slide-enter-active { transition: transform 0.28s cubic-bezier(0.16,1,0.3,1); }
.sheet-slide-leave-active { transition: transform 0.2s ease-in; }
.sheet-slide-enter-from { transform: translateY(100%); }
.sheet-slide-leave-to { transform: translateY(100%); }

/* ===== Featured banner ===== */
.featured-banner {
  display: flex;
  align-items: center;
  background: #111;
  border-radius: 24px;
  overflow: hidden;
  text-decoration: none;
  margin-bottom: 28px;
  min-height: 280px;
  transition: box-shadow 0.3s;
}

.featured-banner:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.25); }

.banner-image {
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.banner-image img { max-width: 100%; max-height: 220px; object-fit: contain; }

.banner-info {
  flex: 1;
  padding: 32px 40px 32px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner-title { font-size: 28px; font-weight: 700; color: #fff; margin: 0; line-height: 1.2; }
.banner-colors { display: flex; gap: 8px; }
.banner-color-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); }

.banner-actions { display: flex; align-items: center; gap: 24px; margin-top: 8px; }

.banner-price {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  background: #2563eb;
  color: #fff;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
}

.banner-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}

.featured-banner:hover .banner-link { color: #fff; }

/* ===== Section header ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title { font-size: 32px; font-weight: 700; color: #111; }

.header-right { display: flex; align-items: center; gap: 24px; }

.view-all-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-blue);
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}

.nav-buttons { display: flex; gap: 8px; }

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
  color: #555;
}

.nav-btn:hover:not(:disabled) { background: var(--bg-card); box-shadow: var(--shadow-md); color: var(--text-dark); }
.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== Carousel ===== */
.carousel-wrapper { position: relative; }

.carousel-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
  will-change: scroll-position;
}

.carousel-track::-webkit-scrollbar { display: none; }

.carousel-next-float {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  z-index: 10;
  transition: background 0.15s, transform 0.15s;
  backdrop-filter: blur(4px);
}

.carousel-next-float:hover { background: rgba(0,0,0,0.7); }

/* ===== Product card ===== */
.product-card {
  flex: 0 0 300px;
  background: #fff;
  border-radius: 24px;
  padding: 24px 24px 0;
  display: flex;
  flex-direction: column;
  scroll-snap-align: start;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
  overflow: hidden;
}

.product-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.1); }

.card-top-link {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 4px;
}

.product-name {
  font-size: 17px;
  font-weight: 700;
  color: #111;
  text-align: center;
  margin: 0;
  line-height: 1.3;
}

.product-subtitle {
  font-size: 13px;
  color: #888;
  margin: 4px 0 0;
  text-align: center;
  padding: 0;
}

.card-image-wrap {
  aspect-ratio: 1;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.card-image { max-width: 100%; max-height: 100%; object-fit: contain; }

/* ===== Attributes ===== */
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
  background: #ececee;
  border-radius: 12px;
  padding: 3px;
  overflow-x: auto;
  scrollbar-width: none;
}

.pill-options::-webkit-scrollbar { display: none; }

.attr-pill {
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
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
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.color-options {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 2px;
  background: none;
  cursor: pointer;
  transition: border-color 0.15s;
  flex-shrink: 0;
}

.color-dot span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.12);
}

.color-dot.active { border-color: var(--accent-blue); }

/* ===== Add to cart button ===== */
.add-cart-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  width: calc(100% + 48px);
  margin: auto -24px 0;
  padding: 16px 24px;
  border-radius: 0 0 24px 24px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s, filter 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-cart-btn:hover:not(:disabled) { background: #1d4ed8; }

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-price { font-weight: 700; font-size: 16px; }
.btn-text { font-weight: 600; font-size: 14px; }

/* ===== View all bottom link ===== */
.view-all-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-blue);
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  margin-top: 20px;
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .carousel-section { padding: 28px 12px; }

  .desktop-only,
  .desktop-sub { display: none !important; }

  .mobile-dropdown-wrap.mobile-sub { display: block; margin-bottom: 16px; }

  .section-header { margin-bottom: 16px; }
  .section-title { font-size: 24px; }

  .header-right .view-all-link { display: none; }
  .nav-buttons { display: none; }

  .product-card {
    flex: 0 0 280px;
    padding: 20px 20px 0;
    border-radius: 20px;
  }

  .product-name { font-size: 16px; }

  .add-cart-btn {
    width: calc(100% + 40px);
    margin: auto -20px 0;
    padding: 14px 20px;
    border-radius: 0 0 20px 20px;
  }

  .carousel-next-float {
    width: 44px;
    height: 44px;
    right: 0;
  }

  .carousel-track { gap: 12px; }

  .view-all-bottom { font-size: 15px; margin-top: 16px; }

  .featured-banner {
    flex-direction: column;
    min-height: auto;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .banner-image { flex: none; width: 100%; padding: 24px; }
  .banner-image img { max-height: 160px; }
  .banner-info { padding: 0 24px 24px; gap: 12px; }
  .banner-title { font-size: 22px; }
  .banner-price { padding: 10px 22px; font-size: 15px; }

  .size-filters { border-radius: 12px; padding: 4px; }
  .size-pill { padding: 8px 16px; font-size: 13px; }
  .size-filters-row { margin-bottom: 16px; }

  .color-dot { width: 26px; height: 26px; }
}

@media (max-width: 380px) {
  .product-card { flex: 0 0 260px; }
}
</style>