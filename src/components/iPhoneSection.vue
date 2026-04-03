<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { RouterLink } from 'vue-router'

interface ProductAttribute {
  id: number
  name: string
  value: string
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  description: string | null
  image_main: string | null
  images: string[] | null
  is_active: boolean
  category_id: number
  attributes: ProductAttribute[]
}

interface InfoCard {
  title: string
  subtitle?: string
  description?: string
  icon?: string
  link?: string
  linkText?: string
  gradient: string
}

const products = ref<Product[]>([])
const loading = ref(false)
const selectedStorage = ref<Record<number, string>>({})
const selectedSim = ref<Record<number, string>>({})
const selectedColor = ref<Record<number, string>>({})

const API_URL = import.meta.env.VITE_API_URL || '/api'
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || '/storage'

const infoCards: InfoCard[] = [
  {
    title: 'Из-за нестабильного курса доллара, цены могут отличаться.',
    subtitle: 'Вы можете уточнить актуальность у менеджера',
    gradient: 'from-red-400 via-purple-400 to-indigo-400',
    icon: '💬'
  },
  {
    title: 'Trade-in',
    description: 'Меняем старое на новое',
    link: '/trade-in',
    linkText: 'Подробнее',
    gradient: 'from-indigo-400 to-purple-400'
  },
  {
    title: 'Доставка',
    description: 'Сегодня – от 500₽\nЗавтра – бесплатно',
    gradient: 'from-blue-400 to-sky-400'
  }
]

const gradientClass = (s: string) => 'gradient-' + s.trim().replace(/\s+/g, '-')

const getImageUrl = (path: string | null) => {
  if (!path) return '/placeholder-product.jpg'
  if (path.startsWith('http')) return path
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}/${cleanPath}`
}

const getAttributes = (product: Product) => {
  if (!product.attributes) return { colors: [], storages: [], sims: [] }
  
  const colors = product.attributes.filter(attr => attr.name.toLowerCase() === 'цвет')
  const storages = product.attributes.filter(attr => 
    ['память', 'storage', 'gb', 'тб'].some(k => attr.name.toLowerCase().includes(k))
  )
  const sims = product.attributes.filter(attr => 
    ['sim', 'сим'].some(k => attr.name.toLowerCase().includes(k))
  )
  
  return { colors, storages, sims }
}

const selectStorage = (productId: number, value: string) => selectedStorage.value[productId] = value
const selectSim = (productId: number, value: string) => selectedSim.value[productId] = value
const selectColor = (productId: number, value: string) => selectedColor.value[productId] = value

const addToCart = async (product: Product) => {
  console.log('Добавлено в корзину:', product.name)
  // Интеграция с корзиной
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/products`, {
      params: { category: 'iphone', with_attributes: true, limit: 8 }
    })
    products.value = response.data.filter((p: Product) => p.is_active)
    
    // Устанавливаем дефолтные значения
    products.value.forEach(p => {
      const attrs = getAttributes(p)
      if (attrs.storages.length) selectedStorage.value[p.id] = attrs.storages[0].value
      if (attrs.sims.length) selectedSim.value[p.id] = attrs.sims[0].value
      if (attrs.colors.length) selectedColor.value[p.id] = attrs.colors[0].value
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
      <div v-for="(card, index) in infoCards" :key="index" :class="['info-card', gradientClass(card.gradient)]">
        <div class="info-card-content">
          <h3 class="info-card-title">{{ card.title }}</h3>
          <p v-if="card.subtitle" class="info-card-subtitle">{{ card.subtitle }}</p>
          <p v-if="card.description" class="info-card-description">{{ card.description }}</p>
          <RouterLink v-if="card.link" :to="card.link" class="info-card-link">{{ card.linkText }} →</RouterLink>
        </div>
      </div>
    </div>

    <div class="products-section">
      <div class="section-header">
        <h2 class="section-title">iPhone</h2>
        <RouterLink to="/catalog/iphone" class="view-all-link">Посмотреть все айфоны →</RouterLink>
      </div>

      <div v-loading="loading" class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-header">
            <h3 class="product-name">{{ product.name }}</h3>
          </div>

          <RouterLink :to="`/product/${product.slug}`" class="product-image-container">
            <img :src="getImageUrl(product.image_main)" :alt="product.name" class="product-image" loading="lazy">
          </RouterLink>

          <div v-if="getAttributes(product).colors.length > 0" class="product-colors">
            <button 
              v-for="color in getAttributes(product).colors" 
              :key="color.id"
              :class="['color-dot', { active: selectedColor[product.id] === color.value }]"
              :title="color.value"
              @click="selectColor(product.id, color.value)"
            >
              <span class="color-circle" :style="{ backgroundColor: color.value === 'Черный' ? '#1d1d1f' : color.value }"></span>
            </button>
          </div>

          <div v-if="getAttributes(product).storages.length > 0" class="product-options">
            <button
              v-for="storage in getAttributes(product).storages"
              :key="storage.id"
              :class="['option-pill', { active: selectedStorage[product.id] === storage.value }]"
              @click="selectStorage(product.id, storage.value)"
            >
              {{ storage.value }}
            </button>
          </div>

          <div v-if="getAttributes(product).sims.length > 0" class="product-options">
            <button
              v-for="sim in getAttributes(product).sims"
              :key="sim.id"
              :class="['option-pill', { active: selectedSim[product.id] === sim.value }]"
              @click="selectSim(product.id, sim.value)"
            >
              {{ sim.value }}
            </button>
          </div>

          <div class="product-footer">
            <div class="product-price">{{ Number(product.price).toLocaleString('ru-RU') }} ₽</div>
            <button class="add-to-cart-btn" @click="addToCart(product)">Купить</button>
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
  gap: 16px;
  margin-bottom: 40px;
}

.info-card {
  padding: 24px;
  border-radius: 20px;
  color: white;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  transition: transform 0.25s ease;
}

.info-card:hover {
  transform: translateY(-3px);
}

.gradient-from-red-400-via-purple-400-to-indigo-400 { background: linear-gradient(135deg, #e05c5c 0%, #7c3aed 100%); }
.gradient-from-indigo-400-to-purple-400 { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
.gradient-from-blue-400-to-sky-400 { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); }

@media (max-width: 768px) {
  .info-cards-container {
    grid-template-columns: 1fr;
  }

  .iphone-section {
    padding: 20px 14px;
  }

  .section-title {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .info-card {
    min-height: 90px;
    padding: 18px;
  }

  .product-image-container {
    height: 160px;
  }

  .product-name {
    font-size: 15px;
  }
}

.info-card-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.info-card-subtitle, .info-card-description { font-size: 14px; opacity: 0.9; line-height: 1.4; white-space: pre-line; }
.info-card-link { margin-top: 12px; font-size: 14px; font-weight: 600; color: white; display: inline-block; opacity: 0.9; }
.info-card-link:hover { opacity: 1; }

/* ===== Сетка товаров ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.section-title { font-size: 32px; font-weight: 700; color: var(--text-main); }
.view-all-link { color: var(--accent); font-weight: 500; font-size: 15px; transition: color 0.2s; }
.view-all-link:hover { color: var(--accent-hover); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: 20px;
}

.product-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.product-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: var(--text-main);
  margin-bottom: 16px;
}

.product-image-container {
  display: block;
  height: 200px;
  margin-bottom: 20px;
  text-align: center;
}

.product-image {
  max-width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.product-image-container:hover .product-image { transform: scale(1.04); }

/* Выбор цвета */
.product-colors {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.color-dot {
  width: 28px;
  height: 28px;
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

.color-dot.active { border-color: var(--accent-blue); }
.color-circle { width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

/* Выбор памяти (Pills) */
.product-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
  background: #f5f5f7;
  padding: 4px;
  border-radius: 12px;
}

.option-pill {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.option-pill:hover { color: var(--text-main); }
.option-pill.active { background: var(--bg-white); color: var(--text-dark); box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-weight: 600; }

/* Подвал карточки */
.product-footer {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price { font-size: 20px; font-weight: 700; color: var(--text-main); }

.add-to-cart-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-to-cart-btn:hover { background: var(--accent-hover); }

@media (max-width: 768px) {
  .section-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  .product-card { padding: 16px; border-radius: 20px; }
  .product-image-container { height: 140px; }
  .product-name { font-size: 15px; }
  .product-price { font-size: 16px; }
  .add-to-cart-btn { padding: 8px 14px; font-size: 13px; border-radius: 12px; }
  .product-footer { flex-direction: column; align-items: stretch; gap: 12px; text-align: center; }
}
</style>