<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSeo } from '../lib/useSeo'

useSeo({ title: 'Ремонт', description: 'Профессиональный ремонт iPhone, iPad, MacBook, Apple Watch в Москве. Бесплатная диагностика, оригинальные запчасти.' })

const form = ref({ name: '', phone: '' })
const submitted = ref(false)

const services = [
  {
    title: 'iPhone',
    icon: '📱',
    items: ['Замена экрана', 'Замена батареи', 'Ремонт Face ID', 'Замена камеры', 'Ремонт разъёма', 'Восстановление после воды']
  },
  {
    title: 'iPad',
    icon: '📋',
    items: ['Замена дисплея', 'Замена батареи', 'Ремонт разъёма', 'Замена кнопки Home', 'Ремонт динамика', 'Замена корпуса']
  },
  {
    title: 'MacBook',
    icon: '💻',
    items: ['Замена матрицы', 'Замена клавиатуры', 'Замена батареи', 'Ремонт материнской платы', 'Замена SSD', 'Чистка от пыли']
  },
  {
    title: 'Apple Watch',
    icon: '⌚',
    items: ['Замена экрана', 'Замена батареи', 'Ремонт кнопки', 'Замена тачскрина', 'Восстановление после воды']
  },
  {
    title: 'AirPods',
    icon: '🎧',
    items: ['Замена батареи', 'Ремонт кейса', 'Замена динамика', 'Ремонт зарядки', 'Замена микрофона']
  },
  {
    title: 'iMac / Mac',
    icon: '🖥️',
    items: ['Замена HDD/SSD', 'Апгрейд RAM', 'Ремонт блока питания', 'Замена дисплея', 'Чистка и обслуживание']
  }
]

const steps = [
  {
    number: '01',
    icon: '🔍',
    title: 'Рассчитайте стоимость',
    description: 'Опишите проблему — мы проведём бесплатную диагностику и сообщим точную стоимость ремонта.'
  },
  {
    number: '02',
    icon: '🏪',
    title: 'Принесите устройство',
    description: 'Если цена устраивает — приходите к нам в сервис. Наш мастер примет устройство и начнёт работу.'
  },
  {
    number: '03',
    icon: '✅',
    title: 'Получите исправный девайс',
    description: 'Быстрый и качественный ремонт. Гарантия на все виды работ от 3 до 12 месяцев.'
  }
]

const guarantees = [
  { icon: '🔧', title: 'Оригинальные запчасти', text: 'Используем только сертифицированные комплектующие' },
  { icon: '⏱️', title: 'Быстрый ремонт', text: 'Большинство ремонтов за 1-2 часа' },
  { icon: '💯', title: 'Бесплатная диагностика', text: 'Точная стоимость до начала работ' },
]

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
  <div class="repair-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">Сервисный центр</div>
        <h1 class="hero-title">Ремонт техники<br><span class="highlight">Apple в Москве</span></h1>
        <p class="hero-subtitle">
          Профессиональный ремонт iPhone, iPad, MacBook, Apple Watch и другой техники. Бесплатная диагностика и гарантия на все работы.
        </p>
        <div class="hero-actions">
          <a href="#form" class="btn-primary">Оставить заявку</a>
          <a href="#services" class="btn-secondary">Наши услуги</a>
        </div>
      </div>
    </section>

    <!-- Гарантии -->
    <section class="guarantees animate-on-scroll">
      <div class="section-container">
        <div class="guarantees-grid">
          <div v-for="(g, i) in guarantees" :key="i" class="guarantee-card">
            <span class="guarantee-icon">{{ g.icon }}</span>
            <h3>{{ g.title }}</h3>
            <p>{{ g.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Услуги -->
    <section id="services" class="services animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Наши услуги</h2>
        <p class="section-subtitle">Ремонтируем все устройства Apple с гарантией качества</p>
        <div class="services-grid">
          <div v-for="(service, i) in services" :key="i" class="service-card">
            <div class="service-header">
              <span class="service-icon">{{ service.icon }}</span>
              <h3>Ремонт {{ service.title }}</h3>
            </div>
            <ul class="service-list">
              <li v-for="item in service.items" :key="item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ item }}
              </li>
            </ul>
            <a href="#form" class="service-link">Узнать стоимость →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section class="how-it-works animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Как проходит ремонт</h2>
        <p class="section-subtitle">Прозрачный процесс от диагностики до выдачи</p>
        <div class="steps-grid">
          <div v-for="(step, i) in steps" :key="i" class="step-card">
            <div class="step-number">{{ step.number }}</div>
            <span class="step-icon">{{ step.icon }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Форма -->
    <section id="form" class="form-section animate-on-scroll">
      <div class="section-container">
        <div class="form-wrapper">
          <div class="form-text">
            <h2>Нужен ремонт?</h2>
            <p>Оставьте заявку — мы проведём бесплатную диагностику и сообщим точную стоимость ремонта. Без навязывания услуг.</p>
            <div class="form-features">
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Бесплатная диагностика</span>
              </div>
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Гарантия до 12 месяцев</span>
              </div>
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Перезвоним за 15 минут</span>
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
.repair-page {
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
  background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%);
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
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
}

.hero-title .highlight {
  background: linear-gradient(135deg, #f87171, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 640px;
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
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.5);
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

/* ===== Guarantees ===== */
.guarantees {
  padding: 70px 0;
}

.guarantees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.guarantee-card {
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 30px 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.guarantee-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border-color: var(--border-color);
}

.guarantee-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 16px;
}

.guarantee-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.guarantee-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ===== Services ===== */
.services {
  padding: 70px 0;
  background: #ffffff;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.service-card {
  background: var(--bg-main);
  border-radius: var(--radius-md);
  padding: 32px 28px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  border-color: var(--accent-blue);
}

.service-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.service-icon {
  font-size: 32px;
}

.service-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
}

.service-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-main);
}

.service-list li svg {
  flex-shrink: 0;
}

.service-link {
  display: inline-block;
  color: var(--accent-blue);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.service-link:hover {
  color: var(--accent-blue-hover);
  transform: translateX(4px);
}

/* ===== Steps ===== */
.how-it-works {
  padding: 80px 0;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
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
  background: linear-gradient(135deg, #ef4444, #dc2626);
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
  .guarantees-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .services-grid {
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

  .guarantees-grid,
  .services-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .guarantees,
  .services,
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
