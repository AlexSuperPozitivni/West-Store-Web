import { computed, ref, watch } from 'vue'

export interface CartItem {
  id: number
  slug: string
  name: string
  price: number
  qty: number
  image: string
  attrs: string[]
}

const STORAGE_KEY = 'ws_cart'
const cartItems = ref<CartItem[]>([])
let initialized = false
let watching = false

const safeParse = (raw: string) => {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeAttrs = (attrs: string[] = []) => {
  return attrs
    .map((attr) => String(attr).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'ru'))
}

const buildKey = (slug: string, attrs: string[]) => `${slug}::${normalizeAttrs(attrs).join('|')}`

const readCookie = () => {
  if (typeof document === 'undefined') return [] as CartItem[]
  const match = document.cookie.split('; ').find(row => row.startsWith(`${STORAGE_KEY}=`))
  if (!match) return []
  const raw = match.split('=')[1]
  if (!raw) return []
  return safeParse(decodeURIComponent(raw))
}

const readLocal = () => {
  if (typeof localStorage === 'undefined') return [] as CartItem[]
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return safeParse(raw)
}

const writeCookie = (items: CartItem[]) => {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(JSON.stringify(items))
  const maxAge = 60 * 60 * 24 * 14
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
}

const writeLocal = (items: CartItem[]) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota errors
  }
}

const readCart = () => {
  const fromCookie = readCookie()
  if (fromCookie.length > 0) return fromCookie
  const fromLocal = readLocal()
  if (fromLocal.length > 0) {
    writeCookie(fromLocal)
  }
  return fromLocal
}

const writeCart = (items: CartItem[]) => {
  writeCookie(items)
  writeLocal(items)
}

const loadCart = () => {
  cartItems.value = readCart()
  initialized = true
}

const saveCart = () => {
  writeCart(cartItems.value)
}

const addItem = (item: CartItem) => {
  if (!initialized) {
    loadCart()
  }
  const attrs = normalizeAttrs(item.attrs || [])
  const key = buildKey(item.slug, attrs)
  const idx = cartItems.value.findIndex(i => buildKey(i.slug, i.attrs) === key)
  if (idx >= 0) {
    cartItems.value[idx].qty += Math.max(1, item.qty)
  } else {
    cartItems.value.push({
      ...item,
      qty: Math.max(1, item.qty),
      attrs
    })
  }
  saveCart()
}

const removeItem = (slug: string, attrs: string[]) => {
  if (!initialized) {
    loadCart()
  }
  const key = buildKey(slug, attrs)
  cartItems.value = cartItems.value.filter(i => buildKey(i.slug, i.attrs) !== key)
  saveCart()
}

const setQty = (slug: string, attrs: string[], qty: number) => {
  if (!initialized) {
    loadCart()
  }
  if (qty <= 0) {
    removeItem(slug, attrs)
    return
  }
  const key = buildKey(slug, attrs)
  const idx = cartItems.value.findIndex(i => buildKey(i.slug, i.attrs) === key)
  if (idx === -1) return
  cartItems.value[idx].qty = qty
  saveCart()
}

const clearCart = () => {
  cartItems.value = []
  saveCart()
}

const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))
const cartTotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.qty, 0))

const ensureWatch = () => {
  if (watching) return
  watching = true
  watch(cartItems, (items) => writeCart(items), { deep: true })
}

export const useCart = () => {
  if (!initialized) {
    loadCart()
  }
  ensureWatch()

  return {
    cartItems,
    cartCount,
    cartTotal,
    loadCart,
    addItem,
    removeItem,
    setQty,
    clearCart
  }
}
