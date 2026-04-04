<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { useCart } from '../lib/cart'

interface CartItem {
  id: number
  slug: string
  name: string
  price: number
  qty: number
  image: string
  attrs: string[]
}

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')

const { cartItems, cartTotal, loadCart, setQty, removeItem } = useCart()

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}/${cleanPath}`
}

const updateQty = (item: CartItem, delta: number) => {
  const next = item.qty + delta
  if (next < 1) return
  setQty(item.slug, item.attrs, next)
}

const remove = (item: CartItem) => {
  removeItem(item.slug, item.attrs)
}

const orderSending = ref(false)
const orderSent = ref(false)
const showOrderModal = ref(false)
const orderName = ref('')
const orderPhone = ref('')
const orderError = ref('')

const openOrderModal = () => {
  orderName.value = ''
  orderPhone.value = ''
  orderError.value = ''
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
}

const submitOrder = async () => {
  if (!orderName.value.trim()) {
    orderError.value = 'Пожалуйста, введите ваше имя'
    return
  }
  if (!orderPhone.value.trim()) {
    orderError.value = 'Пожалуйста, введите номер телефона'
    return
  }

  orderError.value = ''
  orderSending.value = true

  try {
    await axios.post('/bot/order', {
      name: orderName.value.trim(),
      phone: orderPhone.value.trim(),
      items: cartItems.value.map(i => ({
        name: i.name,
        attrs: i.attrs,
        qty: i.qty,
        price: i.price,
      })),
      total: cartTotal.value,
    })

    showOrderModal.value = false
    orderSent.value = true
    setTimeout(() => { orderSent.value = false }, 6000)
  } catch {
    orderError.value = 'Ошибка отправки. Позвоните нам: +7 (909) 95 12345'
  } finally {
    orderSending.value = false
  }
}

onMounted(() => {
  loadCart()
})
</script>

<template>
  <div class="cart-page">
    <div class="container cart-container">
      <h1 class="cart-title">Ваш заказ</h1>

      <div class="cart-list">
        <div v-if="cartItems.length === 0" class="cart-empty">
          <p>Корзина пуста</p>
          <RouterLink to="/catalog" class="cart-empty__link">Вернуться в магазин</RouterLink>
        </div>

        <div
          v-for="item in cartItems"
          :key="item.slug + item.attrs.join('|')"
          class="cart-item"
        >
          <div class="cart-item__image">
            <img :src="getImageUrl(item.image)" :alt="item.name" />
          </div>

          <div class="cart-item__content">
            <div class="cart-item__name">{{ item.name }}</div>
            <div v-if="item.attrs.length" class="cart-item__attrs">
              <span v-for="attr in item.attrs" :key="attr">{{ attr }}</span>
            </div>

            <div class="cart-item__qty">
              <span class="cart-item__qty-label">Количество</span>
              <div class="qty-control">
                <button type="button" class="qty-button" @click="updateQty(item, -1)">-</button>
                <span class="qty-value">{{ item.qty }}</span>
                <button type="button" class="qty-button" @click="updateQty(item, 1)">+</button>
              </div>
            </div>
          </div>

          <div class="cart-item__price">
            <div class="cart-item__price-value">
              {{ (item.price * item.qty).toLocaleString('ru-RU') }} ₽
            </div>
            <button class="cart-item__remove" type="button" @click="remove(item)">Удалить</button>
          </div>
        </div>
      </div>

      <div v-if="cartItems.length > 0" class="cart-total-card">
        <div>Итого к оплате</div>
        <div>{{ cartTotal.toLocaleString('ru-RU') }} ₽</div>
      </div>

      <div v-if="orderSent" class="order-success">
        ✅ Заказ принят! Мы свяжемся с вами в ближайшее время.
      </div>

      <div v-if="cartItems.length > 0" class="cart-actions">
        <RouterLink to="/" class="cart-back">← Вернуться в магазин</RouterLink>
        <button class="cart-checkout" type="button" @click="openOrderModal">
          Оформить заказ
        </button>
      </div>

      <!-- Модальное окно оформления заказа -->
      <Teleport to="body">
        <div v-if="showOrderModal" class="order-modal-overlay" @click.self="closeOrderModal">
          <div class="order-modal">
            <button class="order-modal__close" @click="closeOrderModal">✕</button>

            <h2 class="order-modal__title">Оформление заказа</h2>
            <p class="order-modal__subtitle">Оставьте контакты — менеджер свяжется с вами для подтверждения</p>

            <div class="order-modal__summary">
              <div v-for="item in cartItems" :key="item.slug" class="order-modal__item">
                <span class="order-modal__item-name">{{ item.name }}<span v-if="item.attrs.length"> ({{ item.attrs.join(', ') }})</span></span>
                <span class="order-modal__item-price">{{ (item.price * item.qty).toLocaleString('ru-RU') }} ₽</span>
              </div>
              <div class="order-modal__total">
                <span>Итого</span>
                <span>{{ cartTotal.toLocaleString('ru-RU') }} ₽</span>
              </div>
            </div>

            <div class="order-modal__fields">
              <input
                v-model="orderName"
                class="order-modal__input"
                type="text"
                placeholder="Ваше имя *"
                :disabled="orderSending"
              />
              <input
                v-model="orderPhone"
                class="order-modal__input"
                type="tel"
                placeholder="Номер телефона *"
                :disabled="orderSending"
              />
              <p v-if="orderError" class="order-modal__error">{{ orderError }}</p>
              <button
                class="order-modal__submit"
                type="button"
                :disabled="orderSending"
                @click="submitOrder"
              >
                {{ orderSending ? 'Отправляем...' : 'Подтвердить заказ' }}
              </button>
              <p class="order-modal__legal">Нажимая кнопку, вы соглашаетесь на обработку персональных данных</p>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  min-height: 100vh;
  padding: 40px 0 80px;
  background: var(--background, #f3f3f3);
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.cart-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #111827;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cart-item {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 28px;
  display: grid;
  grid-template-columns: 160px 1fr 160px;
  gap: 24px;
  align-items: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.cart-item__image {
  width: 140px;
  height: 140px;
  border-radius: 18px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cart-item__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item__name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.cart-item__attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #6b7280;
  font-size: 14px;
}

.cart-item__qty {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.qty-button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 18px;
  cursor: pointer;
}

.qty-value {
  min-width: 18px;
  text-align: center;
  font-weight: 600;
  color: #111827;
}

.cart-item__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  text-align: right;
}

.cart-item__price-value {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.cart-item__remove {
  border: none;
  background: none;
  color: #2563eb;
  font-size: 14px;
  cursor: pointer;
}

.cart-total-card {
  margin-top: 28px;
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.cart-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
}

.cart-back {
  color: var(--accent-blue);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.cart-checkout {
  border: none;
  background: var(--accent);
  color: #ffffff;
  padding: 14px 32px;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(50, 55, 60, 0.25);
}

.order-success {
  margin-top: 20px;
  padding: 16px 24px;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 14px;
  color: #065f46;
  font-weight: 600;
  font-size: 15px;
  text-align: center;
}

/* ── Модальное окно заказа ── */
.order-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.order-modal {
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.order-modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f3f3f3;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-modal__title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}

.order-modal__subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.5;
}

.order-modal__summary {
  background: #f9fafb;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-modal__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #374151;
}

.order-modal__item-name {
  flex: 1;
}

.order-modal__item-price {
  font-weight: 600;
  white-space: nowrap;
}

.order-modal__total {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  margin-top: 4px;
}

.order-modal__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-modal__input {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 9999px;
  padding: 14px 20px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  color: #111827;
  outline: none;
  transition: border-color 0.2s;
  background: #fcf9f7;
}

.order-modal__input:focus {
  border-color: var(--text-dark);
}

.order-modal__input::placeholder {
  color: #aaa;
}

.order-modal__input:disabled {
  opacity: 0.6;
}

.order-modal__error {
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

.order-modal__submit {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 9999px;
  padding: 15px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  margin-top: 4px;
}

.order-modal__submit:hover:not(:disabled) {
  background: var(--accent-hover);
}

.order-modal__submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.order-modal__legal {
  font-size: 11px;
  color: #aaa;
  text-align: center;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .order-modal {
    padding: 24px 18px;
    border-radius: 20px;
  }

  .order-modal__title {
    font-size: 19px;
  }
}

.cart-checkout:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.cart-empty {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.cart-empty__link {
  display: inline-flex;
  margin-top: 16px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 900px) {
  .cart-item {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .cart-item__price {
    align-items: flex-start;
    text-align: left;
  }

  .cart-actions {
    flex-direction: column-reverse;
    align-items: flex-start;
  }

  .cart-checkout {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .cart-title {
    font-size: 26px;
  }

  .cart-item {
    padding: 16px;
    border-radius: 16px;
  }

  .cart-item__image {
    width: 100px;
    height: 100px;
  }

  .cart-item__name {
    font-size: 15px;
  }

  .cart-checkout {
    padding: 13px 20px;
    font-size: 14px;
  }

  .cart-total-card {
    font-size: 14px;
    padding: 14px 16px;
    border-radius: 14px;
  }

  .cart-page {
    padding: 20px 0 60px;
  }

  .cart-container {
    padding: 0 12px;
  }
}
</style>

