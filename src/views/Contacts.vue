<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSeo } from '../lib/useSeo'

useSeo({
  title: 'Контакты',
  description: 'Контакты магазина ONLYPHONES. Адрес: Москва, ул. Барклая 8. Телефон: +7 (929) 955 6487. WhatsApp, Telegram.'
})

const form = ref({ name: '', phone: '' })
const submitted = ref(false)

const handleSubmit = () => {
  if (!form.value.name || !form.value.phone) return
  submitted.value = true
  setTimeout(() => { submitted.value = false; form.value = { name: '', phone: '' } }, 3000)
}

const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
}

onMounted(() => {
  observeElements()
})
</script>

<template>
  <div class="contacts-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">Контакты</div>
        <h1 class="hero-title">Свяжитесь с нами</h1>
        <p class="hero-subtitle">
          Мы всегда на связи и готовы помочь вам с выбором техники, оформлением заказа или ответить на любые вопросы.
        </p>
      </div>
    </section>

    <!-- Contact Cards -->
    <section class="contacts animate-on-scroll">
      <div class="section-container">
        <div class="contacts-grid">
          <!-- Phone -->
          <div class="contact-card">
            <span class="contact-icon">📞</span>
            <h3>Телефон</h3>
            <a href="tel:+79299556487" class="contact-link contact-link--phone">+7 (929) 955 6487</a>
            <p class="contact-note">Звоните ежедневно с 10:00 до 21:00</p>
          </div>

          <!-- Messengers -->
          <div class="contact-card">
            <span class="contact-icon">💬</span>
            <h3>Мессенджеры</h3>
            <div class="messenger-links">
              <a href="https://t.me/weststore_msk" target="_blank" rel="noopener" class="messenger-link">
                <span class="messenger-badge tg">TG</span>
                @weststore_msk
              </a>
              <a href="https://wa.me/79299556487" target="_blank" rel="noopener" class="messenger-link">
                <span class="messenger-badge wa">WA</span>
                +7 929 955 6487
              </a>
            </div>
          </div>

          <!-- Address -->
          <div class="contact-card">
            <span class="contact-icon">📍</span>
            <h3>Адрес</h3>
            <p class="contact-address">г. Москва, ул. Барклая 8,<br>магазин 171</p>
            <p class="contact-hours">10:00 – 21:00 ежедневно</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Placeholder -->
    <section class="map-section animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Как нас найти</h2>
        <p class="section-subtitle">Мы находимся рядом с метро Багратионовская</p>
        <div class="map-placeholder">
          <div class="map-inner">
            <span class="map-icon">🗺️</span>
            <p class="map-text">Яндекс Карта</p>
            <p class="map-address">г. Москва, ул. Барклая 8, магазин 171</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Callback Form -->
    <section id="form" class="form-section animate-on-scroll">
      <div class="section-container">
        <div class="form-wrapper">
          <div class="form-text">
            <h2>Обратный звонок</h2>
            <p>Оставьте заявку и мы перезвоним вам в течение 15 минут. Ответим на все вопросы и поможем с выбором.</p>
            <div class="form-features">
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Бесплатная консультация</span>
              </div>
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Перезвоним за 15 минут</span>
              </div>
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Без обязательств</span>
              </div>
            </div>
          </div>
          <form class="callback-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <input v-model="form.name" type="text" placeholder="Ваше имя" required />
            </div>
            <div class="form-group">
              <input v-model="form.phone" type="tel" placeholder="Телефон" required />
            </div>
            <button type="submit" class="btn-submit" :class="{ success: submitted }">
              {{ submitted ? '✓ Заявка отправлена' : 'Заказать звонок' }}
            </button>
            <p class="form-privacy">
              Нажимая кнопку, вы соглашаетесь с
              <a href="#">политикой обработки персональных данных</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contacts-page {
  background: var(--bg-main);
}

/* ===== Hero ===== */
.hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 80px 0 90px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ===== Sections ===== */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-dark);
  text-align: center;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 48px;
}

/* ===== Contact Cards ===== */
.contacts {
  padding: 80px 0;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.contact-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 40px 28px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
}

.contact-icon {
  font-size: 44px;
  display: block;
  margin-bottom: 20px;
}

.contact-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 16px;
}

.contact-link {
  display: block;
  color: var(--accent-blue);
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: var(--accent-blue-hover);
}

.contact-link--phone {
  font-size: 20px;
  margin-bottom: 12px;
}

.contact-note {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

.contact-address {
  font-size: 15px;
  color: var(--text-main);
  line-height: 1.6;
  margin-bottom: 12px;
}

.contact-hours {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

/* ===== Messenger Links ===== */
.messenger-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.messenger-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-main);
  color: var(--text-main);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.messenger-link:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.messenger-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.messenger-badge.tg {
  background: #2AABEE;
}

.messenger-badge.wa {
  background: #25D366;
}

/* ===== Map ===== */
.map-section {
  padding: 80px 0;
  background: #ffffff;
}

.map-placeholder {
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #f0f4ff 0%, #e8edf5 100%);
  border: 2px dashed var(--border-color);
  overflow: hidden;
}

.map-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.map-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.map-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.map-address {
  font-size: 15px;
  color: var(--text-muted);
}

/* ===== Form ===== */
.form-section {
  padding: 80px 0;
}

.form-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.form-text h2 {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 16px;
}

.form-text p {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}

.form-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 500;
}

.callback-form {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 36px;
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-family: inherit;
  background: var(--bg-main);
  color: var(--text-dark);
  transition: border-color 0.2s ease;
  outline: none;
}

.form-group input:focus {
  border-color: var(--accent-blue);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.btn-submit {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-submit.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.form-privacy {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
}

.form-privacy a {
  color: var(--accent-blue);
  text-decoration: underline;
}

/* ===== Scroll Animations ===== */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .hero {
    padding: 60px 0 70px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .section-title {
    font-size: 28px;
  }

  .contacts-grid {
    grid-template-columns: 1fr;
  }

  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .contacts,
  .map-section,
  .form-section {
    padding: 50px 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 26px;
  }

  .callback-form {
    padding: 24px;
  }

  .map-inner {
    padding: 50px 20px;
  }
}
</style>
