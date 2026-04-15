<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSeo } from '../lib/useSeo'

useSeo({ title: 'Trade-In', description: 'Обменяйте старую технику на новую с выгодой. Лучшие цены на выкуп iPhone, iPad, MacBook в Москве.' })

const form = ref({ name: '', phone: '' })
const submitted = ref(false)

const devices = [
  { title: 'iPhone', image: '📱', description: 'Все модели iPhone от 8 до 17 Pro Max' },
  { title: 'iPad', image: '📋', description: 'iPad, iPad Air, iPad Pro, iPad mini' },
  { title: 'Apple Watch', image: '⌚', description: 'Watch Series 4 и новее, Ultra' },
  { title: 'MacBook', image: '💻', description: 'MacBook Air, MacBook Pro все поколения' },
  { title: 'Samsung', image: '📲', description: 'Galaxy S, Galaxy Z, Galaxy Tab' },
  { title: 'AirPods', image: '🎧', description: 'AirPods, AirPods Pro, AirPods Max' },
]

const steps = [
  {
    number: '01',
    icon: '💻',
    title: 'Рассчитайте стоимость',
    description: 'Опишите ваш гаджет — модель, состояние, комплектацию. Мы оценим его и предложим лучшую цену.'
  },
  {
    number: '02',
    icon: '🏪',
    title: 'Принесите устройство',
    description: 'Приходите к нам в магазин — наш специалист осмотрит устройство и подтвердит оценку на месте.'
  },
  {
    number: '03',
    icon: '💸',
    title: 'Получите деньги',
    description: 'Техосмотр специалистом на месте. Моментальная выплата наличными или обмен с доплатой на новое устройство.'
  }
]

const advantages = [
  { icon: '⚡', title: 'Быстрая оценка', text: 'Узнайте стоимость за 5 минут' },
  { icon: '💰', title: 'Лучшие цены', text: 'Самые выгодные условия в Москве' },
  { icon: '🔄', title: 'Обмен с доплатой', text: 'Сдайте старое — получите новое' },
]

const handleSubmit = () => {
  if (!form.value.name || !form.value.phone) return
  submitted.value = true
  setTimeout(() => { submitted.value = false; form.value = { name: '', phone: '' } }, 3000)
}

// Intersection Observer для анимаций
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
  <div class="trade-in-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">Trade-In</div>
        <h1 class="hero-title">Обменяйте старую технику<br><span class="highlight">на новую с выгодой</span></h1>
        <p class="hero-subtitle">
          Мы готовы выкупить ваши старые гаджеты или обменять на новые на самых выгодных условиях в Москве
        </p>
        <div class="hero-actions">
          <a href="#form" class="btn-primary">Оценить устройство</a>
          <a href="#how-it-works" class="btn-secondary">Как это работает</a>
        </div>
      </div>
    </section>

    <!-- Преимущества -->
    <section class="advantages animate-on-scroll">
      <div class="section-container">
        <div class="advantages-grid">
          <div v-for="(adv, i) in advantages" :key="i" class="advantage-card" :style="{ animationDelay: i * 0.1 + 's' }">
            <span class="advantage-icon">{{ adv.icon }}</span>
            <h3>{{ adv.title }}</h3>
            <p>{{ adv.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Устройства -->
    <section class="devices animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Какие устройства принимаем</h2>
        <p class="section-subtitle">Принимаем технику Apple, Samsung и другие бренды в любом состоянии</p>
        <div class="devices-grid">
          <div v-for="(device, i) in devices" :key="i" class="device-card" :style="{ animationDelay: i * 0.08 + 's' }">
            <span class="device-icon">{{ device.image }}</span>
            <h3>{{ device.title }}</h3>
            <p>{{ device.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section id="how-it-works" class="how-it-works animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Как это работает</h2>
        <p class="section-subtitle">Три простых шага для обмена вашего устройства</p>
        <div class="steps-grid">
          <div v-for="(step, i) in steps" :key="i" class="step-card" :style="{ animationDelay: i * 0.15 + 's' }">
            <div class="step-number">{{ step.number }}</div>
            <span class="step-icon">{{ step.icon }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <div v-if="i < steps.length - 1" class="step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Форма -->
    <section id="form" class="form-section animate-on-scroll">
      <div class="section-container">
        <div class="form-wrapper">
          <div class="form-text">
            <h2>Остались вопросы?</h2>
            <p>Оставьте заявку и мы перезвоним вам в течение 15 минут. Оценим ваше устройство и предложим лучшую цену.</p>
            <div class="form-features">
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Бесплатная консультация</span>
              </div>
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Оценка за 5 минут</span>
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
.trade-in-page {
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

.hero-title .highlight {
  background: linear-gradient(135deg, #60a5fa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto 36px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
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

/* ===== Advantages ===== */
.advantages {
  padding: 70px 0;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.advantage-card {
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 30px 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.advantage-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border-color: var(--border-color);
}

.advantage-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 16px;
}

.advantage-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.advantage-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ===== Devices ===== */
.devices {
  padding: 70px 0;
  background: #ffffff;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.device-card {
  background: var(--bg-main);
  border-radius: var(--radius-md);
  padding: 36px 28px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.device-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-blue);
}

.device-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.device-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.device-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ===== How it works ===== */
.how-it-works {
  padding: 80px 0;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  position: relative;
}

.step-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 40px 28px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
}

.step-number {
  position: absolute;
  top: -14px;
  left: 28px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.step-icon {
  font-size: 44px;
  display: block;
  margin-bottom: 20px;
}

.step-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.step-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.step-arrow {
  display: none;
}

/* ===== Form ===== */
.form-section {
  padding: 80px 0;
  background: #ffffff;
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
  background: var(--bg-main);
  border-radius: var(--radius-lg);
  padding: 36px;
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
  background: #ffffff;
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
@media (max-width: 1024px) {
  .advantages-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

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

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 28px;
  }

  .advantages-grid,
  .devices-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .advantages,
  .devices,
  .how-it-works,
  .form-section {
    padding: 50px 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 26px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }

  .callback-form {
    padding: 24px;
  }
}
</style>
