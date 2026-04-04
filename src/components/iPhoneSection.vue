<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../lib/api'
import { useCart } from '../lib/cart'
import { resolveProductState, type ProductVariation } from '../lib/variation'
import { toColorToken, resolveColorStyle } from '../lib/color'

interface ProductAttribute {
  id: number
  name: string
  type: string
  pivot?: { value: string }
  value?: string
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
  category_id?: number
  category?: { id: number; name: string; slug?: string }
  attributes?: ProductAttribute[]
}

interface AttributeGroup {
  name: string
  type: string
  values: string[]
}

const products = ref<Product[]>([])
const loading = ref(false)
const selectedAttributes = ref<Record<number, Record<string, string>>>({})

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')
const { addItem } = useCart()

const infoCards = [
  {
    title: 'Из-за нестабильного курса доллара, цены могут отличаться.',
    subtitle: 'Вы можете уточнить актуальность у менеджера',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
  },
  {
    title: 'Trade-in',
    description: 'Меняем старое на новое',
    link: '/trade-in',
    linkText: 'Подробнее',
    gradient: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)'
  },
  {
    title: 'Доставка',
    description: 'СЕГОДНЯ – от 500₽\nЗАВТРА – бесплатно',
    gradient: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)'
  }
]

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
    const value = attr.pivot?.value || attr.value
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
  ElMessage.success('Товар добавлен в корзину')
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await api.get('/products')
    const allProducts = response.data || []
    
    // Filter to only show active iPhones
    products.value = allProducts
      .filter((p: Product) => p.is_active && (p.name.toLowerCase().includes('iphone') || p.category?.slug?.includes('iphone')))
      .slice(0, 8)
    
    // Set default attributes
    products.value.forEach(p => {
      const groups = getAttributeGroups(p)
      if (!selectedAttributes.value[p.id]) selectedAttributes.value[p.id] = {}
      groups.forEach(group => {
        if (!selectedAttributes.value[p.id][group.name]) {
          selectedAttributes.value[p.id][group.name] = group.values[0]
        }
      })
    })
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchProducts())
</script>

<template>
  <section class="iphone-section">
    <div class="info-cards-container">
      <div v-for="(card, index) in infoCards" :key="index" class="info-card" :style="{ background: card.gradient }">
        <div class="info-card-content">
          <h3 class="info-card-title">{{ card.title }}</h3>
          <p v-if="card.subtitle" class="info-card-subtitle">{{ card.subtitle }}</p>
          <p v-if="card.description" class="info-card-description">{{ card.description }}</p>
          <RouterLink v-if="card.link" :to="card.link" class="info-card-link">{{ card.linkText }} <span>→</span></RouterLink>
        </div>
      </div>
    </div>

    <div class="products-section">
      <div class="section-header">
        <h2 class="section-title">iPhone</h2>
        <RouterLink to="/catalog/iphone" class="view-all-link">
          Посмотреть все айфоны 
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </RouterLink>
      </div>

      <div v-loading="loading" class="products-grid" v-if="products.length > 0">
        <div v-for="product in products" :key="product.id" class="product-card">
          
          <RouterLink :to="`/product/${product.slug}`" class="product-image-container">
            <img :src="getImageUrl(getProductState(product).variation?.image || product.image_main)" :alt="product.name" class="product-image" loading="lazy">
          </RouterLink>

          <RouterLink :to="`/product/${product.slug}`" class="product-name-link">
            <h3 class="product-name">{{ product.name }}</h3>
          </RouterLink>

          <div class="attributes-wrapper">
            <template v-for="group in getAttributeGroups(product).slice(0, 2)" :key="group.name">
              
              <div v-if="isColorGroup(group.name)" class="product-colors" :data-op-palette="product.slug ? product.slug.replace(/-/g, '_') : ''">
                <button 
                  v-for="val in group.values" :key="val"
                  :class="['color-dot', { active: selectedAttributes[product.id]?.[group.name] === val }]"
                  :title="val"
                  @click="selectAttribute(product.id, group.name, val)"
                >
                  <span class="color-circle" :style="resolveColorStyle(val)"></span>
                </button>
              </div>

              <div v-else class="product-options">
                <button
                  v-for="val in group.values" :key="val"
                  :class="['option-pill', { active: selectedAttributes[product.id]?.[group.name] === val }]"
                  @click="selectAttribute(product.id, group.name, val)"
                >
                  {{ val }}
                </button>
              </div>

            </template>
          </div>

          <div class="product-footer">
            <div class="product-price">{{ Number(getProductState(product).price).toLocaleString('ru-RU') }} ₽</div>
            <button 
              class="add-to-cart-btn" 
              :disabled="!getProductState(product).canBuy"
              @click="addToCart(product)"
            >
              {{ getProductState(product).isPreorder && !getProductState(product).inStock ? 'Предзаказ' : (getProductState(product).canBuy ? 'В корзину' : 'Нет') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.iphone-section {
  padding: 32px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Инфо Карточки ===== */
.info-cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 50px;
}

.info-card {
  padding: 30px;
  border-radius: 24px;
  color: #111;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.info-card-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; line-height: 1.3; }
.info-card-subtitle, .info-card-description { font-size: 14px; opacity: 0.85; line-height: 1.5; white-space: pre-line; }
.info-card-link { margin-top: 16px; font-size: 14px; font-weight: 600; color: #111; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; transition: opacity 0.2s; }
.info-card-link:hover { opacity: 0.7; }

/* ===== Сетка товаров ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title { font-size: 32px; font-weight: 700; color: var(--text-dark); }
.view-all-link { display: flex; align-items: center; gap: 8px; color: var(--accent-blue); font-weight: 600; font-size: 16px; text-decoration: none; transition: color 0.2s; }
.view-all-link:hover { color: var(--accent-blue-hover); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.product-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;
}

.product-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.product-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 220px;
  margin-bottom: 20px;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-name-link {
  text-decoration: none;
  margin-bottom: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  color: var(--text-dark);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 48px;
}

.attributes-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  flex: 1;
}

/* Выбор цвета */
.product-colors {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.color-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.color-dot.active { border-color: var(--text-dark); }
.color-circle { display: block; width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

/* Выбор памяти (Pills) */
.product-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.option-pill {
  background: #f0ece8;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.option-pill:hover { background: #e8e8e8; }
.option-pill.active { background: #fff; color: var(--text-dark); border-color: var(--text-dark); font-weight: 600; }

/* Подвал карточки */
.product-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price { font-size: 18px; font-weight: 700; color: var(--text-dark); }

.add-to-cart-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-to-cart-btn:hover:not(:disabled) { background: var(--accent-hover); }
.add-to-cart-btn:disabled { background: #ccc; cursor: not-allowed; }

@media (max-width: 900px) {
  .info-cards-container { grid-template-columns: 1fr; gap: 12px; }
  .info-card { min-height: auto; padding: 20px; border-radius: 16px; }
}

@media (max-width: 768px) {
  .iphone-section { padding: 20px 14px; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
  .product-card { padding: 16px; border-radius: 16px; }
  .product-image-container { height: 160px; }
  .product-name { font-size: 15px; height: auto; min-height: 45px; }
  .product-price { font-size: 16px; }
  .add-to-cart-btn { padding: 8px 12px; font-size: 13px; }
  .product-footer { flex-direction: column; gap: 12px; }
}
</style>