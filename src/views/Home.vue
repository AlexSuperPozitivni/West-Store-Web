<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted, onUnmounted, type CSSProperties } from 'vue'
import ProductCarouselSection from '../components/ProductCarouselSection.vue'
import { api } from '../lib/api'
import type { ProductVariation } from '../lib/variation'
// ProductVariation is used in Product.variations type below

interface Slide {
  id: number
  title: string
  subtitle?: string | null
  image_desktop: string
  image_mobile?: string | null
  text_color?: string | null
  link_url?: string | null
  category?: { id: number; name: string; slug?: string }
}

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
  description?: string | null
  price: number
  price_max?: number | string | null
  image_main: string | null
  images?: string[] | null
  category_id: number
  in_stock?: boolean
  is_preorder?: boolean
  variations?: ProductVariation[]
  is_active?: boolean
  attributes?: ProductAttribute[]
}

interface Category {
  id: number
  name: string
  slug: string
  parent_id?: number | null
}

const slides = ref<Slide[]>([])
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const currentSlide = ref(0)
const isAnimating = ref(false)
const sliderContainerRef = ref<HTMLElement | null>(null)
const slideWidth = ref(0)
const contactModalOpen = ref(false)
const contactActions = ['Позвонить', 'Написать в Telegram', 'Написать в WhatsApp']
const pointerStartX = ref(0)
const pointerStartY = ref(0)
const pointerDeltaX = ref(0)
const pointerDeltaY = ref(0)
const pointerTracking = ref(false)
const activePointerId = ref<number | null>(null)
const justSwiped = ref(false)
const wheelLocked = ref(false)
let autoplayInterval: number | null = null
let resizeObserver: ResizeObserver | null = null
const SWIPE_THRESHOLD = 44

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/banners/')) return path
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}/${cleanPath}`
}

const normalizePathParts = (rawLink: string) => {
  let path = rawLink.trim()
  if (!path) return [] as string[]
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      path = new URL(path).pathname
    } catch {
      return [] as string[]
    }
  }
  path = path.replace(/[#?].*$/, '')
  path = path.replace(/\/{2,}/g, '/')
  path = path.replace(/^\/+|\/+$/g, '')
  if (!path) return [] as string[]
  return path.split('/').filter(Boolean)
}

const toCategorySlug = (segment: string) => {
  const key = segment.toLowerCase()
  const aliases: Record<string, string> = {
    'buy-macbook': 'macbook',
    'apple-watch': 'watch',
    aksessuary: 'accessories',
    accessories: 'accessories',
    'apple-tv': 'apple-tv',
    'apple-vision': 'apple-vision',
    noutbuki: 'noutbuki'
  }
  return aliases[key] || key
}

const resolveSlideRoute = (linkUrl?: string | null) => {
  const parts = normalizePathParts(linkUrl || '')
  if (!parts.length) return ''

  if (parts[0] === 'product' && parts[1]) {
    return `/product/${parts[1]}`
  }

  if (parts[0] === 'catalog') {
    if (parts[1]) return `/catalog/${parts[1]}`
    return '/catalog'
  }

  if (parts.length > 1) {
    const candidateProductSlug = parts[parts.length - 1]
    if (products.value.some((product) => product.slug === candidateProductSlug)) {
      return `/product/${candidateProductSlug}`
    }
  }

  const categorySlug = toCategorySlug(parts[0])
  if (categories.value.some((category) => category.slug === categorySlug)) {
    return `/catalog/${categorySlug}`
  }

  return '/catalog'
}

const getSlideLink = (slide: Slide) => {
  const resolvedFromUrl = resolveSlideRoute(slide.link_url)
  if (resolvedFromUrl) return resolvedFromUrl
  if (slide.category?.slug) return `/catalog/${slide.category.slug}`
  return '/catalog'
}

const isGradientTextColor = (value?: string | null) => /gradient\(/i.test((value || '').trim())

const getSlideTitleStyle = (slide: Slide): CSSProperties => {
  const raw = (slide.text_color || '').trim()
  if (!raw) return {}

  if (isGradientTextColor(raw)) {
    return {
      backgroundImage: raw,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent'
    }
  }

  return { color: raw }
}

const getSlideSubtitleStyle = (slide: Slide): CSSProperties => {
  const raw = (slide.text_color || '').trim()
  if (!raw || isGradientTextColor(raw)) return {}
  return { color: raw }
}

const fetchSlides = async () => {
  try {
    const res = await api.get('/sliders')
    slides.value = res.data || []
    await nextTick()
    updateSlideWidth()
  } catch (e) {
    console.error('Failed to load slides:', e)
  }
}

const fetchProducts = async () => {
  try {
    const res = await api.get('/products')
    products.value = (res.data || []).filter((product: Product) => product.is_active !== false)
  } catch (e) {
    console.error('Failed to load products:', e)
  }
}

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories')
    categories.value = (res.data || []).filter((category: Category) => category && category.slug)
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

const getDescendantCategoryIds = (rootIds: number[]) => {
  const ids = new Set<number>(rootIds)
  let changed = true
  while (changed) {
    changed = false
    categories.value.forEach((category) => {
      if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id)) {
        ids.add(category.id)
        changed = true
      }
    })
  }
  return ids
}

const getProductsByCategorySlugs = (slugs: string[], limit = 12): Product[] => {
  if (!slugs.length) return []
  const rootIds = categories.value
    .filter((category) => slugs.includes(category.slug))
    .map((category) => category.id)

  if (!rootIds.length) return []

  const categoryIds = getDescendantCategoryIds(rootIds)
  return products.value
    .filter((product) => categoryIds.has(product.category_id))
    .slice(0, limit)
}

const openContactModal = () => {
  contactModalOpen.value = true
}

const closeContactModal = () => {
  contactModalOpen.value = false
}

const getChildCategories = (parentSlugs: string[]) => {
  const parentIds = categories.value
    .filter(c => parentSlugs.includes(c.slug))
    .map(c => c.id)
  if (!parentIds.length) return []
  return categories.value.filter(c => c.parent_id && parentIds.includes(c.parent_id))
}

const primarySections = computed(() => [
  {
    key: 'iphone',
    title: 'iPhone',
    viewAllText: 'Посмотреть все айфоны',
    viewAllLink: '/catalog/iphone',
    slugs: ['iphone'],
  },
  {
    key: 'airpods',
    title: 'AirPods',
    viewAllText: 'Посмотреть все AirPods',
    viewAllLink: '/catalog/airpods',
    slugs: ['airpods'],
  },
  {
    key: 'ipad',
    title: 'iPad',
    viewAllText: 'Посмотреть все iPad',
    viewAllLink: '/catalog/ipad',
    slugs: ['ipad'],
  },
  {
    key: 'watch',
    title: 'Apple Watch',
    viewAllText: 'Посмотреть все часы',
    viewAllLink: '/catalog/watch',
    slugs: ['watch'],
  },
  {
    key: 'macbook',
    title: 'MacBook',
    viewAllText: 'Посмотреть все MacBook',
    viewAllLink: '/catalog/macbook',
    slugs: ['macbook'],
  },
].map(config => ({
  ...config,
  products: getProductsByCategorySlugs(config.slugs, 30),
  childCategories: getChildCategories(config.slugs)
})).filter(config => config.products.length > 0))

const additionalSections = computed(() => {
  const configs = [
    {
      key: 'popular-accessories',
      title: 'Популярные аксессуары',
      viewAllText: 'Посмотреть все аксессуары',
      viewAllLink: '/catalog/accessories',
      slugs: ['popular-accessories']
    },
    {
      key: 'popular-cases',
      title: 'Популярные чехлы',
      viewAllText: 'Посмотреть все чехлы',
      viewAllLink: '/catalog/popular-cases',
      slugs: ['popular-cases']
    },
    {
      key: 'samsung',
      title: 'Samsung',
      viewAllText: 'Посмотреть все самсунги',
      viewAllLink: '/catalog/samsung',
      slugs: ['samsung']
    },
    {
      key: 'consoles',
      title: 'Игровые приставки и консоли',
      viewAllText: 'Посмотреть все приставки',
      viewAllLink: '/catalog/pristavki',
      slugs: ['pristavki', 'playstation']
    },
    {
      key: 'windows-laptops',
      title: 'Ноутбуки Windows',
      viewAllText: 'Посмотреть все ноутбуки',
      viewAllLink: '/catalog/noutbuki',
      slugs: ['noutbuki', 'windows']
    },
    {
      key: 'dyson',
      title: 'Dyson',
      viewAllText: 'Посмотреть все дайсоны',
      viewAllLink: '/catalog/dyson',
      slugs: ['dyson']
    },
    {
      key: 'vr',
      title: 'Шлемы VR',
      viewAllText: 'Посмотреть все шлемы',
      viewAllLink: '/catalog/vr',
      slugs: ['vr']
    },
    {
      key: 'huawei',
      title: 'Смартфоны Huawei',
      viewAllText: 'Посмотреть все Huawei',
      viewAllLink: '/catalog/huawei',
      slugs: ['huawei']
    },
    {
      key: 'akustika',
      title: 'Акустика',
      viewAllText: 'Посмотреть всю акустику',
      viewAllLink: '/catalog/akustika',
      slugs: ['akustika']
    },
    {
      key: 'televizory',
      title: 'Купить телевизоры',
      viewAllText: 'Посмотреть все телевизоры',
      viewAllLink: '/catalog/televizory',
      slugs: ['televizory']
    },
    {
      key: 'dji',
      title: 'Купить DJI',
      viewAllText: 'Посмотреть всю технику DJI',
      viewAllLink: '/catalog/dji',
      slugs: ['dji']
    }
  ]

  return configs
    .map((config) => ({
      ...config,
      products: getProductsByCategorySlugs(config.slugs, 30),
      childCategories: getChildCategories(config.slugs)
    }))
    .filter((config) => config.products.length > 0)
})

const nextSlide = () => {
  if (isAnimating.value || slides.value.length === 0) return
  isAnimating.value = true
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
  setTimeout(() => {
    isAnimating.value = false
  }, 400)
}

const prevSlide = () => {
  if (isAnimating.value || slides.value.length === 0) return
  isAnimating.value = true
  currentSlide.value = currentSlide.value === 0 ? slides.value.length - 1 : currentSlide.value - 1
  setTimeout(() => {
    isAnimating.value = false
  }, 400)
}

const goToSlide = (index: number) => {
  if (isAnimating.value || index === currentSlide.value) return
  isAnimating.value = true
  currentSlide.value = index
  setTimeout(() => {
    isAnimating.value = false
  }, 400)
}

const startAutoplay = () => {
  stopAutoplay()
  if (slides.value.length <= 1) return
  autoplayInterval = window.setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

const updateSlideWidth = () => {
  slideWidth.value = sliderContainerRef.value?.clientWidth || 0
}

const trackStyle = computed(() => ({
  transform: `translate3d(-${currentSlide.value * slideWidth.value}px, 0, 0)`,
  transition: isAnimating.value ? 'transform 400ms cubic-bezier(0.165, 0.84, 0.44, 1)' : 'none'
}))

const beginSwipeTracking = (x: number, y: number) => {
  pointerStartX.value = x
  pointerStartY.value = y
  pointerDeltaX.value = 0
  pointerDeltaY.value = 0
  pointerTracking.value = true
  stopAutoplay()
}

const updateSwipeTracking = (x: number, y: number, event?: Event) => {
  if (!pointerTracking.value) return
  pointerDeltaX.value = x - pointerStartX.value
  pointerDeltaY.value = y - pointerStartY.value

  if (Math.abs(pointerDeltaX.value) > Math.abs(pointerDeltaY.value) && event?.cancelable) {
    event.preventDefault()
  }
}

const finishSwipeTracking = () => {
  if (!pointerTracking.value) return
  pointerTracking.value = false

  if (Math.abs(pointerDeltaX.value) >= SWIPE_THRESHOLD && Math.abs(pointerDeltaX.value) > Math.abs(pointerDeltaY.value)) {
    if (pointerDeltaX.value < 0) {
      nextSlide()
    } else {
      prevSlide()
    }
    justSwiped.value = true
    window.setTimeout(() => {
      justSwiped.value = false
    }, 260)
  }

  pointerDeltaX.value = 0
  pointerDeltaY.value = 0
  startAutoplay()
}

const onSliderPointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  activePointerId.value = event.pointerId
  beginSwipeTracking(event.clientX, event.clientY)
  sliderContainerRef.value?.setPointerCapture?.(event.pointerId)
}

const onSliderPointerMove = (event: PointerEvent) => {
  if (!pointerTracking.value || activePointerId.value !== event.pointerId) return
  updateSwipeTracking(event.clientX, event.clientY, event)
}

const onSliderPointerUp = (event: PointerEvent) => {
  if (activePointerId.value !== event.pointerId) return
  sliderContainerRef.value?.releasePointerCapture?.(event.pointerId)
  activePointerId.value = null
  finishSwipeTracking()
}

const onSliderPointerCancel = (event: PointerEvent) => {
  if (activePointerId.value !== event.pointerId) return
  sliderContainerRef.value?.releasePointerCapture?.(event.pointerId)
  activePointerId.value = null
  pointerTracking.value = false
  pointerDeltaX.value = 0
  pointerDeltaY.value = 0
  startAutoplay()
}

const onSliderLostPointerCapture = () => {
  activePointerId.value = null
  if (!pointerTracking.value) return
  finishSwipeTracking()
}

const onSliderWheel = (event: WheelEvent) => {
  if (slides.value.length <= 1) return
  const absX = Math.abs(event.deltaX)
  const absY = Math.abs(event.deltaY)
  if (absX < 28 || absX <= absY) return

  if (event.cancelable) {
    event.preventDefault()
  }
  if (wheelLocked.value) return

  wheelLocked.value = true
  stopAutoplay()
  if (event.deltaX > 0) {
    nextSlide()
  } else {
    prevSlide()
  }
  window.setTimeout(() => {
    wheelLocked.value = false
    startAutoplay()
  }, 320)
}

const onSlideClick = (event: MouseEvent) => {
  if (!justSwiped.value) return
  event.preventDefault()
  event.stopPropagation()
}

onMounted(async () => {
  await Promise.all([fetchSlides(), fetchProducts(), fetchCategories()])
  startAutoplay()
  updateSlideWidth()

  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => updateSlideWidth())
    if (sliderContainerRef.value) {
      resizeObserver.observe(sliderContainerRef.value)
    }
  } else {
    window.addEventListener('resize', updateSlideWidth)
  }
})

onUnmounted(() => {
  stopAutoplay()
  resizeObserver?.disconnect()
  resizeObserver = null
  activePointerId.value = null
  pointerTracking.value = false
  wheelLocked.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  window.removeEventListener('resize', updateSlideWidth)
})

watch(currentSlide, () => {
  if (!slideWidth.value) {
    updateSlideWidth()
  }
})

watch(contactModalOpen, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
</script>

<template>
  <div class="banner-slider" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
    <div
      class="slider-container"
      ref="sliderContainerRef"
      @pointerdown="onSliderPointerDown"
      @pointermove="onSliderPointerMove"
      @pointerup="onSliderPointerUp"
      @pointercancel="onSliderPointerCancel"
      @lostpointercapture="onSliderLostPointerCapture"
      @wheel="onSliderWheel"
      @dragstart.prevent
    >
      <div 
        class="slides-track"
        :style="trackStyle"
      >
        <div 
          v-for="slide in slides" 
          :key="slide.id"
          class="slide"
        >
          <RouterLink :to="getSlideLink(slide)" class="slide-link" @click.capture="onSlideClick">
            <div class="slide-content">
              <h2 class="slide-title" :style="getSlideTitleStyle(slide)">
                {{ slide.title }}
              </h2>
              <p v-if="slide.subtitle" class="slide-subtitle" :style="getSlideSubtitleStyle(slide)">{{ slide.subtitle }}</p>
              <span class="slide-buy-link">Купить <span aria-hidden="true">→</span></span>
            </div>
            <div class="slide-image-wrapper">
              <img
                :src="getImageUrl(slide.image_desktop)"
                :alt="slide.title"
                class="slide-image-desktop"
                loading="eager"
                draggable="false"
                @error="$event.target.style.display='none'"
              >
              <img
                v-if="slide.image_mobile"
                :src="getImageUrl(slide.image_mobile)"
                :alt="slide.title"
                class="slide-image-mobile"
                loading="lazy"
                draggable="false"
                @error="$event.target.style.display='none'"
              >
              <div v-if="!slide.image_desktop" class="slide-placeholder">
                <span>{{ slide.title }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="slider-dots">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          :class="['slider-dot', { active: currentSlide === index }]"
          @click="goToSlide(index)"
          :aria-label="`Слайд ${index + 1}`"
        />
      </div>
    </div>
  </div>

  <div class="hero-contact-wrap">
    <button type="button" class="hero-contact-btn" @click="openContactModal">
      Связаться с нами
    </button>
  </div>

  <div
    v-if="contactModalOpen"
    class="contact-modal-overlay"
    @click.self="closeContactModal"
  >
    <div class="contact-modal">
      <h3 class="contact-modal-title">Связаться с нами</h3>

      <button
        v-for="item in contactActions"
        :key="item"
        type="button"
        class="contact-modal-item"
      >
        {{ item }}
      </button>
    </div>
  </div>

  <div class="home-page">
    <ProductCarouselSection
      v-for="section in primarySections"
      :key="section.key"
      :title="section.title"
      :view-all-text="section.viewAllText"
      :view-all-link="section.viewAllLink"
      :products="section.products"
      :child-categories="section.childCategories"
    />

    <ProductCarouselSection
      v-for="section in additionalSections"
      :key="section.key"
      :title="section.title"
      :view-all-text="section.viewAllText"
      :view-all-link="section.viewAllLink"
      :products="section.products"
      :child-categories="section.childCategories"
    />

    <section class="callback-section">
      <div class="callback-card">
        <div class="callback-left">
          <h2 class="callback-title">Остались вопросы?</h2>
          <p class="callback-desc">Закажите обратный звонок и наш онлайн-консультант ответит на все ваши вопросы</p>
        </div>
        <div class="callback-right">
          <input class="callback-input" type="text" placeholder="Ваше имя" />
          <input class="callback-input" type="tel" placeholder="Телефон" />
          <button class="callback-btn" type="button">Заказать звонок</button>
          <p class="callback-legal">Нажимая на кнопку "Заказать звонок", вы соглашаетесь с политикой обработки персональных данных</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.banner-slider {
  width: 100%;
  padding: 16px 20px 32px;
  position: relative;
}

.hero-contact-wrap {
  display: none;
  max-width: 1360px;
  margin: -18px auto 18px;
  padding: 0 8px;
}

@media (max-width: 640px) {
  .banner-slider {
    padding: 8px 8px 20px;
  }

  .hero-contact-wrap {
    display: block;
  }

  .slider-container {
    border-radius: 16px;
  }

  .home-page {
    padding-bottom: 24px;
  }
}

.hero-contact-btn {
  width: 100%;
  border: 0;
  border-radius: 16px;
  background: var(--accent);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  min-height: 56px;
  padding: 16px;
  cursor: pointer;
  user-select: none;
}

.home-page {
  padding-bottom: 48px;
}

/* ===== Callback form ===== */
.callback-section {
  max-width: 1400px;
  margin: 8px auto 0;
  padding: 0 20px 32px;
}

.callback-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.callback-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.callback-desc {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.55;
}

.callback-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.callback-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  padding: 14px 20px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  color: var(--text-dark);
  background: #fcf9f7;
  outline: none;
  transition: border-color 0.2s;
}

.callback-input:focus {
  border-color: var(--text-dark);
}

.callback-input::placeholder {
  color: #aaaaaa;
}

.callback-btn {
  width: 100%;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 2px;
}

.callback-btn:hover {
  background: var(--accent-hover);
}

.callback-legal {
  font-size: 11px;
  color: #aaaaaa;
  line-height: 1.5;
  text-align: center;
}

@media (max-width: 768px) {
  .callback-card {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 28px 20px;
    margin: 0 4px;
  }

  .callback-title {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .callback-section {
    padding: 0 8px 24px;
  }

  .callback-card {
    padding: 22px 16px;
    border-radius: 16px;
  }

  .callback-title {
    font-size: 20px;
  }

  .callback-input {
    padding: 13px 14px;
    font-size: 16px;
  }

  .callback-btn {
    font-size: 15px;
    padding: 14px;
  }
}

.contact-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: flex;
  justify-content: stretch;
  align-items: flex-end;
  padding: 0;
  background: rgba(17, 24, 39, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.contact-modal {
  width: 100%;
  max-width: none;
  background: #f5f5f5;
  border-radius: 28px 28px 0 0;
  padding: 22px 12px calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-modal-title {
  margin: 2px 4px 8px;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 700;
  color: #111827;
}

.contact-modal-item {
  width: 100%;
  min-height: 56px;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background: #f3f3f3;
  color: #1f2937;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
}


.slider-container {
  position: relative;
  max-width: 1360px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 32px;
  background: #000000;
  touch-action: pan-y pinch-zoom;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
  box-shadow: 0 0 8px rgba(0,0,0,0.08);
}

.slider-container:active {
  cursor: grabbing;
}

.slider-container.dragging {
  cursor: grabbing;
}

.slides-track {
  display: flex;
  width: 100%;
  will-change: transform;
}

.slide {
  flex: 0 0 100%;
  min-width: 100%;
  position: relative;
  background: #000000;
  overflow: hidden;
}

.slide-link {
  display: block;
  position: relative;
  color: inherit;
  text-decoration: none;
  height: 480px;
  overflow: hidden;
}

.slide-image-wrapper {
  width: 100%;
  height: 100%;
}

.slide-image-desktop,
.slide-image-mobile {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-image-mobile {
  display: none;
}

.slide-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%);
  color: #ffffff;
  font-size: 32px;
  font-weight: 700;
}

.slide-content {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  padding: 0 24px;
  color: #ffffff;
  text-align: center;
  z-index: 2;
}

.slide-title {
  font-size: 40px;
  line-height: 48px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.slide-subtitle {
  display: block;
  font-size: 24px;
  line-height: 32px;
  color: #ffffff;
  font-weight: 400;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.slide-buy-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 700;
  color: #007AFF;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.3s;
}

.slide-buy-link:hover {
  background: linear-gradient(45deg, #74AFFD, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.slider-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.slider-dot {
  width: 32px;
  height: 4px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: background 0.3s ease, width 0.3s ease;
  padding: 0;
  box-shadow: 0 0 4px rgba(0,0,0,0.3);
}

.slider-dot.active {
  background: rgba(255, 255, 255, 0.85);
}

.slider-dot:hover {
  background: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .banner-slider {
    padding: 12px 12px 26px;
  }

  .hero-contact-wrap {
    display: block;
    margin: -6px auto 12px;
    padding: 0 8px;
  }

  .hero-contact-btn {
    border-radius: 16px;
    min-height: 56px;
    font-size: 16px;
    padding: 16px;
  }

  .slider-container {
    border-radius: 28px;
  }

  .contact-modal-title {
    font-size: 24px;
  }

  .contact-modal-item {
    font-size: 16px;
    min-height: 56px;
  }

  .slide-image-desktop {
    display: none;
  }

  .slide-image-mobile {
    display: block;
  }

  .slide-link {
    height: 400px;
  }

  .slide-content {
    top: 28px;
    padding: 0 16px;
  }

  .slide-title {
    font-size: 28px;
    line-height: 34px;
  }

  .slide-subtitle {
    font-size: 18px;
    line-height: 24px;
  }

  .slide-buy-link {
    padding: 12px 24px;
    font-size: 14px;
  }

  .slider-dots {
    bottom: 12px;
    gap: 10px;
  }

  .slider-dot {
    width: 30px;
  }
}

@media (max-width: 480px) {
  .banner-slider {
    padding: 8px 10px 20px;
  }

  .hero-contact-wrap {
    padding: 0 8px;
  }

  .hero-contact-btn {
    min-height: 56px;
    font-size: 16px;
    padding: 16px;
  }

  .contact-modal-overlay {
    padding: 0;
  }

  .contact-modal {
    border-radius: 24px 24px 0 0;
    padding: 18px 10px calc(10px + env(safe-area-inset-bottom));
    gap: 8px;
  }

  .contact-modal-title {
    font-size: 22px;
    margin-bottom: 6px;
  }

  .contact-modal-item {
    min-height: 56px;
    font-size: 15px;
    border-radius: 16px;
  }

  .slider-container {
    border-radius: 24px;
  }

  .slide-link {
    height: 300px;
  }

  .slide-content {
    top: 20px;
    padding: 0 12px;
  }

  .slide-title {
    font-size: 24px;
    line-height: 30px;
  }

  .slide-subtitle {
    font-size: 16px;
    line-height: 22px;
  }

  .slide-buy-link {
    padding: 10px 20px;
    font-size: 13px;
  }

  .slider-dot {
    width: 22px;
  }
}
</style>