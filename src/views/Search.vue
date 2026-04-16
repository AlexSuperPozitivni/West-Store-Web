<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { api } from '../lib/api'
import { getImageUrl } from '../lib/image'
import { useCart } from '../lib/cart'
import { useSeo } from '../lib/useSeo'

interface Product {
  id: number
  name: string
  slug: string
  price: number
  image_main: string | null
}

const route = useRoute()
const router = useRouter()
const { addItem } = useCart()

const query = computed(() => (route.query.q as string) || '')
const searchInput = ref(query.value)
const products = ref<Product[]>([])
const loading = ref(false)
const searched = ref(false)

useSeo({ title: `Поиск: ${query.value}` })

const searchProducts = async (q: string) => {
  if (!q.trim()) {
    products.value = []
    searched.value = false
    return
  }
  loading.value = true
  searched.value = false
  try {
    const { data } = await api.get('/products', { params: { search: q } })
    products.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    console.error('Search failed:', e)
    products.value = []
  } finally {
    loading.value = false
    searched.value = true
  }
}

const submitSearch = () => {
  const q = searchInput.value.trim()
  if (q) {
    router.push({ path: '/search', query: { q } })
  }
}

const addToCart = (product: Product) => {
  addItem({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    qty: 1,
    image: product.image_main || '',
    attrs: []
  })
}

watch(query, (q) => {
  searchInput.value = q
  document.title = q ? `Поиск: ${q} | ONLYPHONES — Apple в Москве` : 'Поиск | ONLYPHONES — Apple в Москве'
  searchProducts(q)
}, { immediate: true })
</script>

<template>
  <div class="search-page">
    <div class="search-container">
      <form class="search-bar" @submit.prevent="submitSearch">
        <svg class="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" stroke-linecap="round" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          class="search-input"
          placeholder="Поиск товаров..."
          autofocus
        />
        <button type="submit" class="search-submit">Найти</button>
      </form>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Ищем товары...</p>
      </div>

      <div v-else-if="searched && products.length === 0" class="empty-state">
        <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" stroke-linecap="round" />
          <path d="M8 11h6" stroke-linecap="round" />
        </svg>
        <h2 class="empty-title">Ничего не найдено</h2>
        <p class="empty-subtitle">Попробуйте изменить запрос или посмотрите наш каталог</p>
        <RouterLink to="/catalog" class="browse-link">Перейти в каталог</RouterLink>
      </div>

      <div v-else-if="products.length > 0" class="results">
        <p class="results-count">Найдено: {{ products.length }}</p>
        <div class="products-grid">
          <div class="product-card" v-for="product in products" :key="product.id">
            <RouterLink :to="`/product/${product.slug}`" class="card-image-wrap">
              <img
                :src="getImageUrl(product.image_main)"
                :alt="product.name"
                class="card-image"
                loading="lazy"
              />
            </RouterLink>
            <div class="product-name-row">
              <span class="stock-dot in-stock" title="В наличии">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <RouterLink :to="`/product/${product.slug}`" class="product-name">
                {{ product.name }}
              </RouterLink>
            </div>
            <button class="add-cart-btn" @click="addToCart(product)">
              <span class="btn-price">{{ product.price.toLocaleString('ru-RU') }} ₽</span>
              <span class="btn-text">В корзину</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 60vh;
  padding: 40px 20px 60px;
}

.search-container {
  max-width: 1400px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 16px;
  padding: 6px 6px 6px 20px;
  margin-bottom: 32px;
  gap: 12px;
}

.search-icon {
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 17px;
  padding: 12px 0;
  outline: none;
  color: #111;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-submit {
  flex-shrink: 0;
  background: var(--accent, #111);
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.search-submit:hover {
  background: var(--accent-hover, #333);
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  color: #6b7280;
  gap: 16px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--accent, #111);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  margin: 0 0 8px;
}

.empty-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 24px;
}

.browse-link {
  display: inline-block;
  padding: 12px 28px;
  background: var(--accent, #111);
  color: #fff;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.2s;
}

.browse-link:hover {
  background: var(--accent-hover, #333);
}

/* Results */
.results-count {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
  overflow: hidden;
}

.product-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.card-image-wrap {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  text-decoration: none;
}

.card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-name-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 12px;
  flex: 1;
}

.stock-dot {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d1d5db;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.stock-dot.in-stock {
  background: #22c55e;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  text-decoration: none;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.product-name:hover {
  color: var(--accent-blue, #2563eb);
}

.add-cart-btn {
  background: linear-gradient(90deg, #43e0f0 0%, #a855f7 100%);
  color: #fff;
  border: none;
  width: calc(100% + 40px);
  margin: 0 -20px;
  padding: 16px 24px;
  border-radius: 0 0 20px 20px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s, filter 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-cart-btn:hover {
  filter: brightness(1.08);
}

.btn-price {
  font-weight: 700;
  font-size: 15px;
}

.btn-text {
  font-weight: 600;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    padding: 4px 4px 4px 16px;
  }

  .search-input {
    font-size: 15px;
  }

  .search-submit {
    padding: 10px 20px;
    font-size: 14px;
  }

  .product-card {
    padding: 16px 16px 0;
  }

  .add-cart-btn {
    width: calc(100% + 32px);
    margin: 0 -16px;
    padding: 12px 16px;
  }
}
</style>
