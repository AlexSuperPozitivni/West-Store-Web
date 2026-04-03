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
  is_active?: boolean
  attributes?: ProductAttribute[]
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
  limit?: number
}>(), {
  limit: 12
})

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')
const { addItem } = useCart()
const COLOR_KEYWORD = '\u0446\u0432\u0435\u0442'
const MSG_PREORDER_DONE = '\u041f\u0440\u0435\u0434\u0437\u0430\u043a\u0430\u0437 \u043e\u0444\u043e\u0440\u043c\u043b\u0435\u043d'
const MSG_ADDED_TO_CART = '\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443'
const LABEL_PREORDER = '\u041f\u0440\u0435\u0434\u0437\u0430\u043a\u0430\u0437'
const LABEL_TO_CART = '\u0412 \u043a\u043e\u0440\u0437\u0438\u043d\u0443'
const LABEL_OUT_OF_STOCK = '\u041d\u0435\u0442 \u0432 \u043d\u0430\u043b\u0438\u0447\u0438\u0438'
const ARIA_SCROLL_LEFT = '\u041f\u0440\u043e\u043a\u0440\u0443\u0442\u0438\u0442\u044c \u0432\u043b\u0435\u0432\u043e'
const ARIA_SCROLL_RIGHT = '\u041f\u0440\u043e\u043a\u0440\u0443\u0442\u0438\u0442\u044c \u0432\u043f\u0440\u0430\u0432\u043e'
const RUBLE_SIGN = '\u20bd'

const trackRef = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)
const selectedAttributes = ref<Record<number, Record<string, string>>>({})

const items = computed(() => (props.products || []).slice(0, props.limit))

const getImageUrl = (path: string | null) => {
  if (!path) return '/placeholder-product.jpg'
  if (path.startsWith('http')) return path
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}/${cleanPath}`
}

const isColorGroup = (name: string) => {
  const n = name.toLowerCase()
  return n.includes(COLOR_KEYWORD) || n.includes('color')
}

const getAttributeGroups = (product: Product): AttributeGroup[] => {
  const map = new Map<string, AttributeGroup>()

  product.attributes?.forEach((attr) => {
    const value = attr.pivot?.value
    if (!value) return

    const key = attr.name
    if (!map.has(key)) {
      map.set(key, {
        name: attr.name,
        type: attr.type || 'text',
        values: [value]
      })
      return
    }

    const group = map.get(key)!
    if (!group.values.includes(value)) {
      group.values.push(value)
    }
  })

  return Array.from(map.values())
}

const updateScrollState = () => {
  const el = trackRef.value
  if (!el) {
    canPrev.value = false
    canNext.value = false
    return
  }
  canPrev.value = el.scrollLeft > 2
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

const scrollByCards = (direction: 1 | -1) => {
  const el = trackRef.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('.product-card')
  const shift = card ? card.offsetWidth + 8 : Math.floor(el.clientWidth * 0.8)
  el.scrollBy({ left: shift * direction, behavior: 'smooth' })
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

const getOptionSizeClass = (value: string) => {
  const length = (value || '').trim().length
  if (length > 14) return 'option-xs'
  if (length > 8) return 'option-sm'
  return ''
}

const addToCartProduct = (product: Product) => {
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

  ElMessage.success(state.isPreorder && !state.inStock ? MSG_PREORDER_DONE : MSG_ADDED_TO_CART)
}

const ensureDefaults = (products: Product[]) => {
  products.forEach((product) => {
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

watch(items, async (products) => {
  ensureDefaults(products)
  await nextTick()
  updateScrollState()
}, { immediate: true, deep: true })

onMounted(async () => {
  await nextTick()
  updateScrollState()
  window.addEventListener('resize', updateScrollState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <section v-if="items.length > 0" class="carousel-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <RouterLink :to="viewAllLink" class="view-all-link">
        {{ viewAllText }} <span aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>

    <div class="carousel-wrap">
      <div ref="trackRef" class="carousel-track" @scroll="updateScrollState">
        <article v-for="product in items" :key="product.id" class="product-card">
          <h3 class="product-name">{{ product.name }}</h3>

          <RouterLink :to="`/product/${product.slug}`" class="product-image-link">
            <img
              :src="getImageUrl(product.image_main)"
              :alt="product.name"
              class="product-image"
              loading="lazy"
            />
          </RouterLink>

          <template v-for="group in getAttributeGroups(product).slice(0, 2)" :key="group.name">
            <div v-if="isColorGroup(group.name)" class="product-colors" :data-op-palette="product.slug ? product.slug.replace(/-/g, '_') : ''">
              <div class="variable-items-wrapper" data-attribute_name="attribute_pa_color">
                <button
                  v-for="value in group.values"
                  :key="value"
                  :class="['variable-item', { selected: selectedAttributes[product.id]?.[group.name] === value }]"
                  :data-value="toColorToken(value)"
                  :title="value"
                  @click="selectAttribute(product.id, group.name, value)"
                  type="button"
                >
                  <span class="variable-item-contents" :style="resolveColorStyle(value)"></span>
                </button>
              </div>
            </div>

            <div v-else class="product-options">
              <button
                v-for="value in group.values"
                :key="value"
                :class="[
                  'option-button',
                  getOptionSizeClass(value),
                  { active: selectedAttributes[product.id]?.[group.name] === value }
                ]"
                @click="selectAttribute(product.id, group.name, value)"
                type="button"
              >
                {{ value }}
              </button>
            </div>
          </template>

          <div class="product-footer">
            <button
              class="add-to-cart-btn"
              :disabled="!getProductState(product).canBuy"
              @click="addToCartProduct(product)"
            >
              <span class="add-to-cart-price">
                {{ Number(getProductState(product).price).toLocaleString('ru-RU') }} {{ RUBLE_SIGN }}
              </span>
              <span class="add-to-cart-label">
                {{
                  getProductState(product).isPreorder && !getProductState(product).inStock
                    ? LABEL_PREORDER
                    : (getProductState(product).canBuy ? LABEL_TO_CART : LABEL_OUT_OF_STOCK)
                }}
              </span>
            </button>
          </div>
        </article>
      </div>

      <button v-if="canPrev" class="scroll-nav nav-prev" type="button" @click="scrollByCards(-1)" :aria-label="ARIA_SCROLL_LEFT">
        &lsaquo;
      </button>
      <button v-if="canNext" class="scroll-nav nav-next" type="button" @click="scrollByCards(1)" :aria-label="ARIA_SCROLL_RIGHT">
        &rsaquo;
      </button>
    </div>

  </section>
</template>

<style scoped>
.carousel-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 20px 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
  gap: 12px;
}

.section-title {
  font-size: clamp(30px, 3vw, 42px);
  line-height: 1;
  margin: 0;
  color: var(--text-dark);
  font-weight: 700;
}

.view-all-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: var(--accent-hover);
}

.carousel-wrap {
  position: relative;
}

.carousel-track {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 2px 8px;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}

.carousel-track::-webkit-scrollbar {
  height: 8px;
}

.carousel-track::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.carousel-track::-webkit-scrollbar-track {
  background: transparent;
}

.product-card {
  flex: 0 0 max(240px, calc((100% - 24px) / 4));
  min-width: max(240px, calc((100% - 24px) / 4));
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 16px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  scroll-snap-align: start;
  transition: box-shadow 0.2s, transform 0.2s;
}

.product-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-name {
  margin: 0;
  text-align: center;
  font-size: 17px;
  line-height: 1.35;
  color: #14171f;
  min-height: 50px;
}

.product-image-link {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 188px;
  margin: 10px 0 12px;
  border-radius: 14px;
  text-decoration: none;
}

.product-image {
  max-width: 100%;
  max-height: 176px;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.product-image-link:hover .product-image {
  transform: scale(1.03);
}

.product-colors {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: 12px;
  padding-bottom: 4px;
}

.variable-items-wrapper {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  width: max-content;
  min-width: 100%;
  justify-content: center;
}

.variable-item {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background-color 0.2s;
}

.variable-item:hover {
  transform: scale(1.04);
}

.variable-item.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(50, 55, 60, 0.18);
  background: #f5f1ee;
}

.variable-item-contents {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.product-options {
  display: flex;
  gap: 3px;
  margin-bottom: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  padding: 4px;
  border-radius: 999px;
  background: #ececec;
}

.option-button {
  flex: 0 0 auto;
  min-width: max-content;
  max-width: calc(100% - 8px);
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  color: #8b93a3;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.option-button.active {
  background: #ffffff;
  color: #111827;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);
}

.option-button.option-sm {
  font-size: 11px;
  padding: 6px 8px;
}

.option-button.option-xs {
  font-size: 10px;
  padding: 5px 7px;
}

.product-footer {
  margin-top: auto;
  padding-top: 8px;
}

.add-to-cart-btn {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 11px 12px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  transition: background 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.add-to-cart-price {
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
}

.add-to-cart-label {
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.add-to-cart-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.scroll-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: none;
  background: rgba(120, 130, 141, 0.55);
  color: #ffffff;
  font-size: 38px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.nav-prev {
  left: -10px;
}

.nav-next {
  right: -10px;
}

@media (max-width: 1000px) {
  .section-title {
    font-size: clamp(30px, 6vw, 42px);
  }

  .view-all-link {
    font-size: 16px;
  }

  .scroll-nav {
    width: 44px;
    height: 44px;
    font-size: 30px;
  }

  .nav-prev {
    left: 0;
  }

  .nav-next {
    right: 0;
  }
}

@media (max-width: 768px) {
  .scroll-nav {
    display: none;
  }
}

@media (max-width: 640px) {
  .carousel-section {
    padding: 24px 14px 18px;
  }

  .carousel-track {
    gap: 12px;
    padding: 2px 0 6px;
  }

  .section-header {
    margin-bottom: 14px;
  }

  .section-bottom-link {
    margin-top: 10px;
  }

  .product-card {
    flex: 0 0 min(248px, calc((100% - 12px) / 2));
    min-width: min(248px, calc((100% - 12px) / 2));
    border-radius: 18px;
    padding: 12px 10px 10px;
  }

  .product-name {
    font-size: 14px;
    min-height: 36px;
  }

  .product-image-link {
    min-height: 132px;
    margin: 6px 0 8px;
  }

  .product-image {
    max-height: 118px;
  }

  .variable-item {
    width: 28px;
    height: 28px;
  }

  .variable-item-contents {
    width: 18px;
    height: 18px;
  }

  .option-button {
    padding: 6px 8px;
    font-size: 11px;
  }

  .add-to-cart-btn {
    font-size: 13px;
    padding: 10px 8px;
    border-radius: 12px;
  }

  .add-to-cart-price {
    font-size: 14px;
  }

  .add-to-cart-label {
    font-size: 14px;
  }
}

@media (max-width: 420px) {
  .product-card {
    flex: 0 0 calc(100% - 10px);
    min-width: calc(100% - 10px);
  }

  .product-name {
    font-size: 13px;
    min-height: 34px;
  }
}
</style>
