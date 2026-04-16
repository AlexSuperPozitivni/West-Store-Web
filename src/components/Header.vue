<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCart } from '../lib/cart'

const { cartCount, loadCart } = useCart()
const router = useRouter()
const menuOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')

const handleSearch = () => {
  const q = searchQuery.value.trim()
  if (!q) return
  searchOpen.value = false
  searchQuery.value = ''
  closeMenu()
  router.push({ path: '/search', query: { q } })
}
const activeCategory = ref<string | null>(null)
const mobileExpanded = ref<string | null>(null)
const isMobile = ref(false)

const checkMobile = () => { isMobile.value = window.innerWidth <= 900 }


interface SubItem { label: string; path: string }
interface NavCategory {
  label: string
  path: string
  sub?: SubItem[]
}

const categories: NavCategory[] = [
  {
    label: 'iPhone', path: '/catalog/iphone',
    sub: [
      { label: 'iPhone 17 Pro', path: '/catalog/iphone-17-pro' },
      { label: 'iPhone Air', path: '/catalog/iphone-air' },
      { label: 'iPhone 17', path: '/catalog/iphone-17' },
      { label: 'iPhone 16 Pro', path: '/catalog/iphone-16-pro' },
      { label: 'iPhone 16', path: '/catalog/iphone-16' },
      { label: 'iPhone 15 Pro', path: '/catalog/iphone-15-pro' },
      { label: 'iPhone 15', path: '/catalog/iphone-15' },
      { label: 'iPhone 14', path: '/catalog/iphone-14' },
      { label: 'iPhone 13', path: '/catalog/iphone-13' },
      { label: 'iPhone 12', path: '/catalog/iphone-12' },
      { label: 'iPhone 11', path: '/catalog/iphone-11' },
      { label: 'iPhone SE', path: '/catalog/iphone-se' },
    ]
  },
  {
    label: 'AirPods', path: '/catalog/airpods',
    sub: [
      { label: 'AirPods', path: '/catalog/airpods' },
      { label: 'AirPods Pro', path: '/catalog/airpods-pro' },
      { label: 'AirPods Max', path: '/catalog/airpods-max' },
    ]
  },
  {
    label: 'iPad', path: '/catalog/ipad',
    sub: [
      { label: 'iPad Pro', path: '/catalog/ipad-pro' },
      { label: 'iPad', path: '/catalog/ipad' },
      { label: 'iPad Air', path: '/catalog/ipad-air' },
      { label: 'iPad mini', path: '/catalog/ipad-mini' },
    ]
  },
  {
    label: 'MacBook', path: '/catalog/macbook',
    sub: [
      { label: 'MacBook Air 13"', path: '/catalog/macbook-air-13' },
      { label: 'MacBook Air 15"', path: '/catalog/macbook-air-15' },
      { label: 'MacBook Pro 14"', path: '/catalog/macbook-pro-14' },
      { label: 'MacBook Pro 16"', path: '/catalog/macbook-pro-16' },
      { label: 'MacBook Neo', path: '/catalog/macbook-neo' },
    ]
  },
  { label: 'Mac', path: '/catalog/mac' },
  {
    label: 'Watch', path: '/catalog/watch',
    sub: [
      { label: 'Watch Series 11', path: '/catalog/watch-series-11' },
      { label: 'Watch Ultra', path: '/catalog/watch-ultra' },
      { label: 'Watch SE', path: '/catalog/watch-se' },
      { label: 'Watch Nike', path: '/catalog/watch-nike' },
      { label: 'Watch Hermès', path: '/catalog/watch-hermes' },
    ]
  },
  { label: 'Apple TV', path: '/catalog/apple-tv' },
  { label: 'Apple Vision', path: '/catalog/apple-vision' },
  { label: 'DJI', path: '/catalog/dji' },
  {
    label: 'Аксессуары', path: '/catalog/accessories',
    sub: [
      { label: 'Диктофоны', path: '/catalog/diktofony' },
      { label: 'Аксессуары для iPad', path: '/catalog/accessories-ipad' },
      { label: 'Аксессуары для iPhone', path: '/catalog/accessories-iphone' },
      { label: 'Аксессуары для Mac', path: '/catalog/accessories-mac' },
      { label: 'Аксессуары для Watch', path: '/catalog/accessories-watch' },
    ]
  },
  { label: 'Playstation', path: '/catalog/playstation' },
  {
    label: 'Samsung', path: '/catalog/samsung',
    sub: [
      { label: 'Samsung S26', path: '/catalog/samsung-s26' },
      { label: 'Samsung S25', path: '/catalog/samsung-s25' },
      { label: 'Samsung S24', path: '/catalog/samsung-s24' },
      { label: 'Samsung S23', path: '/catalog/samsung-s23' },
      { label: 'Samsung Tab S10', path: '/catalog/samsung-tab-s10' },
      { label: 'Samsung Tab S9', path: '/catalog/samsung-tab-s9' },
      { label: 'Samsung Tab S8', path: '/catalog/samsung-tab-s8' },
      { label: 'Samsung Z Flip', path: '/catalog/samsung-z-flip' },
    ]
  },
  {
    label: 'Ноутбуки', path: '/catalog/noutbuki',
    sub: [
      { label: 'Ноутбуки Acer', path: '/catalog/acer' },
      { label: 'Ноутбуки HP', path: '/catalog/hp' },
      { label: 'Ноутбуки Asus', path: '/catalog/asus' },
      { label: 'Ноутбуки DELL', path: '/catalog/dell' },
      { label: 'Ноутбуки Lenovo', path: '/catalog/lenovo' },
    ]
  },
  {
    label: 'Dyson', path: '/catalog/dyson',
    sub: [
      { label: 'Выпрямители для волос Dyson', path: '/catalog/dyson-straighteners' },
      { label: 'Стайлеры Dyson', path: '/catalog/dyson-stylers' },
      { label: 'Фены Dyson', path: '/catalog/dyson-hairdryers' },
      { label: 'Пылесосы Dyson', path: '/catalog/dyson-vacuums' },
      { label: 'Освежители воздуха Dyson', path: '/catalog/dyson-air' },
    ]
  },
  { label: 'Garmin', path: '/catalog/garmin' },
  { label: 'Ray-Ban Meta', path: '/catalog/ray-ban-meta' },
  { label: 'Игровые приставки', path: '/catalog/pristavki' },
  { label: 'Акустика', path: '/catalog/akustika' },
  { label: 'Телевизоры', path: '/catalog/televizory' },
  { label: 'Фотоаппараты', path: '/catalog/fotoapparaty' },
  { label: 'Huawei', path: '/catalog/huawei' },
]

const infoLinks = [
  { label: 'О магазине', path: '/about' },
  { label: 'Трейд-ин', path: '/trade-in' },
  { label: 'Ремонт', path: '/repair' },
  { label: 'Оплата', path: '/payment' },
  { label: 'Франшиза', path: '/franchise' },
  { label: 'Контакты', path: '/contacts' },
  { label: 'Блог', path: '/blog' },
]

const activeSub = ref<SubItem[]>([])

const openMenu = () => {
  menuOpen.value = true
  activeCategory.value = categories[0].label
  activeSub.value = categories[0].sub || []
  document.body.style.overflow = 'hidden'
}

const closeMenu = () => {
  menuOpen.value = false
  activeCategory.value = null
  activeSub.value = []
  document.body.style.overflow = ''
}

const hoverCategory = (cat: NavCategory) => {
  activeCategory.value = cat.label
  activeSub.value = cat.sub || []
}

const navigateTo = (path: string) => {
  closeMenu()
  router.push(path)
}

onMounted(() => {
  loadCart()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('resize', checkMobile)
})

watch(() => router.currentRoute.value.path, () => {
  closeMenu()
})
</script>

<template>
  <header class="header" :class="{ 'menu-is-open': menuOpen }">
    <div class="header-bar">
      <div class="header-inner">
        <button class="toggle-btn" @click="menuOpen ? closeMenu() : openMenu()" :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'">
          <svg v-if="!menuOpen" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round"/>
          </svg>
          <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
          </svg>
        </button>

        <RouterLink to="/" class="logo" @click="closeMenu">
          west-store
        </RouterLink>

        <div class="header-right">
          <div class="search-area desktop-only">
            <div v-if="searchOpen" class="search-input-wrap">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск товаров..."
                class="search-input"
                @keyup.enter="handleSearch"
                ref="searchInputRef"
              />
              <button class="search-submit" @click="handleSearch" aria-label="Найти">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <button v-else class="search-toggle" @click="searchOpen = true" aria-label="Поиск">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="phones desktop-only">
            <div class="phone-row">
              <a href="tel:+79299556487" class="phone">+7 (929) 955 6487</a>
              <span class="phone-hint">WhatsApp, Telegram</span>
            </div>
          </div>

          <RouterLink to="/cart" class="cart-btn" @click="closeMenu">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <Transition name="menu-slide">
      <div v-show="menuOpen" class="mega-menu">
        <div class="mega-inner">
          <nav class="cat-list">
            <template v-for="cat in categories" :key="cat.label">
              <button
                :class="['cat-item', { active: activeCategory === cat.label }]"
                @mouseenter="!isMobile ? hoverCategory(cat) : undefined"
                @click="isMobile ? (cat.sub?.length ? (mobileExpanded = mobileExpanded === cat.label ? null : cat.label) : navigateTo(cat.path)) : (cat.sub?.length ? hoverCategory(cat) : navigateTo(cat.path))"
              >
                <span>{{ cat.label }}</span>
                <svg v-if="cat.sub?.length" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="isMobile && mobileExpanded === cat.label ? 'transform: rotate(90deg)' : ''">
                  <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <div v-if="isMobile && mobileExpanded === cat.label && cat.sub?.length" class="mobile-sub">
                <button class="mobile-sub-item mobile-sub-all" @click="navigateTo(cat.path)">Все {{ cat.label }}</button>
                <button v-for="sub in cat.sub" :key="sub.label" class="mobile-sub-item" @click="navigateTo(sub.path)">
                  {{ sub.label }}
                </button>
              </div>
            </template>

            <div class="cat-divider"></div>

            <button
              v-for="link in infoLinks"
              :key="link.label"
              class="cat-item info-link"
              @click="navigateTo(link.path)"
            >
              {{ link.label }}
            </button>
          </nav>

          <Transition name="sub-fade">
            <div class="sub-list" v-if="activeSub.length" :key="activeCategory">
              <p class="sub-title">{{ activeCategory }}</p>
              <button
                v-for="sub in activeSub"
                :key="sub.label"
                class="sub-item"
                @click="navigateTo(sub.path)"
              >
                {{ sub.label }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </header>

  <Transition name="overlay-fade">
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>
  </Transition>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.header-bar {
  width: 100%;
  background: #ffffff;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 80px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 6px;
  transition: background 0.15s;
}

.toggle-btn:hover {
  background: rgba(0,0,0,0.06);
}

.logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #1a1a1a;
  text-transform: uppercase;
  text-decoration: none;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.phones {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 32px;
}

.phone-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.phone {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.phone-hint {
  font-size: 12px;
  color: #999999;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .phones {
    gap: 20px;
  }
}

.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  padding: 6px;
  flex-shrink: 0;
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: var(--accent-blue);
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

/* ===== Menu transitions ===== */
.menu-slide-enter-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.menu-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.menu-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.sub-fade-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.sub-fade-leave-active {
  transition: opacity 0.12s ease;
  position: absolute;
}
.sub-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.sub-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ===== Mega Menu ===== */
.mega-menu {
  position: absolute;
  top: 80px;
  left: 0;
  width: 100%;
  background: var(--bg-white);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  z-index: 999;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.mega-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 0;
  min-height: 400px;
}

.cat-list {
  width: 240px;
  flex-shrink: 0;
  padding: 12px 0;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px 9px 4px;
  font-size: 13px;
  color: var(--text-main);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s, padding-left 0.15s;
  width: 100%;
  gap: 8px;
}

.cat-item:hover {
  color: var(--text-dark);
  background: #f5f5f5;
  padding-left: 10px;
}

.cat-item.active {
  color: var(--text-dark);
  font-weight: 600;
  background: #f0f0f0;
  padding-left: 10px;
}

.cat-item svg {
  color: #bbb;
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}

.cat-item:hover svg,
.cat-item.active svg {
  color: #555;
  transform: translateX(2px);
}

.cat-divider {
  height: 1px;
  background: var(--border-color);
  margin: 10px 0;
}

.info-link {
  font-size: 12px;
  color: var(--text-muted);
}

.info-link:hover {
  color: var(--text-dark);
  background: #f5f5f5;
}

.sub-list {
  flex: 1;
  padding: 12px 0 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  position: relative;
}

.sub-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  padding: 0 12px;
  margin-bottom: 8px;
}

.sub-item {
  display: block;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-main);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s, padding-left 0.15s;
  width: 100%;
}

.sub-item:hover {
  background: #f5f5f5;
  color: var(--text-dark);
  font-weight: 500;
  padding-left: 18px;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 998;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
}

.search-area {
  display: flex;
  align-items: center;
}

.search-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #1a1a1a;
  border-radius: 6px;
  transition: background 0.15s;
  display: flex;
  align-items: center;
}

.search-toggle:hover {
  background: rgba(0,0,0,0.06);
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 0 4px 0 14px;
  height: 38px;
  width: 240px;
  transition: width 0.2s;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  width: 100%;
  color: #1a1a1a;
}

.search-input::placeholder {
  color: #999;
}

.search-submit {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #666;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: color 0.15s;
}

.search-submit:hover {
  color: #1a1a1a;
}

.desktop-only {
  display: flex;
}

/* ===== Mobile ===== */
@media (max-width: 900px) {
  .desktop-only {
    display: none !important;
  }

  .mega-menu {
    position: fixed;
    top: 80px;
    left: 0;
    width: 100%;
    height: calc(100vh - 80px);
    max-height: none;
    overflow-y: auto;
    border-top: 1px solid var(--border-color);
  }

  /* On mobile: slide from left instead of from top */
  .menu-slide-enter-from {
    opacity: 0;
    transform: translateX(-16px);
  }
  .menu-slide-leave-to {
    opacity: 0;
    transform: translateX(-16px);
  }

  .mega-inner {
    flex-direction: column;
    gap: 0;
    padding: 0 16px;
    min-height: auto;
  }

  .cat-list {
    width: 100%;
    border-right: none;
    padding: 6px 0;
  }

  .cat-item {
    padding: 12px 8px;
    font-size: 15px;
    border-bottom: 1px solid var(--border-color);
    border-radius: 0;
  }

  .cat-item:hover,
  .cat-item.active {
    padding-left: 8px;
    background: #f8f8f8;
  }

  .sub-list {
    display: none;
  }

  .sub-title {
    padding: 8px 8px 4px;
  }

  .sub-item {
    font-size: 14px;
    padding: 10px 8px;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 0;
  }

  .sub-item:hover {
    padding-left: 14px;
    background: #f5f5f5;
  }

  .mobile-sub {
    padding: 0 0 4px 16px;
    border-bottom: 1px solid var(--border-color);
    background: #fafafa;
  }

  .mobile-sub-item {
    display: block;
    width: 100%;
    padding: 10px 8px;
    font-size: 14px;
    color: var(--text-main);
    background: none;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    text-align: left;
  }

  .mobile-sub-item:last-child {
    border-bottom: none;
  }

  .mobile-sub-all {
    font-weight: 600;
    color: var(--accent-blue, #2563eb);
  }
}
</style>