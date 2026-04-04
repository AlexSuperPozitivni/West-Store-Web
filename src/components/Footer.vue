<script setup lang="ts">
import { ref } from 'vue'

const currentYear = new Date().getFullYear()

const categories = [
  'iPhone', 'iPad', 'MacBook', 'Watch', 'Apple TV', 'Mac',
  'Аксессуары', 'DJI', 'Playstation', 'Samsung', 'Ноутбуки', 'Dyson'
]

const storeLinks = [
  'Трейд-ин', 'Ремонт', 'О магазине', 'Доставка и оплата',
  'Схема проезда', 'Политика в отношении обработки персональных данных'
]
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-grid">
        
        <div class="footer-column">
          <h3 class="footer-title">Интернет-магазин</h3>
          <ul class="footer-links">
            <li v-for="item in categories" :key="item">
              <a href="#" class="footer-link">{{ item }}</a>
            </li>
          </ul>
        </div>

        <div class="footer-column">
          <h3 class="footer-title">Магазин</h3>
          
          <div class="store-info">
            <p class="store-address">
              г. Москва<br>
              ул. Барклая 8<br>
              <span class="gray-text">магазин 171</span>
            </p>
            
            <div class="working-hours">
              <p>Время работы:</p>
              <p class="hours-time">10:00 – 21:00</p>
              <p class="gray-text">ежедневно</p>
            </div>
          </div>

          <ul class="footer-links">
            <li v-for="link in storeLinks" :key="link">
              <a href="#" class="footer-link">{{ link }}</a>
            </li>
          </ul>
        </div>

        <div class="footer-column">
          <h3 class="footer-title">Контакты</h3>
          
          <div class="contacts-block">
            <div class="phone-block">
              <a href="tel:+74951512345" class="phone-number">+7 (495) 15 12345</a>
              <span class="phone-label">многоканальный</span>
            </div>

            <div class="phone-block">
              <a href="tel:+79099512345" class="phone-number">+7 (909) 95 12345</a>
              <span class="phone-label">iMessage, Telegram, Viber, SMS</span>
            </div>

            <div class="messenger-links">
              <a href="#" class="messenger-link">написать в Telegram</a>
              <a href="#" class="messenger-link">написать в WhatsApp</a>
            </div>

            <div class="payment-systems">
              <div class="payment-icons">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="VISA" class="payment-icon">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" class="payment-icon">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Maestro" class="payment-icon">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/27/Mir_Payment_System_logo.svg" alt="МИР" class="payment-icon">
              </div>
              <p class="payment-text">Оплата картой +16%</p>
            </div>
          </div>
        </div>

        <div class="footer-column social-column">
          <div class="brand-logo">
            ONLYPHONES
          </div>
          
          <p class="social-label">в социальных сетях</p>
          
          <div class="social-icons">
            <a href="#" class="social-icon" title="OK">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </a>
            <a href="#" class="social-icon" title="VK">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12.727 19.937c4.651 0 5.238-3.219 5.238-4.587 0-1.272-.622-1.828-1.603-1.828-.96 0-1.26.534-2.11 1.418-.758.792-1.083.792-1.475.792-2.11 0-4.02-4.02-4.02-5.495 0-.512.192-1.226 1.453-1.226.917 0 1.248.32 1.603 1.112.874 1.95 1.166 1.95 1.58 1.95h1.227c.534 0 .666-.405.666-1.495 0-1.603-.448-2.29-2.094-2.29-2.667 0-4.45 1.41-4.45 3.723 0 1.58 1.067 4.65 3.017 6.232 1.003.82 1.94.82 2.568.82z"/>
              </svg>
            </a>
            <a href="#" class="social-icon" title="YouTube">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </a>
          </div>

          <div class="social-extra">
            <a href="#" class="extra-link">отзывы о нас</a>
            <a href="#" class="extra-link">мы на Avito</a>
          </div>

          <div class="social-icons-bottom">
            <a href="#" class="social-icon" title="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" class="social-icon" title="Maps">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
            <a href="#" class="social-icon avito" title="Avito">
              <svg viewBox="0 0 100 30" width="60" height="20">
                <text x="0" y="20" fill="currentColor" font-size="18" font-weight="bold">Avito</text>
              </svg>
            </a>
          </div>

          <div class="copyright">
            <p>© ONLYPHONES 2012-{{ currentYear }}</p>
            <p class="legal-text">
              Сайт носит сугубо информационный характер и не является публичной офертой, определяемой Статьей 437(2) ГК РФ.
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* ===== Footer ===== */
.footer {
  background-color: #e8e4e0;
  padding: 60px 0 40px;
  margin-top: auto;
  position: relative;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-bottom: 40px;
}

/* ===== Колонки ===== */
.footer-column {
  display: flex;
  flex-direction: column;
}

.footer-title {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
  line-height: 1.4;
}

/* ===== Ссылки ===== */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  color: #333333;
  text-decoration: none;
  font-size: 14px;
  line-height: 1.5;
  transition: color 0.2s ease;
  display: block;
}

.footer-link:hover {
  color: #26242d;
}

/* ===== Информация о магазине ===== */
.store-info {
  margin-bottom: 20px;
}

.store-address {
  font-size: 14px;
  line-height: 1.6;
  color: #333333;
  margin-bottom: 20px;
}

.gray-text {
  color: #999999;
}

.working-hours p {
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.hours-time {
  font-weight: 500;
  color: #000000;
}

/* ===== Контакты ===== */
.contacts-block {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.phone-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.phone-number {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  text-decoration: none;
  transition: color 0.2s ease;
}

.phone-number:hover {
  color: #26242d;
}

.phone-label {
  font-size: 12px;
  color: #999999;
}

.messenger-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.messenger-link {
  font-size: 14px;
  color: #000000;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.messenger-link:hover {
  color: #26242d;
}

/* ===== Платежные системы ===== */
.payment-systems {
  margin-top: 10px;
}

.payment-icons {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  opacity: 0.7;
}

.payment-icon {
  height: 24px;
  width: auto;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.payment-icons:hover .payment-icon {
  filter: grayscale(0%);
}

.payment-text {
  font-size: 13px;
  color: #999999;
  margin: 0;
}

/* ===== Социальная колонка ===== */
.social-column {
  align-items: flex-start;
}

.brand-logo {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #000000;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.social-label {
  font-size: 13px;
  color: #666666;
  margin-bottom: 15px;
}

.social-icons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.social-icon {
  width: 44px;
  height: 44px;
  background: #FFFFFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.social-icon:hover {
  color: #26242d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.social-icon.avito {
  width: auto;
  padding: 0 15px;
}

.social-extra {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.extra-link {
  font-size: 12px;
  color: #666666;
  text-decoration: none;
  transition: color 0.2s ease;
}

.extra-link:hover {
  color: #0066CC;
}

.social-icons-bottom {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.copyright {
  margin-top: auto;
}

.copyright p {
  font-size: 12px;
  color: #999999;
  line-height: 1.6;
  margin: 0;
}

.legal-text {
  margin-top: 10px;
  font-size: 11px;
  max-width: 280px;
}

/* ===== Кнопка чата ===== */
.chat-button {
  position: fixed;
  bottom: 30px;
  left: 30px;
  width: 60px;
  height: 60px;
  background: #25D366;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
}

.chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(37, 211, 102, 0.5);
}

.chat-button:active {
  transform: scale(0.95);
}

/* ===== Адаптивность ===== */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 0 80px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-title {
    font-size: 15px;
    margin-bottom: 15px;
  }

  .footer-link {
    font-size: 13px;
  }

  .phone-number {
    font-size: 15px;
  }

  .social-column {
    align-items: flex-start;
  }

  .brand-logo {
    font-size: 16px;
  }

  .social-icons,
  .social-icons-bottom {
    flex-wrap: wrap;
  }

  .chat-button {
    bottom: 20px;
    left: 20px;
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 15px;
  }

  .payment-icons {
    flex-wrap: wrap;
  }

  .payment-icon {
    height: 20px;
  }

  .social-extra {
    flex-direction: column;
    gap: 10px;
  }

  .legal-text {
    max-width: 100%;
  }
}
</style>